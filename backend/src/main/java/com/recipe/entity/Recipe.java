package com.recipe.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "recipes",
    // Same mealId can exist for different users, but NOT twice for the same user
    uniqueConstraints = @UniqueConstraint(columnNames = {"meal_id", "user_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meal_id", nullable = false)
    @NotBlank(message = "Meal ID is required")
    private String mealId;

    @Column(name = "meal_name", nullable = false)
    @NotBlank(message = "Meal name is required")
    private String mealName;

    @Column(name = "meal_thumb", columnDefinition = "TEXT")
    private String mealThumb;

    private String area;

    private String category;

    @Column(name = "saved_at")
    private LocalDateTime savedAt = LocalDateTime.now();

    // Many recipes → one user (the owner)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
