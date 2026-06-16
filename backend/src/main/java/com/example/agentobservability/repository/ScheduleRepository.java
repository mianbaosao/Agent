package com.example.agentobservability.repository;

import com.example.agentobservability.model.Schedule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    List<Schedule> findByParentIdIsNullOrderBySortOrderAscIdAsc();

    List<Schedule> findByParentIdOrderBySortOrderAscIdAsc(Integer parentId);

    List<Schedule> findByTypeOrderByDueDateAscStartTimeAscSortOrderAscIdAsc(String type);
}
