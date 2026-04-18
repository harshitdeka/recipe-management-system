package com.recipe.dto;

import com.recipe.entity.Recipe;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RecipeResponse {
    private Long id;
    private String mealId;
    private String mealName;
    private String mealThumb;
    private String area;
    private String category;
    private LocalDateTime savedAt;
    private Double averageRating;
    private Long totalRatings;

    // Convert entity to DTO (keeps user details hidden)
    public static RecipeResponse from(Recipe r) {
        RecipeResponse dto = new RecipeResponse();
        dto.setId(r.getId());
        dto.setMealId(r.getMealId());
        dto.setMealName(r.getMealName());
        dto.setMealThumb(r.getMealThumb());
        dto.setArea(r.getArea());
        dto.setCategory(r.getCategory());
        dto.setSavedAt(r.getSavedAt());
        return dto;
    }
}
