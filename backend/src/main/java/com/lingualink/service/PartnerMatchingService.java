package com.lingualink.service;

import com.lingualink.dto.PartnerDto;
import com.lingualink.entity.Connection;
import com.lingualink.entity.Profile;
import com.lingualink.entity.User;
import com.lingualink.entity.UserLanguage;
import com.lingualink.exception.ResourceNotFoundException;
import com.lingualink.repository.ConnectionRepository;
import com.lingualink.repository.ProfileRepository;
import com.lingualink.repository.UserLanguageRepository;
import com.lingualink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartnerMatchingService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final UserLanguageRepository userLanguageRepository;
    private final ConnectionRepository connectionRepository;

    @Transactional(readOnly = true)
    public List<PartnerDto> findPartners(
            String currentUserEmail,
            String languageFilter,
            String levelFilter,
            String interestFilter,
            String search) {

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElse(null);

        Long currentUserId = currentUser != null ? currentUser.getId() : -1L;
        String myNative = getNativeLanguage(currentUserId);
        List<String> myLearning = getLearningLanguages(currentUserId);
        List<String> myInterests = currentUser != null && currentUser.getInterests() != null
                ? currentUser.getInterests() : Collections.emptyList();

        List<User> allUsers = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .filter(User::isEnabled)
                .toList();

        List<PartnerDto> partners = new ArrayList<>();

        for (User other : allUsers) {
            Profile profile = profileRepository.findByUserId(other.getId())
                    .orElse(Profile.builder().name(other.getEmail()).level("Beginner").build());

            String otherNative = getNativeLanguage(other.getId());
            List<String> otherLearning = getLearningLanguages(other.getId());
            List<String> otherInterests = other.getInterests() != null ? other.getInterests() : Collections.emptyList();

            // 1. Calculate matching score
            MatchScoreResult scoreResult = calculateScore(
                    myNative, myLearning, myInterests,
                    otherNative, otherLearning, otherInterests,
                    profile.getLevel(), profile.getStreak(), profile.getXp()
            );

            // 2. Connection status
            String connStatus = "NONE";
            if (currentUser != null) {
                Optional<Connection> conn = connectionRepository.findBetweenUsers(currentUserId, other.getId());
                if (conn.isPresent()) {
                    connStatus = conn.get().getStatus().name();
                }
            }

            PartnerDto dto = PartnerDto.builder()
                    .id(other.getId())
                    .name(profile.getName())
                    .email(other.getEmail())
                    .bio(profile.getBio())
                    .avatarUrl(profile.getAvatarUrl())
                    .level(profile.getLevel())
                    .nativeLanguage(otherNative)
                    .learningLanguages(otherLearning)
                    .interests(otherInterests)
                    .streak(profile.getStreak())
                    .xp(profile.getXp())
                    .matchScore(scoreResult.total)
                    .scoreBreakdown(scoreResult.breakdown)
                    .status(profile.getStreak() > 0 ? "online" : "away")
                    .connectionStatus(connStatus)
                    .build();

            // Apply filters
            if (matchesFilters(dto, languageFilter, levelFilter, interestFilter, search)) {
                partners.add(dto);
            }
        }

        // Rank by highest match score
        partners.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return partners;
    }

    @Transactional(readOnly = true)
    public PartnerDto getPartnerById(Long partnerId, String currentUserEmail) {
        User other = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found with ID: " + partnerId));

        User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        Long currentUserId = currentUser != null ? currentUser.getId() : -1L;

        String myNative = getNativeLanguage(currentUserId);
        List<String> myLearning = getLearningLanguages(currentUserId);
        List<String> myInterests = currentUser != null && currentUser.getInterests() != null
                ? currentUser.getInterests() : Collections.emptyList();

        Profile profile = profileRepository.findByUserId(other.getId())
                .orElse(Profile.builder().name(other.getEmail()).level("Beginner").build());

        String otherNative = getNativeLanguage(other.getId());
        List<String> otherLearning = getLearningLanguages(other.getId());
        List<String> otherInterests = other.getInterests() != null ? other.getInterests() : Collections.emptyList();

        MatchScoreResult scoreResult = calculateScore(
                myNative, myLearning, myInterests,
                otherNative, otherLearning, otherInterests,
                profile.getLevel(), profile.getStreak(), profile.getXp()
        );

        String connStatus = "NONE";
        if (currentUser != null) {
            Optional<Connection> conn = connectionRepository.findBetweenUsers(currentUserId, other.getId());
            if (conn.isPresent()) {
                connStatus = conn.get().getStatus().name();
            }
        }

        return PartnerDto.builder()
                .id(other.getId())
                .name(profile.getName())
                .email(other.getEmail())
                .bio(profile.getBio())
                .avatarUrl(profile.getAvatarUrl())
                .level(profile.getLevel())
                .nativeLanguage(otherNative)
                .learningLanguages(otherLearning)
                .interests(otherInterests)
                .streak(profile.getStreak())
                .xp(profile.getXp())
                .matchScore(scoreResult.total)
                .scoreBreakdown(scoreResult.breakdown)
                .status("online")
                .connectionStatus(connStatus)
                .build();
    }

    private MatchScoreResult calculateScore(
            String myNative, List<String> myLearning, List<String> myInterests,
            String otherNative, List<String> otherLearning, List<String> otherInterests,
            String otherLevel, Integer otherStreak, Integer otherXp) {

        int langScore = 15;
        // Check reciprocal match: I want other's native, other wants my native
        boolean iWantOtherNative = otherNative != null && myLearning != null &&
                myLearning.stream().anyMatch(l -> l.equalsIgnoreCase(otherNative));
        boolean otherWantsMyNative = myNative != null && otherLearning != null &&
                otherLearning.stream().anyMatch(l -> l.equalsIgnoreCase(myNative));

        if (iWantOtherNative && otherWantsMyNative) {
            langScore = 50; // Perfect language swap!
        } else if (iWantOtherNative || otherWantsMyNative) {
            langScore = 35;
        }

        // Skill compatibility (20 pts)
        int skillScore = 14;
        if (otherLevel != null) {
            skillScore = switch (otherLevel.toLowerCase()) {
                case "intermediate", "b1", "b2" -> 20;
                case "advanced", "c1", "c2" -> 16;
                default -> 12;
            };
        }

        // Common interests (20 pts)
        int interestScore = 5;
        if (myInterests != null && otherInterests != null && !myInterests.isEmpty()) {
            Set<String> set1 = myInterests.stream().map(String::toLowerCase).collect(Collectors.toSet());
            long common = otherInterests.stream().map(String::toLowerCase).filter(set1::contains).count();
            interestScore = (int) Math.min(20, common * 8);
            if (interestScore == 0) interestScore = 6;
        }

        // Activity (10 pts)
        int activityScore = 4;
        if (otherStreak != null && otherStreak > 0) activityScore += 3;
        if (otherXp != null && otherXp > 200) activityScore += 3;

        int total = Math.min(99, Math.max(45, langScore + skillScore + interestScore + activityScore));

        Map<String, Integer> breakdown = Map.of(
                "languageMatch", langScore,
                "skillCompatibility", skillScore,
                "commonInterests", interestScore,
                "activity", activityScore
        );

        return new MatchScoreResult(total, breakdown);
    }

    private boolean matchesFilters(PartnerDto p, String lang, String level, String interest, String search) {
        if (lang != null && !lang.equalsIgnoreCase("All")) {
            boolean hasNative = p.getNativeLanguage() != null && p.getNativeLanguage().equalsIgnoreCase(lang);
            boolean hasLearning = p.getLearningLanguages() != null && p.getLearningLanguages().stream().anyMatch(l -> l.equalsIgnoreCase(lang));
            if (!hasNative && !hasLearning) return false;
        }
        if (level != null && !level.equalsIgnoreCase("All")) {
            if (p.getLevel() == null || !p.getLevel().equalsIgnoreCase(level)) return false;
        }
        if (interest != null && !interest.equalsIgnoreCase("All")) {
            if (p.getInterests() == null || p.getInterests().stream().noneMatch(i -> i.equalsIgnoreCase(interest))) return false;
        }
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            boolean inName = p.getName() != null && p.getName().toLowerCase().contains(q);
            boolean inBio = p.getBio() != null && p.getBio().toLowerCase().contains(q);
            boolean inNative = p.getNativeLanguage() != null && p.getNativeLanguage().toLowerCase().contains(q);
            if (!inName && !inBio && !inNative) return false;
        }
        return true;
    }

    private String getNativeLanguage(Long userId) {
        if (userId == null || userId < 0) return null;
        return userLanguageRepository.findByUserIdAndType(userId, UserLanguage.LanguageType.NATIVE)
                .stream().map(ul -> ul.getLanguage().getName()).findFirst().orElse(null);
    }

    private List<String> getLearningLanguages(Long userId) {
        if (userId == null || userId < 0) return Collections.emptyList();
        return userLanguageRepository.findByUserIdAndType(userId, UserLanguage.LanguageType.LEARNING)
                .stream().map(ul -> ul.getLanguage().getName()).toList();
    }

    private record MatchScoreResult(int total, Map<String, Integer> breakdown) {}
}
