package com.lingualink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private UserProfileResponse profile;
    private int learningProgressPercent;
    private int streak;
    private int xp;
    private List<PartnerDto> recommendedPartners;
    private List<ConversationSummaryDto> recentConversations;
    private long correctionsToday;
    private long flashcardsDueCount;
    private long totalFlashcardsCount;
    private long unreadNotificationsCount;
}
