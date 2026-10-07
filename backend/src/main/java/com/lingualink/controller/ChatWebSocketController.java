package com.lingualink.controller;

import com.lingualink.dto.SendMessageRequest;
import com.lingualink.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void handleMessage(@Payload SendMessageRequest request, Principal principal) {
        if (principal == null) {
            log.warn("WebSocket message received without authenticated principal");
            return;
        }

        chatService.sendMessage(
                principal.getName(),
                request.getConversationId(),
                request.getContent(),
                request.getType()
        );
    }
}
