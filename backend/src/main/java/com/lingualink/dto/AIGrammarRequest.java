package com.lingualink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIGrammarRequest {

    @NotBlank(message = "Sentence cannot be blank")
    @Size(max = 1000, message = "Sentence cannot exceed 1000 characters")
    private String sentence;

    private String targetLanguage;
}
