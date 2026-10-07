package com.lingualink.controller;

import com.lingualink.entity.Language;
import com.lingualink.repository.LanguageRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/languages")
@RequiredArgsConstructor
public class LanguageController {

    private final LanguageRepository languageRepository;

    @GetMapping
    public ResponseEntity<List<Language>> getAllLanguages() {
        return ResponseEntity.ok(languageRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Language> createLanguage(@Valid @RequestBody Language language) {
        if (languageRepository.findByCode(language.getCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Language saved = languageRepository.save(language);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
