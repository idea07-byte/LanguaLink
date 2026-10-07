package com.lingualink.service;

import com.lingualink.dto.UpdateProfileRequest;
import com.lingualink.dto.UserProfileResponse;
import com.lingualink.entity.Language;
import com.lingualink.entity.Profile;
import com.lingualink.entity.User;
import com.lingualink.entity.UserLanguage;
import com.lingualink.exception.ResourceNotFoundException;
import com.lingualink.repository.LanguageRepository;
import com.lingualink.repository.ProfileRepository;
import com.lingualink.repository.UserLanguageRepository;
import com.lingualink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final LanguageRepository languageRepository;
    private final UserLanguageRepository userLanguageRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + email));

        List<UserLanguage> userLangs = userLanguageRepository.findByUserId(user.getId());
        String nativeLang = userLangs.stream()
                .filter(ul -> ul.getType() == UserLanguage.LanguageType.NATIVE)
                .map(ul -> ul.getLanguage().getName())
                .findFirst().orElse(null);

        List<String> learningLangs = userLangs.stream()
                .filter(ul -> ul.getType() == UserLanguage.LanguageType.LEARNING)
                .map(ul -> ul.getLanguage().getName())
                .toList();

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(profile.getName())
                .bio(profile.getBio())
                .level(profile.getLevel())
                .avatarUrl(profile.getAvatarUrl())
                .streak(profile.getStreak())
                .xp(profile.getXp())
                .nativeLanguage(nativeLang)
                .learningLanguages(learningLangs)
                .interests(user.getInterests())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> Profile.builder().user(user).build());

        if (request.getName() != null && !request.getName().isBlank()) {
            profile.setName(request.getName().trim());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getLevel() != null) {
            profile.setLevel(request.getLevel());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        profileRepository.save(profile);

        // Update native language if passed
        if (request.getNativeLanguage() != null && !request.getNativeLanguage().isBlank()) {
            List<UserLanguage> existingNatives = userLanguageRepository.findByUserIdAndType(user.getId(), UserLanguage.LanguageType.NATIVE);
            userLanguageRepository.deleteAll(existingNatives);

            Language lang = findOrCreateLanguage(request.getNativeLanguage());
            userLanguageRepository.save(UserLanguage.builder()
                    .user(user)
                    .language(lang)
                    .type(UserLanguage.LanguageType.NATIVE)
                    .proficiencyLevel(UserLanguage.ProficiencyLevel.NATIVE)
                    .build());
        }

        // Update learning languages if passed
        if (request.getLearningLanguages() != null) {
            List<UserLanguage> existingLearnings = userLanguageRepository.findByUserIdAndType(user.getId(), UserLanguage.LanguageType.LEARNING);
            userLanguageRepository.deleteAll(existingLearnings);

            for (String langName : request.getLearningLanguages()) {
                if (langName != null && !langName.isBlank()) {
                    Language lang = findOrCreateLanguage(langName);
                    userLanguageRepository.save(UserLanguage.builder()
                            .user(user)
                            .language(lang)
                            .type(UserLanguage.LanguageType.LEARNING)
                            .proficiencyLevel(UserLanguage.ProficiencyLevel.BEGINNER)
                            .build());
                }
            }
        }

        if (request.getInterests() != null) {
            user.setInterests(new java.util.ArrayList<>(request.getInterests()));
            userRepository.save(user);
        }

        return getProfile(email);
    }

    private Language findOrCreateLanguage(String name) {
        return languageRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    String code = name.length() >= 2 ? name.substring(0, 2).toLowerCase() : name.toLowerCase();
                    return languageRepository.save(Language.builder()
                            .name(name)
                            .code(code)
                            .flag("🌐")
                            .build());
                });
    }
}
