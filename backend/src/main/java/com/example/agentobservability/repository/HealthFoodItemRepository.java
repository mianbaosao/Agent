package com.example.agentobservability.repository;

import com.example.agentobservability.model.HealthFoodItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthFoodItemRepository extends JpaRepository<HealthFoodItem, Integer> {
    List<HealthFoodItem> findAllByOrderByNameAscIdAsc();
    List<HealthFoodItem> findByUserIdOrderByNameAscIdAsc(Integer userId);
}
