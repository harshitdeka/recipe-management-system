package com.recipe.controller;

import com.recipe.dto.RatingCreateRequest;
import com.recipe.dto.RecipeRatingSummaryResponse;
import com.recipe.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    @Autowired private RatingService ratingService;

    @PostMapping
    public ResponseEntity<RecipeRatingSummaryResponse> addRating(
            @Valid @RequestBody RatingCreateRequest request,
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getPrincipal().toString());
        return ResponseEntity.ok(ratingService.addRating(request, userId));
    }

    @GetMapping("/{recipeId}")
    public ResponseEntity<RecipeRatingSummaryResponse> getAverageRating(@PathVariable String recipeId) {
        return ResponseEntity.ok(ratingService.getRecipeRatingSummary(recipeId));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, RecipeRatingSummaryResponse>> getAverageRatings(
            @RequestParam List<String> recipeIds) {
        return ResponseEntity.ok(ratingService.getRecipeRatingSummaries(recipeIds));
    }
}
