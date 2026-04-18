package com.recipe.repository;

import com.recipe.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.recipeId = :recipeId")
    Double findAverageRatingByRecipeId(String recipeId);

    @Query("SELECT r.recipeId, AVG(r.rating), COUNT(r) FROM Rating r WHERE r.recipeId IN :recipeIds GROUP BY r.recipeId")
    List<Object[]> findRatingSummariesByRecipeIds(@Param("recipeIds") List<String> recipeIds);

    Optional<Rating> findByRecipeIdAndUser_Id(String recipeId, Long userId);

    long countByUser_Id(Long userId);

    long countByRecipeId(String recipeId);
}
