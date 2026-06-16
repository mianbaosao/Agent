package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AgentPlanRequest(
    String goal,
    String level,
    @JsonProperty("auto_save") boolean autoSave
) {
}
