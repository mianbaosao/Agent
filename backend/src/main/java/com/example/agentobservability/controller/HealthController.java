package com.example.agentobservability.controller;

import com.example.agentobservability.dto.*;
import com.example.agentobservability.service.HealthService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/health-center")
public class HealthController {
    private final HealthService service;
    public HealthController(HealthService service) { this.service = service; }

    @GetMapping("/profile")
    public HealthProfileDto profile() { return service.profile(); }

    @PutMapping("/profile")
    public HealthProfileDto updateProfile(@RequestBody HealthProfileDto dto) { return service.updateProfile(dto); }

    @GetMapping("/diet")
    public List<HealthDietEntryDto> diets(@RequestParam String date) { return service.diets(date); }

    @PostMapping("/diet")
    public HealthDietEntryDto createDiet(@RequestBody HealthDietEntryDto dto) { return service.createDiet(dto); }

    @PutMapping("/diet/{id}")
    public HealthDietEntryDto updateDiet(@PathVariable Integer id, @RequestBody HealthDietEntryDto dto) { return service.updateDiet(id, dto); }

    @DeleteMapping("/diet/{id}")
    public java.util.Map<String, Boolean> deleteDiet(@PathVariable Integer id) { service.deleteDiet(id); return java.util.Map.of("ok", true); }

    @GetMapping("/foods")
    public List<HealthFoodItemDto> foods() { return service.foods(); }

    @PostMapping("/foods")
    public HealthFoodItemDto createFood(@RequestBody HealthFoodItemDto dto) { return service.createFood(dto); }

    @PutMapping("/foods/{id}")
    public HealthFoodItemDto updateFood(@PathVariable Integer id, @RequestBody HealthFoodItemDto dto) { return service.updateFood(id, dto); }

    @DeleteMapping("/foods/{id}")
    public java.util.Map<String, Boolean> deleteFood(@PathVariable Integer id) { service.deleteFood(id); return java.util.Map.of("ok", true); }

    @GetMapping("/training")
    public List<HealthTrainingPlanDto> trainings(@RequestParam String date) { return service.trainings(date); }

    @PostMapping("/training")
    public HealthTrainingPlanDto createTraining(@RequestBody HealthTrainingPlanDto dto) { return service.createTraining(dto); }

    @PutMapping("/training/{id}")
    public HealthTrainingPlanDto updateTraining(@PathVariable Integer id, @RequestBody HealthTrainingPlanDto dto) { return service.updateTraining(id, dto); }

    @DeleteMapping("/training/{id}")
    public java.util.Map<String, Boolean> deleteTraining(@PathVariable Integer id) { service.deleteTraining(id); return java.util.Map.of("ok", true); }

    @GetMapping("/weights")
    public List<HealthWeightRecordDto> weights() { return service.weights(); }

    @PostMapping("/weights")
    public HealthWeightRecordDto upsertWeight(@RequestBody HealthWeightRecordDto dto) { return service.upsertWeight(dto); }

    @DeleteMapping("/weights/{id}")
    public java.util.Map<String, Boolean> deleteWeight(@PathVariable Integer id) { service.deleteWeight(id); return java.util.Map.of("ok", true); }
}
