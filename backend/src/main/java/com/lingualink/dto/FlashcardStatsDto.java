package com.lingualink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardStatsDto {
    private long totalCards;
    private long dueToday;
    private long mastered;
    private long learning;
    private double retentionRate;
}
