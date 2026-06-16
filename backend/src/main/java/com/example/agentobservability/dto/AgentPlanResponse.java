package com.example.agentobservability.dto;

import java.util.List;

public record AgentPlanResponse(
    String goal,
    String level,
    String summary,
    List<PlanNode> plans
) {
}
