package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HealthWeightRecordDto(
    Integer id,
    @JsonProperty("record_date") String recordDate,
    Double weight,
    String note
) {}
