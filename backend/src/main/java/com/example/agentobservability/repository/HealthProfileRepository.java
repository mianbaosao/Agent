package com.example.agentobservability.repository;

import com.example.agentobservability.model.HealthProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthProfileRepository extends JpaRepository<HealthProfile, Integer> {
    Optional<HealthProfile> findByUserId(Integer userId);
}
