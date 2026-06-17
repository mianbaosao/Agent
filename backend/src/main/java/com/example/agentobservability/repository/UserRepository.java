package com.example.agentobservability.repository;

import com.example.agentobservability.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByAccount(String account);
    boolean existsByAccount(String account);
}
