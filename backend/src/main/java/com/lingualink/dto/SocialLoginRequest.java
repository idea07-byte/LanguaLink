package com.lingualink.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLoginRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String provider; // "google" or "facebook"

    private String name;

    private String avatarUrl;
}
