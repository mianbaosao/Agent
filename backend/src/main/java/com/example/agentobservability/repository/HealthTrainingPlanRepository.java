package com.example.agentobservability.repository;

import com.example.agentobservability.model.HealthTrainingPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthTrainingPlanRepository extends JpaRepository<HealthTrainingPlan, Integer> {
    List<HealthTrainingPlan> findByPlanDateOrderBySortOrderAscIdAsc(String planDate);
    List<HealthTrainingPlan> findByUserIdAndPlanDateOrderBySortOrderAscIdAsc(Integer userId, String planDate);
}
