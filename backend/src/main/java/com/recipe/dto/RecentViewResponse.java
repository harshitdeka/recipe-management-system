package com.recipe.dto;

import com.recipe.entity.RecentView;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RecentViewResponse {
    private Long id;
    private String recipeId;
    private LocalDateTime viewedAt;

    public static RecentViewResponse from(RecentView recentView) {
        RecentViewResponse response = new RecentViewResponse();
        response.setId(recentView.getId());
        response.setRecipeId(recentView.getRecipeId());
        response.setViewedAt(recentView.getViewedAt());
        return response;
    }
}
