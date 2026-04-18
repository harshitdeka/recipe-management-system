package com.recipe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecentViewRequest {
    @NotBlank(message = "Recipe ID is required")
    private String recipeId;
}
