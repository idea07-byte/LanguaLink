package com.lingualink.controller;

import com.lingualink.dto.ConversationSummaryDto;
import com.lingualink.dto.MessageDto;
import com.lingualink.dto.SendMessageRequest;
import com.lingualink.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ConversationSummaryDto>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ConversationSummaryDto> list = chatService.getUserConversations(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/start/{partnerId}")
    public ResponseEntity<Map<String, Long>> startConversation(
            @PathVariable Long partnerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long convId = chatService.getOrCreateConversation(userDetails.getUsername(), partnerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("conversationId", convId));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<MessageDto> msgs = chatService.getConversationMessages(id, userDetails.getUsername());
        return ResponseEntity.ok(msgs);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        MessageDto sent = chatService.sendMessage(
                userDetails.getUsername(),
                id,
                request.getContent(),
                request.getType()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        chatService.markConversationAsRead(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
