package com.recipe.dto;

import com.recipe.entity.Review;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private String recipeId;
    private Long userId;
    private String username;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setRecipeId(review.getRecipeId());
        response.setUserId(review.getUser().getId());
        response.setUsername(review.getUser().getUsername());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
