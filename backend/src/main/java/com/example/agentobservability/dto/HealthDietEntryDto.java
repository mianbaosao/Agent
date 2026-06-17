package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HealthDietEntryDto(
    Integer id,
    @JsonProperty("entry_date") String entryDate,
    @JsonProperty("meal_type") String mealType,
    @JsonProperty("food_name") String foodName,
    String amount,
    Double protein,
    Double carbs,
    Double fat,
    Double calories,
    @JsonProperty("sort_order") Integer sortOrder
) {}
