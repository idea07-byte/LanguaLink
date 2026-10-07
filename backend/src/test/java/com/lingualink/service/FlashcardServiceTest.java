package com.lingualink.service;

import com.lingualink.dto.FlashcardCreateRequest;
import com.lingualink.dto.FlashcardDto;
import com.lingualink.entity.Flashcard;
import com.lingualink.entity.User;
import com.lingualink.repository.FlashcardDeckRepository;
import com.lingualink.repository.FlashcardRepository;
import com.lingualink.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlashcardServiceTest {

    @Mock
    private FlashcardRepository flashcardRepository;

    @Mock
    private FlashcardDeckRepository deckRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FlashcardService flashcardService;

    private User testUser;
    private Flashcard testCard;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@lingualink.com")
                .password("hashedPass")
                .build();

        testCard = Flashcard.builder()
                .id(10L)
                .user(testUser)
                .front("Hola")
                .back("Hello")
                .intervalDays(1)
                .repetitions(1)
                .easeFactor(2.5)
                .nextReview(LocalDateTime.now())
                .mastered(false)
                .build();
    }

    @Test
    void testCreateCard_Success() {
        when(userRepository.findByEmail("test@lingualink.com")).thenReturn(Optional.of(testUser));
        when(flashcardRepository.save(any(Flashcard.class))).thenReturn(testCard);

        FlashcardCreateRequest request = FlashcardCreateRequest.builder()
                .front("Hola")
                .back("Hello")
                .language("Spanish")
                .build();

        FlashcardDto dto = flashcardService.createCard("test@lingualink.com", request);

        assertNotNull(dto);
        assertEquals("Hola", dto.getFront());
        assertEquals("Hello", dto.getBack());
        verify(flashcardRepository, times(1)).save(any(Flashcard.class));
    }

    @Test
    void testReviewCard_SM2_GoodRatingExpandsInterval() {
        when(userRepository.findByEmail("test@lingualink.com")).thenReturn(Optional.of(testUser));
        when(flashcardRepository.findById(10L)).thenReturn(Optional.of(testCard));
        when(flashcardRepository.save(any(Flashcard.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FlashcardDto reviewed = flashcardService.reviewCard("test@lingualink.com", 10L, "GOOD");

        assertNotNull(reviewed);
        assertEquals(2, reviewed.getRepetitions());
        assertEquals(6, reviewed.getIntervalDays()); // SM-2 second successful review interval is 6
        assertTrue(reviewed.getNextReview().isAfter(LocalDateTime.now()));
    }

    @Test
    void testReviewCard_SM2_AgainRatingResetsRepetitions() {
        when(userRepository.findByEmail("test@lingualink.com")).thenReturn(Optional.of(testUser));
        when(flashcardRepository.findById(10L)).thenReturn(Optional.of(testCard));
        when(flashcardRepository.save(any(Flashcard.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FlashcardDto reviewed = flashcardService.reviewCard("test@lingualink.com", 10L, "AGAIN");

        assertNotNull(reviewed);
        assertEquals(0, reviewed.getRepetitions());
        assertEquals(1, reviewed.getIntervalDays()); // SM-2 blackout resets to 1 day
    }
}
