package com.example.agentobservability.repository;

import com.example.agentobservability.model.UserSession;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSessionRepository extends JpaRepository<UserSession, Integer> {
    Optional<UserSession> findByToken(String token);
}
