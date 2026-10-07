package com.lingualink.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummaryDto {
    private Long id;
    private String type;
    private Long partnerId;
    private String partnerName;
    private String partnerAvatar;
    private String partnerStatus;
    private String partnerNative;
    private String partnerLearning;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
}
