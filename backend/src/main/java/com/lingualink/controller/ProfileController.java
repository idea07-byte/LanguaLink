package com.lingualink.controller;

import com.lingualink.dto.UpdateProfileRequest;
import com.lingualink.dto.UserProfileResponse;
import com.lingualink.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getCurrentProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse profile = profileService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        UserProfileResponse updated = profileService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }
}
