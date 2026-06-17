package com.example.agentobservability.dto;

public record HealthFoodItemDto(
    Integer id,
    String name,
    String serving,
    Double protein,
    Double carbs,
    Double fat,
    Double calories
) {}
