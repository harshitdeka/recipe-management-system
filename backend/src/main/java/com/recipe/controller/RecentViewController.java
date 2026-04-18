package com.recipe.controller;

import com.recipe.dto.RecentViewRequest;
import com.recipe.dto.RecentViewResponse;
import com.recipe.service.RecentViewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recent-views")
public class RecentViewController {
    private final RecentViewService recentViewService;

    public RecentViewController(RecentViewService recentViewService) {
        this.recentViewService = recentViewService;
    }

    @PostMapping
    public ResponseEntity<RecentViewResponse> addRecentView(@Valid @RequestBody RecentViewRequest request,
                                                            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getPrincipal().toString());
        return ResponseEntity.ok(recentViewService.addRecentView(request, userId));
    }

    @GetMapping
    public ResponseEntity<List<RecentViewResponse>> getRecentViews(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getPrincipal().toString());
        int boundedLimit = Math.max(1, Math.min(limit, 10));
        return ResponseEntity.ok(recentViewService.getRecentViews(userId, boundedLimit));
    }
}
