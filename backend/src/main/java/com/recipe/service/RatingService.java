package com.recipe.service;

import com.recipe.dto.RatingCreateRequest;
import com.recipe.dto.RecipeRatingSummaryResponse;
import com.recipe.entity.Rating;
import com.recipe.entity.User;
import com.recipe.exception.ResourceNotFoundException;
import com.recipe.repository.RatingRepository;
import com.recipe.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

    public RatingService(RatingRepository ratingRepository, UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RecipeRatingSummaryResponse addRating(RatingCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Rating rating = ratingRepository.findByRecipeIdAndUser_Id(request.getRecipeId(), userId)
                .orElseGet(() -> {
                    Rating r = new Rating();
                    r.setRecipeId(request.getRecipeId());
                    r.setUser(user);
                    return r;
                });

        rating.setRating(request.getRating());
        ratingRepository.save(rating);

        return getRecipeRatingSummary(request.getRecipeId());
    }

    @Transactional(readOnly = true)
    public RecipeRatingSummaryResponse getRecipeRatingSummary(String recipeId) {
        Double avg = ratingRepository.findAverageRatingByRecipeId(recipeId);
        long total = ratingRepository.countByRecipeId(recipeId);

        return new RecipeRatingSummaryResponse(recipeId, avg == null ? 0.0 : avg, total);
    }

    @Transactional(readOnly = true)
    public Map<String, RecipeRatingSummaryResponse> getRecipeRatingSummaries(List<String> recipeIds) {
        Map<String, RecipeRatingSummaryResponse> summaries = new LinkedHashMap<>();
        if (recipeIds == null || recipeIds.isEmpty()) {
            return summaries;
        }

        for (String recipeId : recipeIds) {
            summaries.put(recipeId, new RecipeRatingSummaryResponse(recipeId, 0.0, 0L));
        }

        List<Object[]> rows = ratingRepository.findRatingSummariesByRecipeIds(recipeIds);
        for (Object[] row : rows) {
            String recipeId = (String) row[0];
            Double avg = (Double) row[1];
            Long total = (Long) row[2];
            summaries.put(recipeId, new RecipeRatingSummaryResponse(recipeId, avg == null ? 0.0 : avg, total));
        }

        return summaries;
    }
}