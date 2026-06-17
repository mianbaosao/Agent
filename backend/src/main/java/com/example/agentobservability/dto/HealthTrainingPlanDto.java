package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HealthTrainingPlanDto(
    Integer id,
    @JsonProperty("plan_date") String planDate,
    String title,
    String description,
    String status,
    @JsonProperty("sort_order") Integer sortOrder
) {}
