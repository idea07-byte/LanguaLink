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
public class UserProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String bio;
    private String level;
    private String avatarUrl;
    private Integer streak;
    private Integer xp;
    private String nativeLanguage;
    private List<String> learningLanguages;
    private List<String> interests;
    private String role;
}
