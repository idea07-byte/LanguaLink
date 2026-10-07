package com.lingualink.service;

import com.lingualink.dto.AuthResponse;
import com.lingualink.dto.LoginRequest;
import com.lingualink.dto.RegisterRequest;
import com.lingualink.dto.UserProfileResponse;
import com.lingualink.entity.Language;
import com.lingualink.entity.Profile;
import com.lingualink.entity.User;
import com.lingualink.entity.UserLanguage;
import com.lingualink.exception.EmailAlreadyExistsException;
import com.lingualink.repository.LanguageRepository;
import com.lingualink.repository.ProfileRepository;
import com.lingualink.repository.UserLanguageRepository;
import com.lingualink.repository.UserRepository;
import com.lingualink.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lingualink.dto.SocialLoginRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final LanguageRepository languageRepository;
    private final UserLanguageRepository userLanguageRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        if (!email.endsWith("@gmail.com")) {
            throw new IllegalArgumentException("Access restricted: Only valid Gmail accounts (@gmail.com) are allowed to register.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already in use: " + email);
        }

        // 1. Create and save User
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ROLE_USER)
                .enabled(true)
                .build();
        User savedUser = userRepository.save(user);

        // 2. Create and save Profile
        Profile profile = Profile.builder()
                .user(savedUser)
                .name(request.getName().trim())
                .level("Beginner")
                .streak(0)
                .xp(0)
                .build();
        profileRepository.save(profile);

        // 3. Setup Native Language if provided
        List<String> learningLangs = new ArrayList<>();
        if (request.getNativeLanguage() != null && !request.getNativeLanguage().isBlank()) {
            Language nativeLang = findOrCreateLanguage(request.getNativeLanguage());
            UserLanguage userNative = UserLanguage.builder()
                    .user(savedUser)
                    .language(nativeLang)
                    .type(UserLanguage.LanguageType.NATIVE)
                    .proficiencyLevel(UserLanguage.ProficiencyLevel.NATIVE)
                    .build();
            userLanguageRepository.save(userNative);
        }

        // 4. Setup Learning Languages if provided
        if (request.getLearningLanguages() != null) {
            for (String langName : request.getLearningLanguages()) {
                if (langName != null && !langName.isBlank()) {
                    Language learningLang = findOrCreateLanguage(langName);
                    UserLanguage userLearning = UserLanguage.builder()
                            .user(savedUser)
                            .language(learningLang)
                            .type(UserLanguage.LanguageType.LEARNING)
                            .proficiencyLevel(UserLanguage.ProficiencyLevel.BEGINNER)
                            .build();
                    userLanguageRepository.save(userLearning);
                    learningLangs.add(langName);
                }
            }
        }

        // 5. Generate JWT token
        String jwt = jwtUtils.generateTokenFromUsername(savedUser.getEmail());

        UserProfileResponse userProfile = UserProfileResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .name(profile.getName())
                .bio(profile.getBio())
                .level(profile.getLevel())
                .avatarUrl(profile.getAvatarUrl())
                .streak(profile.getStreak())
                .xp(profile.getXp())
                .nativeLanguage(request.getNativeLanguage())
                .learningLanguages(learningLangs)
                .role(savedUser.getRole().name())
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(userProfile)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        if (!email.endsWith("@gmail.com")) {
            throw new IllegalArgumentException("Access restricted: Only valid Gmail accounts (@gmail.com) are allowed to login.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElse(Profile.builder().name(user.getEmail()).build());

        List<UserLanguage> userLangs = userLanguageRepository.findByUserId(user.getId());
        String nativeLang = userLangs.stream()
                .filter(ul -> ul.getType() == UserLanguage.LanguageType.NATIVE)
                .map(ul -> ul.getLanguage().getName())
                .findFirst().orElse(null);

        List<String> learningLangs = userLangs.stream()
                .filter(ul -> ul.getType() == UserLanguage.LanguageType.LEARNING)
                .map(ul -> ul.getLanguage().getName())
                .toList();

        UserProfileResponse userProfile = UserProfileResponse.builder()
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
                .role(user.getRole().name())
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(userProfile)
                .build();
    }

    @Transactional
    public AuthResponse socialLogin(SocialLoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        if (!email.endsWith("@gmail.com")) {
            throw new IllegalArgumentException("Access restricted: Only verified @gmail.com accounts are allowed to authenticate.");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(User.Role.ROLE_USER)
                    .enabled(true)
                    .build();
            User saved = userRepository.save(newUser);

            String displayName = request.getName() != null && !request.getName().isBlank()
                    ? request.getName().trim()
                    : email.split("@")[0];

            Profile profile = Profile.builder()
                    .user(saved)
                    .name(displayName)
                    .avatarUrl(request.getAvatarUrl())
                    .level("Beginner")
                    .streak(1)
                    .xp(100)
                    .build();
            profileRepository.save(profile);

            return saved;
        });

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElse(Profile.builder().name(user.getEmail()).build());

        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());

        List<UserLanguage> userLangs = userLanguageRepository.findByUserId(user.getId());
        String nativeLang = userLangs.stream()
                .filter(ul -> ul.getType() == UserLanguage.LanguageType.NATIVE)
                .map(ul -> ul.getLanguage().getName())
                .findFirst().orElse("English");

        List<String> learningLangs = userLangs.stream()
                .filter(ul -> ul.getType() == UserLanguage.LanguageType.LEARNING)
                .map(ul -> ul.getLanguage().getName())
                .toList();

        UserProfileResponse userProfile = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(profile.getName())
                .bio(profile.getBio())
                .level(profile.getLevel())
                .avatarUrl(profile.getAvatarUrl())
                .streak(profile.getStreak())
                .xp(profile.getXp())
                .nativeLanguage(nativeLang)
                .learningLanguages(learningLangs.isEmpty() ? List.of("Spanish") : learningLangs)
                .role(user.getRole().name())
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(userProfile)
                .build();
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
