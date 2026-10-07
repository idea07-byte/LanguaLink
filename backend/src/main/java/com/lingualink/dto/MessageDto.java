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
public class MessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String content;
    private String type; // TEXT, AI_CORRECTION, IMAGE, VOICE, SYSTEM
    private Boolean read;
    private LocalDateTime sentAt;
}
