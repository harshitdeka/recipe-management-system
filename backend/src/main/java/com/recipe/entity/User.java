package com.recipe.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    @Email(message = "Must be a valid email address")
    @NotBlank(message = "Email is required")
    private String email;

    // Stored as BCrypt hash — never plain text
    @Column(nullable = false)
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // One user → many recipes. Delete user = delete their recipes too.
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recipe> recipes = new ArrayList<>();

}
