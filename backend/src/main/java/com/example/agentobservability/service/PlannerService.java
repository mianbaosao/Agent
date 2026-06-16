package com.example.agentobservability.service;

import com.example.agentobservability.dto.AgentPlanResponse;
import com.example.agentobservability.dto.PlanNode;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PlannerService {
    public AgentPlanResponse generatePlan(String goal, String level) {
        String normalizedLevel = normalizeLevel(level);
        return new AgentPlanResponse(
            goal,
            normalizedLevel,
            "已根据目标层级生成结构化计划，可继续拆解、调整并保存为日程任务。",
            switch (normalizedLevel) {
                case "yearly" -> yearlyPlan(goal);
                case "monthly" -> monthlyPlan(goal, 1);
                case "weekly" -> weeklyPlan(goal, 1, 1);
                case "daily" -> dailyPlan(goal, 1, 1, 1);
                default -> dailyPlan(goal, 1, 1, 1);
            }
        );
    }

    private String normalizeLevel(String level) {
        if (level == null || level.isBlank()) {
            return "yearly";
        }
        return switch (level) {
            case "yearly", "monthly", "weekly", "daily" -> level;
            default -> "yearly";
        };
    }

    private List<PlanNode> yearlyPlan(String goal) {
        List<PlanNode> nodes = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            nodes.add(new PlanNode(
                month + "月目标：推进「" + goal + "」",
                "聚焦一个阶段主题，形成稳定输入、练习和复盘节奏。",
                "monthly",
                monthlyPlan(goal, month)
            ));
        }
        return nodes;
    }

    private List<PlanNode> monthlyPlan(String goal, int month) {
        List<PlanNode> nodes = new ArrayList<>();
        for (int week = 1; week <= 4; week++) {
            nodes.add(new PlanNode(
                "第" + week + "周计划",
                "围绕「" + goal + "」完成本周学习、实践和复盘闭环。",
                "weekly",
                weeklyPlan(goal, month, week)
            ));
        }
        return nodes;
    }

    private List<PlanNode> weeklyPlan(String goal, int month, int week) {
        List<PlanNode> nodes = new ArrayList<>();
        for (int day = 1; day <= 7; day++) {
            nodes.add(new PlanNode(
                "第" + day + "天任务",
                "用 60-90 分钟推进「" + goal + "」，完成一个可验证的小成果。",
                "daily",
                List.of()
            ));
        }
        return nodes;
    }

    private List<PlanNode> dailyPlan(String goal, int month, int week, int day) {
        return List.of(
            new PlanNode("明确今日重点", "写下今天和「" + goal + "」最相关的一件关键任务。", "daily", List.of()),
            new PlanNode("完成专注执行", "安排一段不被打扰的时间，产出可检查的结果。", "daily", List.of()),
            new PlanNode("复盘并记录", "记录完成情况、卡点和明天的下一步。", "daily", List.of())
        );
    }
}
