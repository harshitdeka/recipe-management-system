package com.recipe.service;

import com.recipe.dto.ProfileResponse;
import com.recipe.dto.RecipeResponse;
import com.recipe.entity.User;
import com.recipe.exception.ResourceNotFoundException;
import com.recipe.repository.RatingRepository;
import com.recipe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileService {
    @Autowired private UserRepository userRepository;
    @Autowired private RecipeService recipeService;
    @Autowired private RatingRepository ratingRepository;

    public ProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<RecipeResponse> recipes = recipeService.getRecipes(userId);
        ProfileResponse response = new ProfileResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setTotalFavorites((long) recipes.size());
        response.setTotalRatingsGiven(ratingRepository.countByUser_Id(userId));
        response.setFavoriteRecipes(recipes);
        return response;
    }
}
