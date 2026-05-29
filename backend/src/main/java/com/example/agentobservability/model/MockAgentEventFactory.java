package com.example.agentobservability.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public final class MockAgentEventFactory {
    private static final AtomicInteger INDEX = new AtomicInteger(0);
    private static final String TASK_ID = "task-abtest-001";

    private MockAgentEventFactory() {
    }

    public static AgentEvent next() {
        int value = INDEX.getAndUpdate(current -> (current + 1) % 4);
        Instant timestamp = Instant.now();
        return switch (value) {
            case 0 -> event("backend-event-1", "log.appended", "node-product-query", "info", "后端推送：商品查询仍在执行", timestamp, null);
            case 1 -> event("backend-event-2", "node.completed", "node-product-query", "success", "后端推送：商品查询完成", timestamp,
                    Map.of("currentNodeId", "node-openclaw", "currentToolName", "OpenClawMobileTool", "node", Map.of(
                            "id", "node-product-query",
                            "status", "success",
                            "endedAt", timestamp.toString(),
                            "durationMs", 12000
                    )));
            case 2 -> event("backend-event-3", "node.started", "node-openclaw", "info", "后端推送：启动手机操作", timestamp,
                    Map.of("currentNodeId", "node-openclaw", "currentToolName", "OpenClawMobileTool", "node", Map.of(
                            "id", "node-openclaw",
                            "status", "running",
                            "startedAt", timestamp.toString()
                    )));
            default -> event("backend-event-4", "log.appended", "node-openclaw", "info", "后端推送：等待移动端页面稳定", timestamp, null);
        };
    }

    private static AgentEvent event(
            String id,
            String type,
            String nodeId,
            String level,
            String message,
            Instant timestamp,
            Map<String, Object> patch
    ) {
        AgentLogEntry log = new AgentLogEntry(
                id + "-log",
                timestamp,
                level,
                message,
                nodeId,
                TASK_ID
        );
        return new AgentEvent(id, type, TASK_ID, nodeId, timestamp, level.equals("success") ? "success" : null, log, patch);
    }
}
