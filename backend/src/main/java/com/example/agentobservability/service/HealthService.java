package com.example.agentobservability.service;

import com.example.agentobservability.dto.*;
import com.example.agentobservability.config.AuthContext;
import com.example.agentobservability.model.*;
import com.example.agentobservability.repository.*;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class HealthService {
    private final HealthProfileRepository profiles;
    private final HealthDietEntryRepository diets;
    private final HealthFoodItemRepository foods;
    private final HealthTrainingPlanRepository trainings;
    private final HealthWeightRecordRepository weights;

    public HealthService(HealthProfileRepository profiles, HealthDietEntryRepository diets, HealthFoodItemRepository foods, HealthTrainingPlanRepository trainings, HealthWeightRecordRepository weights) {
        this.profiles = profiles;
        this.diets = diets;
        this.foods = foods;
        this.trainings = trainings;
        this.weights = weights;
    }

    public HealthProfileDto profile() {
        return toProfile(ensureProfile());
    }

    @Transactional
    public HealthProfileDto updateProfile(HealthProfileDto dto) {
        HealthProfile p = ensureProfile();
        if (dto.currentWeight() != null) p.setCurrentWeight(dto.currentWeight());
        if (dto.targetWeight() != null) p.setTargetWeight(dto.targetWeight());
        if (dto.dailyProtein() != null) p.setDailyProtein(dto.dailyProtein());
        if (dto.dailyCarbs() != null) p.setDailyCarbs(dto.dailyCarbs());
        if (dto.dailyFat() != null) p.setDailyFat(dto.dailyFat());
        if (dto.dailyCalories() != null) p.setDailyCalories(dto.dailyCalories());
        p.setUpdatedAt(LocalDateTime.now());
        return toProfile(profiles.save(p));
    }

    public List<HealthDietEntryDto> diets(String date) {
        return diets.findByUserIdAndEntryDateOrderBySortOrderAscIdAsc(AuthContext.userId(), date).stream().map(this::toDiet).toList();
    }

    @Transactional
    public HealthDietEntryDto createDiet(HealthDietEntryDto dto) {
        HealthDietEntry e = new HealthDietEntry();
        e.setUserId(AuthContext.userId());
        applyDiet(e, dto);
        e.setSortOrder(dto.sortOrder() == null ? diets(dto.entryDate()).size() : dto.sortOrder());
        return toDiet(diets.save(e));
    }

    @Transactional
    public HealthDietEntryDto updateDiet(Integer id, HealthDietEntryDto dto) {
        HealthDietEntry e = diets.findById(id).orElseThrow();
        requireOwner(e.getUserId());
        applyDiet(e, dto);
        return toDiet(diets.save(e));
    }

    @Transactional
    public void deleteDiet(Integer id) { HealthDietEntry e = diets.findById(id).orElseThrow(); requireOwner(e.getUserId()); diets.delete(e); }

    public List<HealthFoodItemDto> foods() {
        return foods.findByUserIdOrderByNameAscIdAsc(AuthContext.userId()).stream().map(this::toFood).toList();
    }

    @Transactional
    public HealthFoodItemDto createFood(HealthFoodItemDto dto) {
        HealthFoodItem item = new HealthFoodItem();
        item.setUserId(AuthContext.userId());
        applyFood(item, dto);
        item.setCreatedAt(LocalDateTime.now());
        return toFood(foods.save(item));
    }

    @Transactional
    public HealthFoodItemDto updateFood(Integer id, HealthFoodItemDto dto) {
        HealthFoodItem item = foods.findById(id).orElseThrow();
        requireOwner(item.getUserId());
        applyFood(item, dto);
        return toFood(foods.save(item));
    }

    @Transactional
    public void deleteFood(Integer id) { HealthFoodItem item = foods.findById(id).orElseThrow(); requireOwner(item.getUserId()); foods.delete(item); }

    public List<HealthTrainingPlanDto> trainings(String date) {
        return trainings.findByUserIdAndPlanDateOrderBySortOrderAscIdAsc(AuthContext.userId(), date).stream().map(this::toTraining).toList();
    }

    @Transactional
    public HealthTrainingPlanDto createTraining(HealthTrainingPlanDto dto) {
        HealthTrainingPlan p = new HealthTrainingPlan();
        p.setUserId(AuthContext.userId());
        applyTraining(p, dto);
        p.setSortOrder(dto.sortOrder() == null ? trainings(dto.planDate()).size() : dto.sortOrder());
        return toTraining(trainings.save(p));
    }

    @Transactional
    public HealthTrainingPlanDto updateTraining(Integer id, HealthTrainingPlanDto dto) {
        HealthTrainingPlan p = trainings.findById(id).orElseThrow();
        requireOwner(p.getUserId());
        applyTraining(p, dto);
        return toTraining(trainings.save(p));
    }

    @Transactional
    public void deleteTraining(Integer id) { HealthTrainingPlan p = trainings.findById(id).orElseThrow(); requireOwner(p.getUserId()); trainings.delete(p); }

    public List<HealthWeightRecordDto> weights() {
        return weights.findTop30ByUserIdOrderByRecordDateAsc(AuthContext.userId()).stream()
            .sorted(Comparator.comparing(HealthWeightRecord::getRecordDate))
            .map(this::toWeight).toList();
    }

    @Transactional
    public HealthWeightRecordDto upsertWeight(HealthWeightRecordDto dto) {
        HealthWeightRecord r = weights.findByUserIdAndRecordDate(AuthContext.userId(), dto.recordDate()).orElseGet(HealthWeightRecord::new);
        r.setUserId(AuthContext.userId());
        r.setRecordDate(dto.recordDate());
        r.setWeight(dto.weight());
        r.setNote(dto.note());
        return toWeight(weights.save(r));
    }

    @Transactional
    public void deleteWeight(Integer id) { HealthWeightRecord r = weights.findById(id).orElseThrow(); requireOwner(r.getUserId()); weights.delete(r); }

    private HealthProfile ensureProfile() {
        return profiles.findByUserId(AuthContext.userId()).orElseGet(() -> {
            HealthProfile p = new HealthProfile();
            p.setUserId(AuthContext.userId());
            p.setCurrentWeight(118.0); p.setTargetWeight(95.0);
            p.setDailyProtein(150.0); p.setDailyCarbs(220.0); p.setDailyFat(60.0); p.setDailyCalories(2100.0);
            p.setUpdatedAt(LocalDateTime.now());
            return profiles.save(p);
        });
    }

    private void applyDiet(HealthDietEntry e, HealthDietEntryDto d) {
        if (d.entryDate() != null) e.setEntryDate(d.entryDate());
        if (d.mealType() != null) e.setMealType(d.mealType());
        if (d.foodName() != null) e.setFoodName(d.foodName());
        if (d.amount() != null) e.setAmount(d.amount());
        if (d.protein() != null) e.setProtein(d.protein());
        if (d.carbs() != null) e.setCarbs(d.carbs());
        if (d.fat() != null) e.setFat(d.fat());
        if (d.calories() != null) e.setCalories(d.calories());
        if (d.sortOrder() != null) e.setSortOrder(d.sortOrder());
    }

    private void applyFood(HealthFoodItem item, HealthFoodItemDto dto) {
        if (dto.name() != null) item.setName(dto.name());
        if (dto.serving() != null) item.setServing(dto.serving());
        if (dto.protein() != null) item.setProtein(dto.protein());
        if (dto.carbs() != null) item.setCarbs(dto.carbs());
        if (dto.fat() != null) item.setFat(dto.fat());
        if (dto.calories() != null) item.setCalories(dto.calories());
    }

    private void applyTraining(HealthTrainingPlan p, HealthTrainingPlanDto d) {
        if (d.planDate() != null) p.setPlanDate(d.planDate());
        if (d.title() != null) p.setTitle(d.title());
        if (d.description() != null) p.setDescription(d.description());
        if (d.status() != null) p.setStatus(d.status());
        if (d.sortOrder() != null) p.setSortOrder(d.sortOrder());
    }

    private HealthProfileDto toProfile(HealthProfile p) { return new HealthProfileDto(p.getId(), p.getCurrentWeight(), p.getTargetWeight(), p.getDailyProtein(), p.getDailyCarbs(), p.getDailyFat(), p.getDailyCalories()); }
    private HealthDietEntryDto toDiet(HealthDietEntry e) { return new HealthDietEntryDto(e.getId(), e.getEntryDate(), e.getMealType(), e.getFoodName(), e.getAmount(), e.getProtein(), e.getCarbs(), e.getFat(), e.getCalories(), e.getSortOrder()); }
    private HealthFoodItemDto toFood(HealthFoodItem f) { return new HealthFoodItemDto(f.getId(), f.getName(), f.getServing(), f.getProtein(), f.getCarbs(), f.getFat(), f.getCalories()); }
    private HealthTrainingPlanDto toTraining(HealthTrainingPlan p) { return new HealthTrainingPlanDto(p.getId(), p.getPlanDate(), p.getTitle(), p.getDescription(), p.getStatus(), p.getSortOrder()); }
    private HealthWeightRecordDto toWeight(HealthWeightRecord r) { return new HealthWeightRecordDto(r.getId(), r.getRecordDate(), r.getWeight(), r.getNote()); }
    private void requireOwner(Integer userId) { if (!AuthContext.userId().equals(userId)) throw new IllegalArgumentException("Not found"); }
}
