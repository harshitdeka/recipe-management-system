package com.recipe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewCreateRequest {
    @NotBlank(message = "Recipe ID is required")
    private String recipeId;

    @NotBlank(message = "Comment is required")
    private String comment;
}
