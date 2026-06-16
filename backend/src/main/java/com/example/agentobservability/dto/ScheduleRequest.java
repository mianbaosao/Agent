package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScheduleRequest(
    String title,
    String description,
    String type,
    @JsonProperty("parent_id") Integer parentId,
    String status,
    @JsonProperty("due_date") String dueDate,
    @JsonProperty("start_time") String startTime,
    @JsonProperty("sort_order") Integer sortOrder
) {
}
