package com.example.agentobservability.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_profiles")
public class HealthProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false)
    private Integer userId = 1;
    private Double currentWeight;
    private Double targetWeight;
    private Double dailyProtein;
    private Double dailyCarbs;
    private Double dailyFat;
    private Double dailyCalories;
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    public Integer getId() { return id; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public Double getCurrentWeight() { return currentWeight; }
    public void setCurrentWeight(Double currentWeight) { this.currentWeight = currentWeight; }
    public Double getTargetWeight() { return targetWeight; }
    public void setTargetWeight(Double targetWeight) { this.targetWeight = targetWeight; }
    public Double getDailyProtein() { return dailyProtein; }
    public void setDailyProtein(Double dailyProtein) { this.dailyProtein = dailyProtein; }
    public Double getDailyCarbs() { return dailyCarbs; }
    public void setDailyCarbs(Double dailyCarbs) { this.dailyCarbs = dailyCarbs; }
    public Double getDailyFat() { return dailyFat; }
    public void setDailyFat(Double dailyFat) { this.dailyFat = dailyFat; }
    public Double getDailyCalories() { return dailyCalories; }
    public void setDailyCalories(Double dailyCalories) { this.dailyCalories = dailyCalories; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
