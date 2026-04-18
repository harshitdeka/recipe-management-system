package com.recipe.service;

import com.recipe.dto.ReviewCreateRequest;
import com.recipe.dto.ReviewResponse;
import com.recipe.entity.Review;
import com.recipe.entity.User;
import com.recipe.exception.ResourceNotFoundException;
import com.recipe.repository.ReviewRepository;
import com.recipe.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse addReview(ReviewCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Review review = new Review();
        review.setUser(user);
        review.setRecipeId(request.getRecipeId());
        review.setComment(request.getComment().trim());
        Review saved = reviewRepository.save(review);
        return ReviewResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getRecipeReviews(String recipeId) {
        return reviewRepository.findByRecipeIdOrderByCreatedAtDesc(recipeId)
                .stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());
    }
}
