package com.example.agentobservability.controller;

import com.example.agentobservability.dto.AgentPlanRequest;
import com.example.agentobservability.dto.AgentPlanResponse;
import com.example.agentobservability.dto.ScheduleResponse;
import com.example.agentobservability.service.PlannerService;
import com.example.agentobservability.service.ScheduleService;
import com.example.agentobservability.ws.AgentEventWebSocketHandler;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AgentController {
    private final PlannerService plannerService;
    private final ScheduleService scheduleService;
    private final AgentEventWebSocketHandler websocket;

    public AgentController(PlannerService plannerService, ScheduleService scheduleService, AgentEventWebSocketHandler websocket) {
        this.plannerService = plannerService;
        this.scheduleService = scheduleService;
        this.websocket = websocket;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/")
    public Map<String, String> index() {
        return Map.of("service", "agent-observability-backend", "status", "ok");
    }

    @PostMapping("/agent/plan")
    public Object generatePlan(@RequestBody AgentPlanRequest request) {
        String taskId = "plan-" + UUID.randomUUID();
        Instant startedAt = Instant.now();
        List<String> nodeIds = request.autoSave()
            ? List.of("receive-goal", "generate-plan", "save-schedule")
            : List.of("receive-goal", "generate-plan");

        broadcastTaskStarted(taskId, request, startedAt, nodeIds);
        broadcastNode(taskId, "receive-goal", "node.completed", "success", "目标输入已接收", startedAt, Duration.ofMillis(80));
        broadcastNode(taskId, "generate-plan", "node.started", "running", "正在生成结构化计划", Instant.now(), null);

        AgentPlanResponse plan = plannerService.generatePlan(request.goal(), request.level());

        broadcastNode(taskId, "generate-plan", "node.completed", "success", "计划生成完成", Instant.now(), Duration.ofMillis(360));
        if (!request.autoSave()) {
            broadcastTaskCompleted(taskId, startedAt, "生成计划完成，未写入数据库");
            return plan;
        }

        broadcastNode(taskId, "save-schedule", "node.started", "running", "正在递归保存到 Schedule 表", Instant.now(), null);
        ScheduleResponse saved = scheduleService.savePlan(plan);
        broadcastNode(taskId, "save-schedule", "node.completed", "success", "计划已保存为日程树", Instant.now(), Duration.ofMillis(240));
        broadcastTaskCompleted(taskId, startedAt, "生成计划完成，并已保存到数据库");
        return saved;
    }

    private void broadcastTaskStarted(String taskId, AgentPlanRequest request, Instant startedAt, List<String> nodeIds) {
        List<Map<String, Object>> nodes = new ArrayList<>();
        for (int index = 0; index < nodeIds.size(); index++) {
            String nodeId = nodeIds.get(index);
            nodes.add(node(taskId, nodeId, labelOf(nodeId), statusOf(index), index, nodeIds));
        }

        Map<String, Object> patch = new LinkedHashMap<>();
        patch.put("id", taskId);
        patch.put("name", "AI目标规划 Agent");
        patch.put("objective", request.goal());
        patch.put("status", "running");
        patch.put("currentNodeId", "receive-goal");
        patch.put("currentToolName", "RuleBasedPlanner");
        patch.put("startedAt", startedAt.toString());
        patch.put("nodes", nodes);
        patch.put("logs", List.of(log(taskId, null, "info", "开始执行目标规划：" + request.goal())));
        patch.put("tags", List.of("planning", request.level(), request.autoSave() ? "auto-save" : "preview"));

        websocket.broadcast(event(taskId, null, "task.started", "running", startedAt, patch,
            log(taskId, null, "info", "Agent 已开始拆解目标")));
    }

    private void broadcastNode(String taskId, String nodeId, String type, String status, String message,
                               Instant timestamp, Duration duration) {
        Map<String, Object> nodePatch = new LinkedHashMap<>();
        nodePatch.put("id", nodeId);
        nodePatch.put("status", status);
        nodePatch.put("startedAt", timestamp.minusMillis(duration == null ? 0 : duration.toMillis()).toString());
        if (duration != null) {
            nodePatch.put("endedAt", timestamp.toString());
            nodePatch.put("durationMs", duration.toMillis());
        }
        nodePatch.put("toolCall", toolCall(taskId, nodeId, status, message, timestamp, duration));

        Map<String, Object> patch = new LinkedHashMap<>();
        patch.put("status", "running");
        patch.put("currentNodeId", nodeId);
        patch.put("currentToolName", toolNameOf(nodeId));
        patch.put("node", nodePatch);

        websocket.broadcast(event(taskId, nodeId, type, status, timestamp, patch,
            log(taskId, nodeId, status.equals("success") ? "success" : "info", message)));
    }

    private void broadcastTaskCompleted(String taskId, Instant startedAt, String message) {
        Instant endedAt = Instant.now();
        Map<String, Object> patch = new LinkedHashMap<>();
        patch.put("status", "success");
        patch.put("endedAt", endedAt.toString());
        patch.put("durationMs", Duration.between(startedAt, endedAt).toMillis());
        websocket.broadcast(event(taskId, null, "task.completed", "success", endedAt, patch,
            log(taskId, null, "success", message)));
    }

    private Map<String, Object> event(String taskId, String nodeId, String type, String status, Instant timestamp,
                                      Map<String, Object> patch, Map<String, Object> log) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("id", "evt-" + UUID.randomUUID());
        event.put("type", type);
        event.put("taskId", taskId);
        event.put("nodeId", nodeId);
        event.put("timestamp", timestamp.toString());
        event.put("status", status);
        event.put("patch", patch);
        event.put("log", log);
        return event;
    }

    private Map<String, Object> node(String taskId, String nodeId, String label, String status, int index, List<String> nodeIds) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", nodeId);
        node.put("taskId", taskId);
        node.put("label", label);
        node.put("description", descriptionOf(nodeId));
        node.put("status", status);
        node.put("parentIds", index == 0 ? List.of() : List.of(nodeIds.get(index - 1)));
        node.put("nextIds", index == nodeIds.size() - 1 ? List.of() : List.of(nodeIds.get(index + 1)));
        node.put("position", Map.of("x", 120 + index * 260, "y", 160));
        return node;
    }

    private Map<String, Object> toolCall(String taskId, String nodeId, String status, String message,
                                         Instant timestamp, Duration duration) {
        Map<String, Object> tool = new LinkedHashMap<>();
        tool.put("id", "tool-" + nodeId);
        tool.put("nodeId", nodeId);
        tool.put("name", toolNameOf(nodeId));
        tool.put("reason", descriptionOf(nodeId));
        tool.put("input", Map.of("nodeId", nodeId));
        tool.put("output", Map.of("message", message));
        tool.put("logs", List.of(log(taskId, nodeId, status.equals("success") ? "success" : "info", message)));
        tool.put("durationMs", duration == null ? null : duration.toMillis());
        tool.put("tokenUsage", Map.of("promptTokens", 0, "completionTokens", 0, "totalTokens", 0));
        tool.put("startedAt", timestamp.minusMillis(duration == null ? 0 : duration.toMillis()).toString());
        tool.put("endedAt", duration == null ? null : timestamp.toString());
        tool.put("status", status);
        return tool;
    }

    private Map<String, Object> log(String taskId, String nodeId, String level, String message) {
        Map<String, Object> log = new LinkedHashMap<>();
        log.put("id", "log-" + UUID.randomUUID());
        log.put("timestamp", Instant.now().toString());
        log.put("level", level);
        log.put("message", message);
        log.put("nodeId", nodeId);
        log.put("taskId", taskId);
        return log;
    }

    private String statusOf(int index) {
        return index == 0 ? "running" : "pending";
    }

    private String labelOf(String nodeId) {
        return switch (nodeId) {
            case "receive-goal" -> "接收目标";
            case "generate-plan" -> "生成规划";
            case "save-schedule" -> "保存日程";
            default -> nodeId;
        };
    }

    private String descriptionOf(String nodeId) {
        return switch (nodeId) {
            case "receive-goal" -> "校验目标文本、规划层级和自动保存参数。";
            case "generate-plan" -> "使用本地规则规划器生成年度、月度、周度和日任务结构。";
            case "save-schedule" -> "将规划结果递归写入 Schedule 表，并维护 parent_id 父子关系。";
            default -> "执行 Agent 节点。";
        };
    }

    private String toolNameOf(String nodeId) {
        return switch (nodeId) {
            case "receive-goal" -> "RequestValidator";
            case "generate-plan" -> "RuleBasedPlanner";
            case "save-schedule" -> "ScheduleRepository";
            default -> "AgentTool";
        };
    }
}
