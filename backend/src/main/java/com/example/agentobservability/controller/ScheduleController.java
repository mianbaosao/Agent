package com.example.agentobservability.controller;

import com.example.agentobservability.dto.ScheduleRequest;
import com.example.agentobservability.dto.ScheduleResponse;
import com.example.agentobservability.service.ScheduleService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ScheduleController {
    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/schedules")
    public List<ScheduleResponse> schedules() {
        return scheduleService.roots();
    }

    @GetMapping("/schedules/daily")
    public List<ScheduleResponse> dailySchedules() {
        return scheduleService.daily();
    }

    @GetMapping("/schedules/weekly")
    public List<ScheduleResponse> weeklySchedules() {
        return scheduleService.weekly();
    }

    @PostMapping("/schedules")
    public ScheduleResponse createSchedule(@RequestBody ScheduleRequest request) {
        return scheduleService.create(request);
    }

    @PutMapping("/schedules/{id}")
    public ScheduleResponse updateSchedule(@PathVariable Integer id, @RequestBody ScheduleRequest request) {
        return scheduleService.update(id, request);
    }

    @DeleteMapping("/schedules/{id}")
    public Map<String, Boolean> deleteSchedule(@PathVariable Integer id) {
        scheduleService.delete(id);
        return Map.of("ok", true);
    }
}
