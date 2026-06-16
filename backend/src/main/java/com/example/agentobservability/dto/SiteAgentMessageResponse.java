package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record SiteAgentMessageResponse(
    Integer id,
    String role,
    String content,
    String action,
    @JsonProperty("schedule_id") Integer scheduleId,
    @JsonProperty("created_at") LocalDateTime createdAt
) {
}
