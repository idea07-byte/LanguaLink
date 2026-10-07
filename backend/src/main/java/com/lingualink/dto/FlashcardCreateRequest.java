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
public class FlashcardCreateRequest {

    @NotBlank(message = "Front text (word/phrase) is required")
    @Size(max = 500, message = "Front text cannot exceed 500 characters")
    private String front;

    @NotBlank(message = "Back text (definition/translation) is required")
    @Size(max = 1000, message = "Back text cannot exceed 1000 characters")
    private String back;

    @Size(max = 1000, message = "Example cannot exceed 1000 characters")
    private String example;

    private String language;
    private Long deckId;
}
