package com.lingualink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDto {
    private Long id;
    private Long deckId;
    private String front;
    private String back;
    private String example;
    private String language;
    private Integer intervalDays;
    private Integer repetitions;
    private Double easeFactor;
    private LocalDateTime nextReview;
    private Boolean mastered;
    private Boolean isDue;
    private LocalDateTime createdAt;
}
