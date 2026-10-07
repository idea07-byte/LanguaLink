package com.lingualink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerDto {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String avatarUrl;
    private String level;
    private String nativeLanguage;
    private List<String> learningLanguages;
    private List<String> interests;
    private Integer streak;
    private Integer xp;
    private Integer matchScore; // 0 - 100
    private Map<String, Integer> scoreBreakdown;
    private String status; // "online", "away", "offline"
    private String connectionStatus; // "NONE", "PENDING", "ACCEPTED"
}
