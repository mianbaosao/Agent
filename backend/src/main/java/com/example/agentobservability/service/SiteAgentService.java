package com.example.agentobservability.service;

import com.example.agentobservability.dto.ScheduleRequest;
import com.example.agentobservability.dto.ScheduleResponse;
import com.example.agentobservability.dto.SiteAgentMessageResponse;
import com.example.agentobservability.dto.SiteAgentRequest;
import com.example.agentobservability.dto.SiteAgentResponse;
import com.example.agentobservability.model.SiteAgentMessage;
import com.example.agentobservability.model.Schedule;
import com.example.agentobservability.repository.SiteAgentMessageRepository;
import com.example.agentobservability.repository.ScheduleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import jakarta.transaction.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SiteAgentService {
    private final ScheduleService scheduleService;
    private final ScheduleRepository scheduleRepository;
    private final SiteAgentMessageRepository messageRepository;
    private final ObjectMapper objectMapper;
    private final ChatLanguageModel model;

    public SiteAgentService(
        ScheduleService scheduleService,
        ScheduleRepository scheduleRepository,
        SiteAgentMessageRepository messageRepository,
        ObjectMapper objectMapper,
        @Value("${site-agent.openai.api-key}") String apiKey,
        @Value("${site-agent.openai.base-url}") String baseUrl,
        @Value("${site-agent.openai.model}") String modelName
    ) {
        this.scheduleService = scheduleService;
        this.scheduleRepository = scheduleRepository;
        this.messageRepository = messageRepository;
        this.objectMapper = objectMapper;
        this.model = OpenAiChatModel.builder()
            .apiKey(apiKey)
            .baseUrl(baseUrl)
            .modelName(modelName)
            .temperature(0.1)
            .build();
    }

    @Transactional
    public SiteAgentResponse chat(SiteAgentRequest request) {
        LocalDate date = parseDate(request.date());
        saveMessage("user", request.message(), null, null);
        AgentAction action = resolveAction(request.message(), date);
        SiteAgentResponse response = execute(action, date);
        saveMessage("agent", response.reply(), response.action(), response.scheduleId());
        return response;
    }

    public List<SiteAgentMessageResponse> recentMessages() {
        return messageRepository.findTop20ByOrderByCreatedAtDesc()
            .stream()
            .sorted(Comparator.comparing(SiteAgentMessage::getCreatedAt).thenComparing(SiteAgentMessage::getId))
            .map(message -> new SiteAgentMessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                message.getAction(),
                message.getScheduleId(),
                message.getCreatedAt()
            ))
            .toList();
    }

    private AgentAction resolveAction(String message, LocalDate date) {
        try {
            return parseAction(model.generate(prompt(message, date)));
        } catch (Exception ignored) {
            return fallbackAction(message, date);
        }
    }

    private String prompt(String message, LocalDate date) {
        return """
            你是站内日程 Agent。你的第一步是理解用户真实意图，然后再决定是否调用工具。
            今天日期是 %s，本周周一是 %s。

            你必须只输出严格 JSON，不要 Markdown，不要解释。
            可用工具：
            - addDailyTask(title, date)
            - deleteDailyTask(title, date)
            - addWeeklyTask(title, week_start)
            - deleteWeeklyTask(title, week_start)
            - queryDailyTasks(date)
            - queryWeeklyTasks(week_start)
            - updateDailyTask(match_title, title, status, date, start_time)
            - updateWeeklyTask(match_title, title, status, week_start)
            - none()

            规则：
            - 只有用户明确表达“新增/添加/创建/安排/记一下/帮我加/删除/移除/去掉/取消/查询/看看/列出/有什么/改成/修改/更新/标记/完成”等任务操作意图时，才选择工具。
            - 如果用户只是聊天、询问能力、表达想法、问候、复盘、解释需求、模糊说“我想学习”但没有要求写入或删除任务，tool 必须是 none。
            - 如果语义上是在创建任务，即使没有固定关键词也可以新增；例如“记一下今晚复盘项目”是 addDailyTask。
            - 如果语义上只是在讨论目标，不要新增；例如“我今天想学 Java 你觉得怎么样”是 none。
            - title 只能是任务本身，不要包含“加一个”“新增”“今天的任务”“每日任务”“周任务”“本周任务”等指令词。
            - 例如用户说“加一个今天的任务背单词”，title 必须是“背单词”。
            - 如果用户说“加一个今天的任务XXX”，只提取 XXX。
            - 删除时 title 填写要匹配的任务关键词。
            - 查询时不需要 title。
            - 修改时 match_title 填写原任务关键词；title 只在用户要求改标题时填写，否则为空；status 可选 todo/doing/done。
            - 不要臆造时间；date 没有明确日期时用今天，week_start 没有明确周时用本周周一。

            JSON 格式：
            {
              "tool": "addDailyTask | deleteDailyTask | addWeeklyTask | deleteWeeklyTask | queryDailyTasks | queryWeeklyTasks | updateDailyTask | updateWeeklyTask | none",
              "title": "纯任务标题",
              "match_title": "要匹配的原任务关键词，修改/删除时使用",
              "status": "todo | doing | done，修改状态时使用",
              "start_time": "HH:mm，只有明确提到时间时填写",
              "date": "yyyy-MM-dd，仅每日任务使用；没有就用今天",
              "week_start": "yyyy-MM-dd，仅周任务使用；没有就用本周周一",
              "reply": "给用户的简短中文反馈"
            }

            用户输入：%s
            """.formatted(date, weekStart(date), message);
    }

    private AgentAction parseAction(String raw) throws Exception {
        String normalized = raw.replace("```json", "").replace("```", "").trim();
        int start = normalized.indexOf('{');
        int end = normalized.lastIndexOf('}');
        if (start >= 0 && end > start) {
            normalized = normalized.substring(start, end + 1);
        }
        JsonNode node = objectMapper.readTree(normalized);
        String tool = text(node, "tool", text(node, "action", "none"));
        return new AgentAction(
            normalizeToolName(tool),
            sanitizeTitle(text(node, "title", "")),
            sanitizeTitle(text(node, "match_title", "")),
            normalizeStatus(text(node, "status", "")),
            text(node, "start_time", ""),
            text(node, "date", ""),
            text(node, "week_start", ""),
            text(node, "reply", "我理解了。")
        );
    }

    private SiteAgentResponse execute(AgentAction action, LocalDate fallbackDate) {
        String normalizedAction = action.action();
        String title = action.title().trim();
        if ("none".equals(normalizedAction)) {
            return new SiteAgentResponse(action.reply().isBlank() ? "我还没识别出要操作的任务。" : action.reply(), "none", null);
        }
        if (title.isBlank() && List.of("addDailyTask", "addWeeklyTask", "deleteDailyTask", "deleteWeeklyTask").contains(normalizedAction)) {
            return new SiteAgentResponse(action.reply().isBlank() ? "我还没识别出具体任务内容。" : action.reply(), "none", null);
        }

        return switch (normalizedAction) {
            case "addDailyTask" -> addDailyTask(action, fallbackDate);
            case "addWeeklyTask" -> addWeeklyTask(action, fallbackDate);
            case "deleteDailyTask" -> deleteByTypeAndDate("daily", title, parseDateOrDefault(action.date(), fallbackDate), action.reply());
            case "deleteWeeklyTask" -> deleteByTypeAndDate("weekly", title, parseDateOrDefault(action.weekStart(), weekStart(fallbackDate)), action.reply());
            case "queryDailyTasks" -> queryByTypeAndDate("daily", parseDateOrDefault(action.date(), fallbackDate));
            case "queryWeeklyTasks" -> queryByTypeAndDate("weekly", parseDateOrDefault(action.weekStart(), weekStart(fallbackDate)));
            case "updateDailyTask" -> updateByTypeAndDate("daily", action, parseDateOrDefault(action.date(), fallbackDate));
            case "updateWeeklyTask" -> updateByTypeAndDate("weekly", action, parseDateOrDefault(action.weekStart(), weekStart(fallbackDate)));
            default -> new SiteAgentResponse("我暂时支持新增、删除、查询和修改每日任务/周任务。", "none", null);
        };
    }

    private SiteAgentResponse addDailyTask(AgentAction action, LocalDate fallbackDate) {
        LocalDate date = parseDateOrDefault(action.date(), fallbackDate);
        ScheduleResponse saved = scheduleService.create(new ScheduleRequest(
            action.title(),
            "站内 Agent 创建的每日任务。",
            "daily",
            null,
            "todo",
            date.toString(),
            null,
            0
        ));
        return new SiteAgentResponse(action.reply().isBlank() ? "已添加到每日任务：" + action.title() : action.reply(), "addDailyTask", saved.id());
    }

    private SiteAgentResponse addWeeklyTask(AgentAction action, LocalDate fallbackDate) {
        LocalDate weekStart = parseDateOrDefault(action.weekStart(), weekStart(fallbackDate));
        ScheduleResponse saved = scheduleService.create(new ScheduleRequest(
            action.title(),
            "站内 Agent 创建的周任务。",
            "weekly",
            null,
            "todo",
            weekStart.toString(),
            null,
            0
        ));
        return new SiteAgentResponse(action.reply().isBlank() ? "已添加到本周任务：" + action.title() : action.reply(), "addWeeklyTask", saved.id());
    }

    private SiteAgentResponse deleteByTypeAndDate(String type, String title, LocalDate date, String reply) {
        List<Schedule> candidates = scheduleRepository.findByTypeOrderByDueDateAscStartTimeAscSortOrderAscIdAsc(type)
            .stream()
            .filter(item -> date.toString().equals(item.getDueDate()))
            .filter(item -> item.getTitle() != null && item.getTitle().contains(title))
            .sorted(Comparator.comparing(Schedule::getId))
            .toList();

        if (candidates.isEmpty()) {
            return new SiteAgentResponse("没有找到匹配的任务：" + title, "none", null);
        }
        Integer id = candidates.get(0).getId();
        scheduleService.delete(id);
        String action = "daily".equals(type) ? "deleteDailyTask" : "deleteWeeklyTask";
        return new SiteAgentResponse(reply == null || reply.isBlank() ? "已删除任务：" + candidates.get(0).getTitle() : reply, action, id);
    }

    private SiteAgentResponse queryByTypeAndDate(String type, LocalDate date) {
        List<Schedule> tasks = schedulesByTypeAndDate(type, date);
        String label = "daily".equals(type) ? "日任务" : "周任务";
        String action = "daily".equals(type) ? "queryDailyTasks" : "queryWeeklyTasks";
        if (tasks.isEmpty()) {
            return new SiteAgentResponse(date + " 暂时没有" + label + "。", action, null);
        }
        StringBuilder reply = new StringBuilder(date + " 的" + label + "：");
        for (int i = 0; i < tasks.size(); i++) {
            Schedule task = tasks.get(i);
            reply.append("\n").append(i + 1).append(". ");
            if (task.getStartTime() != null && !task.getStartTime().isBlank()) {
                reply.append(task.getStartTime()).append(" ");
            }
            reply.append(task.getTitle()).append("（").append(statusText(task.getStatus())).append("）");
        }
        return new SiteAgentResponse(reply.toString(), action, null);
    }

    private SiteAgentResponse updateByTypeAndDate(String type, AgentAction action, LocalDate date) {
        String matchTitle = action.matchTitle().isBlank() ? action.title() : action.matchTitle();
        if (matchTitle.isBlank()) {
            return new SiteAgentResponse("请告诉我要修改哪一个任务。", "none", null);
        }

        List<Schedule> candidates = schedulesByTypeAndDate(type, date)
            .stream()
            .filter(item -> item.getTitle() != null && item.getTitle().contains(matchTitle))
            .sorted(Comparator.comparing(Schedule::getId))
            .toList();

        if (candidates.isEmpty()) {
            return new SiteAgentResponse("没有找到匹配的任务：" + matchTitle, "none", null);
        }

        Schedule target = candidates.get(0);
        ScheduleRequest request = new ScheduleRequest(
            action.title().isBlank() || action.title().equals(matchTitle) ? null : action.title(),
            null,
            null,
            null,
            action.status().isBlank() ? null : action.status(),
            "daily".equals(type) ? date.toString() : null,
            "daily".equals(type) && !action.startTime().isBlank() ? action.startTime() : null,
            null
        );
        ScheduleResponse saved = scheduleService.update(target.getId(), request);
        String actionName = "daily".equals(type) ? "updateDailyTask" : "updateWeeklyTask";
        return new SiteAgentResponse("已修改任务：" + saved.title(), actionName, saved.id());
    }

    private List<Schedule> schedulesByTypeAndDate(String type, LocalDate date) {
        return scheduleRepository.findByTypeOrderByDueDateAscStartTimeAscSortOrderAscIdAsc(type)
            .stream()
            .filter(item -> date.toString().equals(item.getDueDate()))
            .sorted(Comparator.comparing((Schedule item) -> item.getStartTime() == null ? "99:99" : item.getStartTime())
                .thenComparing(Schedule::getSortOrder)
                .thenComparing(Schedule::getId))
            .toList();
    }

    private AgentAction fallbackAction(String message, LocalDate date) {
        String text = message == null ? "" : message.trim();
        boolean delete = text.contains("删除") || text.contains("移除") || text.contains("去掉") || text.contains("取消");
        boolean query = text.contains("查询")
            || text.contains("看看")
            || text.contains("看一下")
            || text.contains("列出")
            || text.contains("有什么")
            || text.contains("哪些");
        boolean update = text.contains("修改")
            || text.contains("更改")
            || text.contains("改成")
            || text.contains("更新")
            || text.contains("标记")
            || text.contains("完成了")
            || text.contains("做完了");
        boolean add = text.contains("新增")
            || text.contains("添加")
            || text.contains("创建")
            || text.contains("加一个")
            || text.contains("加下")
            || text.contains("安排")
            || text.contains("记一下")
            || text.contains("记下")
            || text.contains("帮我加");
        if (!delete && !add && !query && !update) {
            return new AgentAction(
                "none",
                "",
                "",
                "",
                "",
                date.toString(),
                weekStart(date).toString(),
                "我理解了。如果你希望我写入日程，可以直接说“添加今日任务……”或“添加本周任务……”。"
            );
        }
        boolean weekly = text.contains("周任务") || text.contains("本周") || text.contains("这周");
        if (query) {
            return new AgentAction(
                weekly ? "queryWeeklyTasks" : "queryDailyTasks",
                "",
                "",
                "",
                "",
                date.toString(),
                weekStart(date).toString(),
                ""
            );
        }
        String title = sanitizeTitle(text);
        if (title.isBlank()) {
            return new AgentAction(
                "none",
                "",
                "",
                "",
                "",
                date.toString(),
                weekStart(date).toString(),
                "我还没识别出具体任务内容。"
            );
        }
        if (update) {
            return new AgentAction(
                weekly ? "updateWeeklyTask" : "updateDailyTask",
                "",
                title,
                inferStatus(text),
                "",
                date.toString(),
                weekStart(date).toString(),
                ""
            );
        }
        String action = (delete ? "delete" : "add") + (weekly ? "WeeklyTask" : "DailyTask");
        return new AgentAction(action, title, title, "", "", date.toString(), weekStart(date).toString(), "");
    }

    private String normalizeToolName(String value) {
        return switch (value) {
            case "create_daily", "add_daily", "addDailyTask" -> "addDailyTask";
            case "create_weekly", "add_weekly", "addWeeklyTask" -> "addWeeklyTask";
            case "delete_daily", "deleteDailyTask" -> "deleteDailyTask";
            case "delete_weekly", "deleteWeeklyTask" -> "deleteWeeklyTask";
            case "query_daily", "queryDailyTasks" -> "queryDailyTasks";
            case "query_weekly", "queryWeeklyTasks" -> "queryWeeklyTasks";
            case "update_daily", "updateDailyTask" -> "updateDailyTask";
            case "update_weekly", "updateWeeklyTask" -> "updateWeeklyTask";
            default -> "none";
        };
    }

    private String normalizeStatus(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return switch (value.trim().toLowerCase()) {
            case "done", "完成", "已完成", "completed" -> "done";
            case "doing", "进行中", "in_progress" -> "doing";
            case "todo", "未完成", "待办" -> "todo";
            default -> "";
        };
    }

    private String inferStatus(String value) {
        if (value.contains("完成") || value.contains("做完")) {
            return "done";
        }
        if (value.contains("进行中")) {
            return "doing";
        }
        if (value.contains("未完成") || value.contains("待办")) {
            return "todo";
        }
        return "";
    }

    private String statusText(String value) {
        return switch (value == null ? "" : value) {
            case "done" -> "已完成";
            case "doing" -> "进行中";
            default -> "待办";
        };
    }

    private String sanitizeTitle(String value) {
        if (value == null) {
            return "";
        }
        return value
            .replaceAll("^(帮我|请|麻烦)?(加一个|加下|新增|添加|创建|删除|移除|去掉)?", "")
            .replaceAll("^(查询|看看|看一下|列出|修改|更改|更新|标记)?", "")
            .replace("今天的任务", "")
            .replace("今日任务", "")
            .replace("今天任务", "")
            .replace("每日任务", "")
            .replace("日任务", "")
            .replace("本周任务", "")
            .replace("这周任务", "")
            .replace("周任务", "")
            .replace("本周", "")
            .replace("这周", "")
            .replaceAll("^[：:，,。\\s]+", "")
            .trim();
    }

    private void saveMessage(String role, String content, String action, Integer scheduleId) {
        SiteAgentMessage message = new SiteAgentMessage();
        message.setRole(role);
        message.setContent(content == null ? "" : content);
        message.setAction(action);
        message.setScheduleId(scheduleId);
        message.setCreatedAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    private LocalDate parseDate(String value) {
        return parseDateOrDefault(value, LocalDate.now());
    }

    private LocalDate parseDateOrDefault(String value, LocalDate fallback) {
        try {
            if (value == null || value.isBlank()) {
                return fallback;
            }
            return LocalDate.parse(value);
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private LocalDate weekStart(LocalDate date) {
        return date.with(DayOfWeek.MONDAY);
    }

    private String text(JsonNode node, String key, String fallback) {
        JsonNode value = node.get(key);
        return value == null || value.isNull() ? fallback : value.asText(fallback);
    }

    private record AgentAction(
        String action,
        String title,
        String matchTitle,
        String status,
        String startTime,
        String date,
        String weekStart,
        String reply
    ) {
    }
}
