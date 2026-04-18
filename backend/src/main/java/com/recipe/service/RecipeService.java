package com.recipe.service;

import com.recipe.dto.RecipeRequest;
import com.recipe.dto.RecipeResponse;
import com.recipe.entity.Recipe;
import com.recipe.entity.User;
import com.recipe.exception.ConflictException;
import com.recipe.exception.ResourceNotFoundException;
import com.recipe.repository.RatingRepository;
import com.recipe.repository.RecipeRepository;
import com.recipe.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private static final Logger log = LoggerFactory.getLogger(RecipeService.class);

    @Autowired private RecipeRepository recipeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RatingRepository ratingRepository;
    private final WebClient webClient = WebClient.builder().build();

    @Value("${mealdb.random.url:https://www.themealdb.com/api/json/v1/1/random.php}")
    private String mealDbRandomUrl;

    private static final int MAX_RANDOM_LIMIT = 40;
    private static final int RANDOM_FETCH_CONCURRENCY = 12;
    private static final int RANDOM_BATCH_MIN_ATTEMPTS = 10;
    private static final int RANDOM_FETCH_MAX_ROUNDS = 3;
    private static final Duration MEALDB_CALL_TIMEOUT = Duration.ofMillis(2200);

    /** Fetch all saved recipes for a specific user, newest first */
    public List<RecipeResponse> getRecipes(Long userId) {
        List<Recipe> recipes = recipeRepository.findByUserIdOrderBySavedAtDesc(userId);
        Map<String, RatingSummary> ratingSummaryById = getRatingSummaryMap(
                recipes.stream().map(Recipe::getMealId).collect(Collectors.toList())
        );

        return recipes.stream()
                .map(recipe -> toRecipeResponse(recipe, ratingSummaryById))
                .collect(Collectors.toList());
    }

    public List<RecipeResponse> getRandomRecipes(int limit) {
        long startedAt = System.currentTimeMillis();
        int normalizedLimit = Math.min(Math.max(limit, 1), MAX_RANDOM_LIMIT);
        Map<String, MealDbMeal> uniqueMealsMap = new LinkedHashMap<>();

        int round = 0;
        while (uniqueMealsMap.size() < normalizedLimit && round < RANDOM_FETCH_MAX_ROUNDS) {
            round++;
            int remaining = normalizedLimit - uniqueMealsMap.size();
            int attempts = Math.max(remaining * 2, RANDOM_BATCH_MIN_ATTEMPTS);

            List<MealDbMeal> batch = Flux.range(0, attempts)
                    .flatMap(i -> webClient.get()
                                    .uri(mealDbRandomUrl)
                                    .retrieve()
                                    .bodyToMono(MealDbResponse.class)
                                    .timeout(MEALDB_CALL_TIMEOUT)
                                    .onErrorResume(ex -> Mono.empty()),
                            RANDOM_FETCH_CONCURRENCY)
                    .flatMap(response -> {
                        if (response == null || response.meals == null || response.meals.isEmpty()) {
                            return Mono.empty();
                        }
                        MealDbMeal meal = response.meals.get(0);
                        if (meal.idMeal == null || meal.idMeal.isBlank()) {
                            return Mono.empty();
                        }
                        return Mono.just(meal);
                    })
                    .collectList()
                    .block();

            if (batch == null || batch.isEmpty()) {
                log.warn("Random recipes fetch returned empty batch on round {}", round);
                continue;
            }

            for (MealDbMeal meal : batch) {
                uniqueMealsMap.putIfAbsent(meal.idMeal, meal);
                if (uniqueMealsMap.size() >= normalizedLimit) {
                    break;
                }
            }
        }

        List<MealDbMeal> uniqueMeals = new ArrayList<>(uniqueMealsMap.values());

        if (uniqueMeals == null || uniqueMeals.isEmpty()) {
            log.warn("Random recipes fetch returned no meals in {}ms", System.currentTimeMillis() - startedAt);
            return new ArrayList<>();
        }

        Map<String, RatingSummary> ratingSummaryById = getRatingSummaryMap(
                uniqueMeals.stream().map(m -> m.idMeal).collect(Collectors.toList())
        );

        List<RecipeResponse> response = uniqueMeals.stream()
                .map(meal -> toRecipeResponse(meal, ratingSummaryById))
                .collect(Collectors.toList());

        long elapsed = System.currentTimeMillis() - startedAt;
        log.info("Random recipes fetched: requested={}, returned={}, elapsedMs={}",
            normalizedLimit, response.size(), elapsed);
        if (response.size() < normalizedLimit) {
            log.warn("Random recipes under target count: requested={}, returned={}", normalizedLimit, response.size());
        }

        return response;
    }

    /** Save a new favourite recipe for a user */
    public RecipeResponse saveRecipe(RecipeRequest req, Long userId) {
        // Prevent duplicate saves for the same user
        if (recipeRepository.existsByMealIdAndUserId(req.getMealId(), userId)) {
            throw new ConflictException("This recipe is already in your favourites");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Recipe recipe = new Recipe();
        recipe.setMealId(req.getMealId());
        recipe.setMealName(req.getMealName());
        recipe.setMealThumb(req.getMealThumb());
        recipe.setArea(req.getArea());
        recipe.setCategory(req.getCategory());
        recipe.setUser(user);

        Recipe saved = recipeRepository.save(recipe);
        return toRecipeResponse(saved);
    }

    /** Remove a recipe — only if it belongs to this user */
    @Transactional
    public void deleteRecipe(String mealId, Long userId) {
        if (!recipeRepository.existsByMealIdAndUserId(mealId, userId)) {
            throw new ResourceNotFoundException("Recipe not found in your favourites");
        }
        recipeRepository.deleteByMealIdAndUserId(mealId, userId);
    }

    private RecipeResponse toRecipeResponse(Recipe recipe, Map<String, RatingSummary> ratingSummaryById) {
        RecipeResponse response = RecipeResponse.from(recipe);
        RatingSummary summary = ratingSummaryById.get(recipe.getMealId());
        response.setAverageRating(summary == null ? 0.0 : summary.averageRating);
        response.setTotalRatings(summary == null ? 0L : summary.totalRatings);
        return response;
    }

    private RecipeResponse toRecipeResponse(MealDbMeal meal, Map<String, RatingSummary> ratingSummaryById) {
        RecipeResponse response = new RecipeResponse();
        response.setMealId(meal.idMeal);
        response.setMealName(meal.strMeal);
        response.setMealThumb(meal.strMealThumb);
        response.setArea(meal.strArea);
        response.setCategory(meal.strCategory);

        RatingSummary summary = ratingSummaryById.get(meal.idMeal);
        response.setAverageRating(summary == null ? 0.0 : summary.averageRating);
        response.setTotalRatings(summary == null ? 0L : summary.totalRatings);
        return response;
    }

    private Map<String, RatingSummary> getRatingSummaryMap(List<String> recipeIds) {
        Map<String, RatingSummary> summaries = new LinkedHashMap<>();
        if (recipeIds == null || recipeIds.isEmpty()) {
            return summaries;
        }

        Set<String> uniqueIds = new HashSet<>();
        for (String id : recipeIds) {
            if (id != null && !id.isBlank() && uniqueIds.add(id)) {
                summaries.put(id, new RatingSummary(0.0, 0L));
            }
        }

        if (summaries.isEmpty()) {
            return summaries;
        }

        List<Object[]> rows = ratingRepository.findRatingSummariesByRecipeIds(new ArrayList<>(summaries.keySet()));
        for (Object[] row : rows) {
            String recipeId = (String) row[0];
            Double avg = (Double) row[1];
            Long count = (Long) row[2];
            summaries.put(recipeId, new RatingSummary(avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0, count));
        }

        return summaries;
    }

    private static class RatingSummary {
        private final double averageRating;
        private final long totalRatings;

        private RatingSummary(double averageRating, long totalRatings) {
            this.averageRating = averageRating;
            this.totalRatings = totalRatings;
        }
    }

    private static class MealDbResponse {
        public List<MealDbMeal> meals;
    }

    private static class MealDbMeal {
        public String idMeal;
        public String strMeal;
        public String strMealThumb;
        public String strArea;
        public String strCategory;
    }
}
