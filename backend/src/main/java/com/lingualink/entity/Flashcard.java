package com.lingualink.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "flashcards")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id")
    @JsonIgnore
    private FlashcardDeck deck;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String front;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String back;

    @Column(columnDefinition = "TEXT")
    private String example;

    private String language;

    @Builder.Default
    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays = 1;

    @Builder.Default
    @Column(nullable = false)
    private Integer repetitions = 0;

    @Builder.Default
    @Column(name = "ease_factor", nullable = false)
    private Double easeFactor = 2.5;

    @Builder.Default
    @Column(name = "next_review", nullable = false)
    private LocalDateTime nextReview = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private Boolean mastered = false;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
