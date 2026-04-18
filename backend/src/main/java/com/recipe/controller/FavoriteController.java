package com.recipe.controller;

import com.recipe.dto.RecipeRequest;
import com.recipe.dto.RecipeResponse;
import com.recipe.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/favorites", "/api/recipes"})
public class FavoriteController {
    private final RecipeService recipeService;

    public FavoriteController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public ResponseEntity<List<RecipeResponse>> getFavorites(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getPrincipal().toString());
        return ResponseEntity.ok(recipeService.getRecipes(userId));
    }

    @PostMapping
    public ResponseEntity<RecipeResponse> addFavorite(@Valid @RequestBody RecipeRequest request,
                                                      Authentication authentication) {
        Long userId = Long.parseLong(authentication.getPrincipal().toString());
        RecipeResponse saved = recipeService.saveRecipe(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{mealId}")
    public ResponseEntity<Map<String, String>> removeFavorite(@PathVariable String mealId,
                                                              Authentication authentication) {
        Long userId = Long.parseLong(authentication.getPrincipal().toString());
        recipeService.deleteRecipe(mealId, userId);
        return ResponseEntity.ok(Map.of("message", "Recipe removed from favourites"));
    }
}
