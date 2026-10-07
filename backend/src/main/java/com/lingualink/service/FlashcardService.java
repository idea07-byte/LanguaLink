package com.lingualink.service;

import com.lingualink.dto.FlashcardCreateRequest;
import com.lingualink.dto.FlashcardDto;
import com.lingualink.dto.FlashcardStatsDto;
import com.lingualink.entity.Flashcard;
import com.lingualink.entity.FlashcardDeck;
import com.lingualink.entity.User;
import com.lingualink.exception.ResourceNotFoundException;
import com.lingualink.repository.FlashcardDeckRepository;
import com.lingualink.repository.FlashcardRepository;
import com.lingualink.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final FlashcardDeckRepository deckRepository;
    private final UserRepository userRepository;

    public FlashcardService(
            FlashcardRepository flashcardRepository,
            FlashcardDeckRepository deckRepository,
            UserRepository userRepository) {
        this.flashcardRepository = flashcardRepository;
        this.deckRepository = deckRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<FlashcardDto> getUserFlashcards(String email) {
        User user = getUserByEmail(email);
        return flashcardRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FlashcardDto> getDueFlashcards(String email) {
        User user = getUserByEmail(email);
        return flashcardRepository.findByUserIdAndNextReviewBefore(user.getId(), LocalDateTime.now())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FlashcardDto createCard(String email, FlashcardCreateRequest request) {
        User user = getUserByEmail(email);

        FlashcardDeck deck = null;
        if (request.getDeckId() != null) {
            deck = deckRepository.findById(request.getDeckId()).orElse(null);
        }

        Flashcard card = Flashcard.builder()
                .user(user)
                .deck(deck)
                .front(request.getFront().trim())
                .back(request.getBack().trim())
                .example(request.getExample() != null ? request.getExample().trim() : null)
                .language(request.getLanguage() != null ? request.getLanguage().trim() : "English")
                .intervalDays(1)
                .repetitions(0)
                .easeFactor(2.5)
                .nextReview(LocalDateTime.now())
                .mastered(false)
                .build();

        return mapToDto(flashcardRepository.save(card));
    }

    /**
     * SM-2 Spaced Repetition Review
     */
    @Transactional
    public FlashcardDto reviewCard(String email, Long cardId, String ratingStr) {
        User user = getUserByEmail(email);
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard not found: " + cardId));

        if (!card.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Flashcard not found for this user");
        }

        String rating = ratingStr != null ? ratingStr.trim().toUpperCase() : "GOOD";

        int interval = card.getIntervalDays() != null ? card.getIntervalDays() : 1;
        int repetitions = card.getRepetitions() != null ? card.getRepetitions() : 0;
        double easeFactor = card.getEaseFactor() != null ? card.getEaseFactor() : 2.5;

        switch (rating) {
            case "AGAIN" -> {
                repetitions = 0;
                interval = 1;
                easeFactor = Math.max(1.3, easeFactor - 0.2);
            }
            case "HARD" -> {
                repetitions++;
                interval = Math.max(1, (int) Math.round(interval * 1.2));
                easeFactor = Math.max(1.3, easeFactor - 0.15);
            }
            case "EASY" -> {
                repetitions++;
                if (repetitions == 1) {
                    interval = 4;
                } else {
                    interval = (int) Math.round(interval * easeFactor * 1.3);
                }
                easeFactor = Math.min(3.0, easeFactor + 0.15);
            }
            case "GOOD" -> {
                repetitions++;
                if (repetitions == 1) {
                    interval = 1;
                } else if (repetitions == 2) {
                    interval = 6;
                } else {
                    interval = (int) Math.round(interval * easeFactor);
                }
            }
            default -> {
                repetitions++;
                interval = Math.max(1, (int) Math.round(interval * 1.5));
            }
        }

        boolean mastered = repetitions >= 4;

        card.setRepetitions(repetitions);
        card.setIntervalDays(interval);
        card.setEaseFactor(easeFactor);
        card.setNextReview(LocalDateTime.now().plusDays(interval));
        card.setMastered(mastered);

        return mapToDto(flashcardRepository.save(card));
    }

    @Transactional
    public void deleteCard(String email, Long cardId) {
        User user = getUserByEmail(email);
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard not found: " + cardId));

        if (!card.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Flashcard not found for this user");
        }

        flashcardRepository.delete(card);
    }

    @Transactional(readOnly = true)
    public FlashcardStatsDto getStats(String email) {
        User user = getUserByEmail(email);
        List<Flashcard> cards = flashcardRepository.findByUserId(user.getId());

        long total = cards.size();
        long mastered = cards.stream().filter(c -> Boolean.TRUE.equals(c.getMastered())).count();
        long due = cards.stream().filter(c -> c.getNextReview() != null && c.getNextReview().isBefore(LocalDateTime.now())).count();
        long learning = total - mastered;

        double retentionRate = total > 0 ? ((double) mastered / total) * 100.0 : 0.0;

        return FlashcardStatsDto.builder()
                .totalCards(total)
                .dueToday(due)
                .mastered(mastered)
                .learning(learning)
                .retentionRate(Math.round(retentionRate * 10.0) / 10.0)
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public FlashcardDto mapToDto(Flashcard c) {
        boolean isDue = c.getNextReview() != null && c.getNextReview().isBefore(LocalDateTime.now());
        return FlashcardDto.builder()
                .id(c.getId())
                .deckId(c.getDeck() != null ? c.getDeck().getId() : null)
                .front(c.getFront())
                .back(c.getBack())
                .example(c.getExample())
                .language(c.getLanguage())
                .intervalDays(c.getIntervalDays())
                .repetitions(c.getRepetitions())
                .easeFactor(c.getEaseFactor())
                .nextReview(c.getNextReview())
                .mastered(c.getMastered())
                .isDue(isDue)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
