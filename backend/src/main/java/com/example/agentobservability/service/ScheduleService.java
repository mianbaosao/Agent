package com.example.agentobservability.service;

import com.example.agentobservability.config.AuthContext;
import com.example.agentobservability.dto.AgentPlanResponse;
import com.example.agentobservability.dto.PlanNode;
import com.example.agentobservability.dto.ScheduleRequest;
import com.example.agentobservability.dto.ScheduleResponse;
import com.example.agentobservability.model.Schedule;
import com.example.agentobservability.repository.ScheduleRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class ScheduleService {
    private final ScheduleRepository repository;

    public ScheduleService(ScheduleRepository repository) {
        this.repository = repository;
    }

    public List<ScheduleResponse> roots() {
        return repository.findByUserIdAndParentIdIsNullOrderBySortOrderAscIdAsc(AuthContext.userId())
            .stream()
            .map(this::toTree)
            .toList();
    }

    public List<ScheduleResponse> daily() {
        return repository.findByUserIdAndTypeOrderByDueDateAscStartTimeAscSortOrderAscIdAsc(AuthContext.userId(), "daily")
            .stream()
            .map(schedule -> toResponse(schedule, List.of()))
            .toList();
    }

    public List<ScheduleResponse> weekly() {
        return repository.findByUserIdAndTypeOrderByDueDateAscStartTimeAscSortOrderAscIdAsc(AuthContext.userId(), "weekly")
            .stream()
            .map(schedule -> toResponse(schedule, List.of()))
            .toList();
    }

    @Transactional
    public ScheduleResponse create(ScheduleRequest request) {
        Schedule schedule = new Schedule();
        schedule.setUserId(AuthContext.userId());
        applyCreate(schedule, request);
        return toTree(repository.save(schedule));
    }

    @Transactional
    public ScheduleResponse update(Integer id, ScheduleRequest request) {
        Schedule schedule = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Schedule not found: " + id));
        requireOwner(schedule);
        if (request.title() != null) {
            schedule.setTitle(request.title());
        }
        if (request.description() != null) {
            schedule.setDescription(request.description());
        }
        if (request.type() != null) {
            schedule.setType(request.type());
        }
        if (request.parentId() != null) {
            schedule.setParentId(request.parentId());
        }
        if (request.status() != null) {
            schedule.setStatus(request.status());
        }
        if (request.dueDate() != null) {
            schedule.setDueDate(request.dueDate());
        }
        if (request.startTime() != null) {
            schedule.setStartTime(request.startTime());
        }
        if (request.sortOrder() != null) {
            schedule.setSortOrder(request.sortOrder());
        }
        return toTree(repository.save(schedule));
    }

    @Transactional
    public void delete(Integer id) {
        deleteRecursive(id);
    }

    @Transactional
    public ScheduleResponse savePlan(AgentPlanResponse plan) {
        Schedule root = new Schedule();
        root.setUserId(AuthContext.userId());
        root.setGoal(plan.goal());
        root.setLevel(plan.level());
        root.setTitle(plan.goal());
        root.setDescription(plan.summary());
        root.setType(plan.level());
        root.setStatus("doing");
        root.setSortOrder((int) repository.count());
        Schedule savedRoot = repository.save(root);

        int index = 0;
        for (PlanNode child : plan.plans()) {
            savePlanNode(savedRoot.getId(), plan.goal(), plan.level(), child, index++);
        }
        return toTree(savedRoot);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedMockData() {
        if (repository.count() > 0) {
            return;
        }
        Schedule yearly = newSchedule(null, "2026年我要学完Java后端开发", "yearly",
            "2026年学完Java后端开发", "从 Spring Boot、数据库、接口联调到部署观测，形成完整后端能力。",
            "yearly", 0, "doing", null, null);
        repository.save(yearly);

        Schedule q1 = repository.save(newSchedule(yearly.getId(), yearly.getGoal(), yearly.getLevel(),
            "Q1：Spring Boot 与 Web 基础", "掌握 REST API、分层结构和本地调试。", "monthly", 0, "doing", null, null));
        Schedule q2 = repository.save(newSchedule(yearly.getId(), yearly.getGoal(), yearly.getLevel(),
            "Q2：数据库与工程化", "学习 JPA、迁移、测试和接口契约。", "monthly", 1, "todo", null, null));
        Schedule q3 = repository.save(newSchedule(yearly.getId(), yearly.getGoal(), yearly.getLevel(),
            "Q3：部署与可观测", "完成日志、WebSocket、监控和告警实践。", "monthly", 2, "todo", null, null));

        seedDaily(q1, "学习 Spring Boot 路由", "08:00", "done", 0);
        seedDaily(q1, "完成 Agent 联调", "10:00", "todo", 1);
        seedDaily(q1, "复盘并整理笔记", "18:00", "todo", 2);
        seedDaily(q2, "设计 Schedule 表结构", "09:00", "todo", 0);
        seedDaily(q2, "实现 CRUD API", "14:00", "todo", 1);
        seedDaily(q3, "接入执行观测事件", "11:00", "todo", 0);
    }

    private void applyCreate(Schedule schedule, ScheduleRequest request) {
        schedule.setTitle(request.title());
        schedule.setDescription(request.description() == null ? "" : request.description());
        schedule.setType(request.type() == null ? "daily" : request.type());
        schedule.setParentId(request.parentId());
        schedule.setStatus(request.status() == null ? "todo" : request.status());
        schedule.setDueDate(request.dueDate());
        schedule.setStartTime(request.startTime());
        schedule.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
    }

    private void savePlanNode(Integer parentId, String goal, String level, PlanNode node, int sortOrder) {
        Schedule schedule = newSchedule(parentId, goal, level, node.title(), node.description(), node.type(), sortOrder,
            "todo", null, null);
        Schedule saved = repository.save(schedule);
        int index = 0;
        for (PlanNode child : node.children()) {
            savePlanNode(saved.getId(), goal, level, child, index++);
        }
    }

    private void deleteRecursive(Integer id) {
        for (Schedule child : repository.findByUserIdAndParentIdOrderBySortOrderAscIdAsc(AuthContext.userId(), id)) {
            deleteRecursive(child.getId());
        }
        Schedule schedule = repository.findById(id).orElseThrow();
        requireOwner(schedule);
        repository.delete(schedule);
    }

    private void requireOwner(Schedule schedule) {
        if (!AuthContext.userId().equals(schedule.getUserId())) {
            throw new IllegalArgumentException("Schedule not found: " + schedule.getId());
        }
    }

    private ScheduleResponse toTree(Schedule schedule) {
        List<ScheduleResponse> children = repository.findByUserIdAndParentIdOrderBySortOrderAscIdAsc(AuthContext.userId(), schedule.getId())
            .stream()
            .map(this::toTree)
            .toList();
        return toResponse(schedule, children);
    }

    private ScheduleResponse toResponse(Schedule schedule, List<ScheduleResponse> children) {
        return new ScheduleResponse(
            schedule.getId(),
            schedule.getParentId(),
            schedule.getGoal(),
            schedule.getLevel(),
            schedule.getTitle(),
            schedule.getDescription(),
            schedule.getType(),
            schedule.getStatus(),
            schedule.getDueDate(),
            schedule.getStartTime(),
            schedule.getSortOrder(),
            children
        );
    }

    private void seedDaily(Schedule parent, String title, String time, String status, int sortOrder) {
        repository.save(newSchedule(parent.getId(), parent.getGoal(), parent.getLevel(), title,
            "可在今日任务中新增、修改、删除或调整状态。", "daily", sortOrder, status, "2026-01-01", time));
    }

    private Schedule newSchedule(Integer parentId, String goal, String level, String title, String description,
                                 String type, int sortOrder, String status, String dueDate, String startTime) {
        Schedule schedule = new Schedule();
        schedule.setUserId(AuthContext.userId());
        schedule.setParentId(parentId);
        schedule.setGoal(goal);
        schedule.setLevel(level);
        schedule.setTitle(title);
        schedule.setDescription(description);
        schedule.setType(type);
        schedule.setSortOrder(sortOrder);
        schedule.setStatus(status);
        schedule.setDueDate(dueDate);
        schedule.setStartTime(startTime);
        return schedule;
    }
}
