package com.recipe.controller;

import com.recipe.dto.AuthResponse;
import com.recipe.dto.LoginRequest;
import com.recipe.dto.SignupRequest;
import com.recipe.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/signup
     * Body: { username, email, password }
     * Returns: { token, userId, username, email }
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req) {
        AuthResponse response = authService.signup(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * Body: { usernameOrEmail, password }
     * Returns: { token, userId, username, email }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }
}
