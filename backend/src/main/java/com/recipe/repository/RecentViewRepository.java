package com.recipe.repository;

import com.recipe.entity.RecentView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecentViewRepository extends JpaRepository<RecentView, Long> {
    List<RecentView> findTop10ByUser_IdOrderByViewedAtDesc(Long userId);
}
