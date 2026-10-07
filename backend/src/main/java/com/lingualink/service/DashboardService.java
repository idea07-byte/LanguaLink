package com.lingualink.service;

import com.lingualink.dto.ConversationSummaryDto;
import com.lingualink.dto.DashboardResponse;
import com.lingualink.dto.PartnerDto;
import com.lingualink.dto.UserProfileResponse;
import com.lingualink.entity.Flashcard;
import com.lingualink.entity.User;
import com.lingualink.exception.ResourceNotFoundException;
import com.lingualink.repository.AICorrectionRepository;
import com.lingualink.repository.FlashcardRepository;
import com.lingualink.repository.NotificationRepository;
import com.lingualink.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DashboardService {

    private final ProfileService profileService;
    private final PartnerMatchingService partnerMatchingService;
    private final ChatService chatService;
    private final AICorrectionRepository aiCorrectionRepository;
    private final FlashcardRepository flashcardRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public DashboardService(
            ProfileService profileService,
            PartnerMatchingService partnerMatchingService,
            ChatService chatService,
            AICorrectionRepository aiCorrectionRepository,
            FlashcardRepository flashcardRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.profileService = profileService;
        this.partnerMatchingService = partnerMatchingService;
        this.chatService = chatService;
        this.aiCorrectionRepository = aiCorrectionRepository;
        this.flashcardRepository = flashcardRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        // 1. User Profile & Stats
        UserProfileResponse profile = profileService.getProfile(email);

        // 2. Recommended Partners (Top 4)
        List<PartnerDto> allMatches = partnerMatchingService.findPartners(email, null, null, null, null);
        List<PartnerDto> recommended = allMatches.stream().limit(4).collect(Collectors.toList());

        // 3. Recent Conversations (Top 3)
        List<ConversationSummaryDto> convs = chatService.getUserConversations(email);
        List<ConversationSummaryDto> recentConversations = convs.stream().limit(3).collect(Collectors.toList());

        // 4. AI Corrections Today
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long correctionsToday = aiCorrectionRepository.findByUserId(user.getId())
                .stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(startOfDay))
                .count();

        // 5. Flashcards Metrics
        List<Flashcard> cards = flashcardRepository.findByUserId(user.getId());
        long totalCards = cards.size();
        long dueCards = cards.stream()
                .filter(c -> c.getNextReview() != null && c.getNextReview().isBefore(LocalDateTime.now()))
                .count();
        long masteredCards = cards.stream()
                .filter(c -> Boolean.TRUE.equals(c.getMastered()))
                .count();

        // 6. Learning progress percentage calculation
        int streak = profile.getStreak() != null ? profile.getStreak() : 0;
        int xp = profile.getXp() != null ? profile.getXp() : 0;
        int progressPercent = 30; // base progress
        if (totalCards > 0) {
            progressPercent = Math.min(100, (int) Math.round(((double) masteredCards / totalCards) * 60.0 + (streak * 5) + Math.min(xp / 10, 20)));
        } else {
            progressPercent = Math.min(100, Math.max(25, (streak * 10) + Math.min(xp / 5, 50)));
        }

        // 7. Unread Notifications
        long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(user.getId());

        return DashboardResponse.builder()
                .profile(profile)
                .learningProgressPercent(progressPercent)
                .streak(streak)
                .xp(xp)
                .recommendedPartners(recommended)
                .recentConversations(recentConversations)
                .correctionsToday(correctionsToday)
                .flashcardsDueCount(dueCards)
                .totalFlashcardsCount(totalCards)
                .unreadNotificationsCount(unreadNotifications)
                .build();
    }
}
