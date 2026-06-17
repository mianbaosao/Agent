package com.example.agentobservability.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false, unique = true)
    private String account;
    @Column(nullable = false)
    private String passwordHash;
    @Column(nullable = false)
    private String salt;
    @Column(nullable = false)
    private String role = "user";
    @Column(nullable = false)
    private LocalDateTime createdAt;
    public Integer getId() { return id; }
    public String getAccount() { return account; }
    public void setAccount(String account) { this.account = account; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getSalt() { return salt; }
    public void setSalt(String salt) { this.salt = salt; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
