package com.recipe.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recent_views", indexes = @Index(name = "idx_recent_views_user_viewed_at", columnList = "user_id, viewed_at"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Recipe ID is required")
    @Column(name = "recipe_id", nullable = false, length = 50)
    private String recipeId;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;

    @PrePersist
    void prePersist() {
        if (viewedAt == null) {
            viewedAt = LocalDateTime.now();
        }
    }
}
