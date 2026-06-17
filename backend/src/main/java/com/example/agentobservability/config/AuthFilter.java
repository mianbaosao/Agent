package com.example.agentobservability.config;

import com.example.agentobservability.service.AuthService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;

@Component
public class AuthFilter implements Filter {
    private final AuthService authService;
    public AuthFilter(AuthService authService) { this.authService = authService; }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest http = (HttpServletRequest) request;
        String path = http.getRequestURI();
        boolean publicAuthPath = path.equals("/auth/login") || path.equals("/auth/register");
        if ("OPTIONS".equalsIgnoreCase(http.getMethod()) || publicAuthPath || path.equals("/health") || path.startsWith("/ws/")) {
            chain.doFilter(request, response);
            return;
        }
        try {
            String header = http.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                ((HttpServletResponse) response).sendError(401, "Unauthorized");
                return;
            }
            AuthContext.setUserId(authService.resolveToken(header.substring(7)));
            chain.doFilter(request, response);
        } catch (Exception e) {
            ((HttpServletResponse) response).sendError(401, "Unauthorized");
        } finally {
            AuthContext.clear();
        }
    }
}
