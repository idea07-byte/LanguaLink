package com.lingualink.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIFlashcardRequest {
    private String topic;
    private String text;
    private String targetLanguage;
    private Long deckId;

    @Min(value = 1, message = "Count must be at least 1")
    @Max(value = 20, message = "Count cannot exceed 20")
    @Builder.Default
    private Integer count = 5;
}
