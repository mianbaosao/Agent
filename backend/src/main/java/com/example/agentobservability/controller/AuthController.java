package com.example.agentobservability.controller;

import com.example.agentobservability.config.AuthContext;
import com.example.agentobservability.dto.AuthDtos.*;
import com.example.agentobservability.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service) { this.service = service; }
    @PostMapping("/register")
    public AuthResponse register(@RequestBody AuthRequest request) { return service.register(request); }
    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) { return service.login(request); }
    @GetMapping("/me")
    public AuthUser me() { return service.me(AuthContext.userId()); }
}
