package com.lingualink.controller;

import com.lingualink.dto.*;
import com.lingualink.service.AIService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("isAuthenticated()")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    /**
     * Phase 11: AI Grammar Correction
     */
    @PostMapping("/grammar")
    public ResponseEntity<ApiResponse<AIGrammarResponse>> checkGrammar(
            @Valid @RequestBody AIGrammarRequest request,
            Principal principal) {
        AIGrammarResponse response = aiService.checkGrammar(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Grammar checked successfully", response));
    }

    /**
     * Past AI corrections history
     */
    @GetMapping("/corrections")
    public ResponseEntity<ApiResponse<List<AIGrammarResponse>>> getUserCorrections(Principal principal) {
        List<AIGrammarResponse> history = aiService.getUserCorrections(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("User corrections retrieved", history));
    }

    /**
     * Phase 12: AI Conversation Practice
     */
    @PostMapping("/practice")
    public ResponseEntity<ApiResponse<AIPracticeResponse>> practiceConversation(
            @Valid @RequestBody AIPracticeRequest request,
            Principal principal) {
        AIPracticeResponse response = aiService.practiceConversation(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("AI tutor responded", response));
    }

    /**
     * Phase 13: AI Flashcard Generation
     */
    @PostMapping("/flashcards")
    public ResponseEntity<ApiResponse<List<FlashcardDto>>> generateFlashcards(
            @Valid @RequestBody AIFlashcardRequest request,
            Principal principal) {
        List<FlashcardDto> cards = aiService.generateFlashcards(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("AI generated " + cards.size() + " flashcards", cards));
    }
}
