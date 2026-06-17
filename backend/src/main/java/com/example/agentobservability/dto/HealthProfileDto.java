package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HealthProfileDto(
    Integer id,
    @JsonProperty("current_weight") Double currentWeight,
    @JsonProperty("target_weight") Double targetWeight,
    @JsonProperty("daily_protein") Double dailyProtein,
    @JsonProperty("daily_carbs") Double dailyCarbs,
    @JsonProperty("daily_fat") Double dailyFat,
    @JsonProperty("daily_calories") Double dailyCalories
) {}
