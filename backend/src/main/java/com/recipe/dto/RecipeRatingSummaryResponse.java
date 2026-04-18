package com.recipe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecipeRatingSummaryResponse {
    private String recipeId;
    private Double averageRating;
    private Long totalRatings;
}
