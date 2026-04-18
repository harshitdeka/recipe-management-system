package com.recipe.service;

import com.recipe.dto.AuthResponse;
import com.recipe.dto.LoginRequest;
import com.recipe.dto.SignupRequest;
import com.recipe.entity.User;
import com.recipe.exception.ConflictException;
import com.recipe.exception.InvalidCredentialsException;
import com.recipe.repository.UserRepository;
import com.recipe.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    /**
     * Register a new user.
     * Checks for duplicate email/username, hashes password, saves, returns JWT.
     */
    public AuthResponse signup(SignupRequest req) {
        // Check uniqueness
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("An account with this email already exists");
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new ConflictException("This username is already taken");
        }

        // Build user with hashed password (BCrypt)
        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));

        User savedUser = userRepository.save(user);

        // Issue JWT immediately so user is logged in right after signup
        String token = jwtUtil.generateToken(savedUser.getId());
        return new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail());
    }

    /**
     * Login an existing user.
     * Verifies username/email exists and password matches the stored BCrypt hash.
     */
    public AuthResponse login(LoginRequest req) {
        // Use generic error message to avoid exposing whether account exists
        String loginId = req.getUsernameOrEmail().trim();
        User user = userRepository.findByEmailOrUsername(loginId, loginId)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username/email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username/email or password");
        }

        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }
}
