package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SiteAgentResponse(
    String reply,
    String action,
    @JsonProperty("schedule_id") Integer scheduleId
) {
}
