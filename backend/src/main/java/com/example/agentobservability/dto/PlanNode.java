package com.example.agentobservability.dto;

import java.util.List;

public record PlanNode(
    String title,
    String description,
    String type,
    List<PlanNode> children
) {
}
