package com.example.agentobservability.service;

import com.example.agentobservability.dto.AuthDtos.*;
import com.example.agentobservability.model.User;
import com.example.agentobservability.model.UserSession;
import com.example.agentobservability.repository.UserRepository;
import com.example.agentobservability.repository.UserSessionRepository;
import jakarta.transaction.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final UserRepository users;
    private final UserSessionRepository sessions;

    public AuthService(UserRepository users, UserSessionRepository sessions) {
        this.users = users;
        this.sessions = sessions;
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        validate(request);
        if (users.existsByAccount(request.account())) {
            throw new IllegalArgumentException("账号已存在");
        }
        return issue(createUser(request.account(), request.password(), "user"));
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        validate(request);
        User user = users.findByAccount(request.account()).orElseThrow(() -> new IllegalArgumentException("账号或密码错误"));
        if (!hash(request.password(), user.getSalt()).equals(user.getPasswordHash())) {
            throw new IllegalArgumentException("账号或密码错误");
        }
        return issue(user);
    }

    public AuthUser me(Integer userId) {
        User user = users.findById(userId).orElseThrow();
        return new AuthUser(user.getId(), user.getAccount(), user.getRole());
    }

    public Integer resolveToken(String token) {
        UserSession session = sessions.findByToken(token).orElseThrow(() -> new IllegalArgumentException("登录已失效"));
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("登录已过期");
        }
        return session.getUserId();
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedAdmin() {
        users.findByAccount("1623666966").orElseGet(() -> createUser("1623666966", "he13140303042", "admin"));
    }

    private User createUser(String account, String password, String role) {
        String salt = randomHex(16);
        User user = new User();
        user.setAccount(account);
        user.setSalt(salt);
        user.setPasswordHash(hash(password, salt));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        return users.save(user);
    }

    private AuthResponse issue(User user) {
        UserSession session = new UserSession();
        session.setUserId(user.getId());
        session.setToken(randomHex(32));
        session.setCreatedAt(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusDays(30));
        sessions.save(session);
        return new AuthResponse(session.getToken(), new AuthUser(user.getId(), user.getAccount(), user.getRole()));
    }

    private void validate(AuthRequest request) {
        if (request.account() == null || !request.account().matches("\\d{6,20}")) {
            throw new IllegalArgumentException("账号必须是 6-20 位数字");
        }
        if (request.password() == null || request.password().length() < 6 || request.password().length() > 32) {
            throw new IllegalArgumentException("密码长度必须是 6-32 位");
        }
    }

    private String randomHex(int bytes) {
        byte[] data = new byte[bytes];
        RANDOM.nextBytes(data);
        return HexFormat.of().formatHex(data);
    }

    private String hash(String password, String salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt.getBytes(), 120_000, 256);
            byte[] encoded = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(encoded);
        } catch (Exception e) {
            throw new IllegalStateException("Password hash failed", e);
        }
    }
}
