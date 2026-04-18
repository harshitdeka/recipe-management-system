package com.recipe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecipeRequest {
    @NotBlank(message = "Meal ID is required")
    private String mealId;

    @NotBlank(message = "Meal name is required")
    private String mealName;

    private String mealThumb;
    private String area;
    private String category;
}
