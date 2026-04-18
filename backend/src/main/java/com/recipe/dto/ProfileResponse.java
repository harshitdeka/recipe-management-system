package com.recipe.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProfileResponse {
    private Long userId;
    private String username;
    private String email;
    private Long totalFavorites;
    private Long totalRatingsGiven;
    private List<RecipeResponse> favoriteRecipes;
}
