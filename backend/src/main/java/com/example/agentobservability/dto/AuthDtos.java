package com.example.agentobservability.dto;

public class AuthDtos {
    public record AuthRequest(String account, String password) {}
    public record AuthUser(Integer id, String account, String role) {}
    public record AuthResponse(String token, AuthUser user) {}
}
