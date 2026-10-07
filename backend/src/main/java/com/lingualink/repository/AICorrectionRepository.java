package com.lingualink.repository;

import com.lingualink.entity.AICorrection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AICorrectionRepository extends JpaRepository<AICorrection, Long> {
    List<AICorrection> findByUserId(Long userId);
}
