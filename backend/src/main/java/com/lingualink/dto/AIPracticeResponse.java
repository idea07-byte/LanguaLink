package com.lingualink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPracticeResponse {
    private String reply;
    private String correction;
    private String explanation;
    private String followUpQuestion;
    private String detectedLanguage;
}
