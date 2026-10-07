package com.lingualink.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardReviewRequest {
    /**
     * Rating options:
     * AGAIN (0-1) - Complete blackout
     * HARD (2)    - Difficult recall
     * GOOD (3-4)  - Correct response after a hesitation
     * EASY (5)    - Perfect recall
     */
    @NotBlank(message = "Rating is required (AGAIN, HARD, GOOD, EASY)")
    private String rating;
}
