package com.lingualink.controller;

import com.lingualink.dto.ApiResponse;
import com.lingualink.dto.FlashcardCreateRequest;
import com.lingualink.dto.FlashcardDto;
import com.lingualink.dto.FlashcardReviewRequest;
import com.lingualink.dto.FlashcardStatsDto;
import com.lingualink.service.FlashcardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
@PreAuthorize("isAuthenticated()")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FlashcardDto>>> getUserCards(Principal principal) {
        List<FlashcardDto> cards = flashcardService.getUserFlashcards(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Flashcards retrieved", cards));
    }

    @GetMapping("/due")
    public ResponseEntity<ApiResponse<List<FlashcardDto>>> getDueCards(Principal principal) {
        List<FlashcardDto> dueCards = flashcardService.getDueFlashcards(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Due flashcards retrieved", dueCards));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<FlashcardStatsDto>> getStats(Principal principal) {
        FlashcardStatsDto stats = flashcardService.getStats(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Flashcard stats retrieved", stats));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FlashcardDto>> createCard(
            @Valid @RequestBody FlashcardCreateRequest request,
            Principal principal) {
        FlashcardDto created = flashcardService.createCard(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Flashcard created successfully", created));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<FlashcardDto>> reviewCard(
            @PathVariable Long id,
            @Valid @RequestBody FlashcardReviewRequest request,
            Principal principal) {
        FlashcardDto updated = flashcardService.reviewCard(principal.getName(), id, request.getRating());
        return ResponseEntity.ok(ApiResponse.ok("Flashcard reviewed successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCard(
            @PathVariable Long id,
            Principal principal) {
        flashcardService.deleteCard(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.ok("Flashcard deleted successfully", null));
    }
}
