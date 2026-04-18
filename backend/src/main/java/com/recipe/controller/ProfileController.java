package com.recipe.controller;

import com.recipe.dto.ProfileResponse;
import com.recipe.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    @Autowired private ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getPrincipal().toString());
        return ResponseEntity.ok(profileService.getCurrentUserProfile(userId));
    }
}
