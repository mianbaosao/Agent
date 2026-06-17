package com.example.agentobservability.model;

import jakarta.persistence.*;

@Entity
@Table(name = "health_weight_records")
public class HealthWeightRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false)
    private Integer userId = 1;
    @Column(nullable = false)
    private String recordDate;
    @Column(nullable = false)
    private Double weight;
    private String note;
    public Integer getId() { return id; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getRecordDate() { return recordDate; }
    public void setRecordDate(String recordDate) { this.recordDate = recordDate; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
