package com.lingualink.repository;

import com.lingualink.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByUserId(Long userId);
    List<Flashcard> findByDeckId(Long deckId);
    List<Flashcard> findByUserIdAndNextReviewBefore(Long userId, LocalDateTime now);
}
