package com.recipe.repository;

import com.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByUserIdOrderBySavedAtDesc(Long userId);
    boolean existsByMealIdAndUserId(String mealId, Long userId);
    void deleteByMealIdAndUserId(String mealId, Long userId);
    Optional<Recipe> findByMealIdAndUserId(String mealId, Long userId);

    @Query(value = "SELECT * FROM recipes ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Recipe> findRandomRecipes(int limit);
}
