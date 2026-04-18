package com.recipe.service;

import com.recipe.dto.RecentViewRequest;
import com.recipe.dto.RecentViewResponse;
import com.recipe.entity.RecentView;
import com.recipe.entity.User;
import com.recipe.exception.ResourceNotFoundException;
import com.recipe.repository.RecentViewRepository;
import com.recipe.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecentViewService {
    private final RecentViewRepository recentViewRepository;
    private final UserRepository userRepository;

    public RecentViewService(RecentViewRepository recentViewRepository, UserRepository userRepository) {
        this.recentViewRepository = recentViewRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RecentViewResponse addRecentView(RecentViewRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RecentView recentView = new RecentView();
        recentView.setUser(user);
        recentView.setRecipeId(request.getRecipeId());
        recentView.setViewedAt(LocalDateTime.now());
        RecentView saved = recentViewRepository.save(recentView);
        return RecentViewResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<RecentViewResponse> getRecentViews(Long userId, int limit) {
        List<RecentView> views = recentViewRepository.findTop10ByUser_IdOrderByViewedAtDesc(userId);
        return views.stream()
                .limit(limit)
                .map(RecentViewResponse::from)
                .collect(Collectors.toList());
    }
}
