package com.recipe.controller;

import com.recipe.dto.ReviewCreateRequest;
import com.recipe.dto.ReviewResponse;
import com.recipe.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(@Valid @RequestBody ReviewCreateRequest request,
                                                    Authentication authentication) {
        Long userId = Long.parseLong(authentication.getPrincipal().toString());
        return ResponseEntity.ok(reviewService.addReview(request, userId));
    }

    @GetMapping("/{recipeId}")
    public ResponseEntity<List<ReviewResponse>> getRecipeReviews(@PathVariable String recipeId) {
        return ResponseEntity.ok(reviewService.getRecipeReviews(recipeId));
    }
}
