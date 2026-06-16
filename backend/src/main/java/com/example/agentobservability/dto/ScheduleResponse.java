package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScheduleResponse(
    Integer id,
    @JsonProperty("parent_id") Integer parentId,
    String goal,
    String level,
    String title,
    String description,
    String type,
    String status,
    @JsonProperty("due_date") String dueDate,
    @JsonProperty("start_time") String startTime,
    @JsonProperty("sort_order") Integer sortOrder,
    List<ScheduleResponse> children
) {
}
