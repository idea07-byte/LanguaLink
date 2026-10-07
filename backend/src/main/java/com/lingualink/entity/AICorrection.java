package com.lingualink.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_corrections")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AICorrection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    @JsonIgnore
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String originalText;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String correctedText;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private String grammarRule;

    private String language;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
