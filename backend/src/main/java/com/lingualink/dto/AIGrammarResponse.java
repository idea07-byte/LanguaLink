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
public class AIGrammarResponse {
    private Long id;
    private String originalText;
    private String correctedText;
    private String explanation;
    private String grammarRule;
    private String language;
    private Boolean isCorrect;
    private LocalDateTime createdAt;
}
