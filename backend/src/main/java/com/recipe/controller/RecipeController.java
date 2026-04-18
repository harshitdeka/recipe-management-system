package com.recipe.controller;

import com.recipe.dto.RecipeResponse;
import com.recipe.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired private RecipeService recipeService;

    @GetMapping("/random")
    public ResponseEntity<List<RecipeResponse>> getRandomRecipes(@RequestParam(defaultValue = "30") int limit) {
        return ResponseEntity.ok(recipeService.getRandomRecipes(limit));
    }
}
