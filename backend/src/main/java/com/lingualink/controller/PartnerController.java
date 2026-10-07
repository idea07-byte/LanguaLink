package com.lingualink.controller;

import com.lingualink.dto.PartnerDto;
import com.lingualink.service.PartnerMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final PartnerMatchingService partnerMatchingService;

    @GetMapping
    public ResponseEntity<List<PartnerDto>> getPartners(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String interest,
            @RequestParam(required = false) String search) {

        String email = userDetails != null ? userDetails.getUsername() : "";
        List<PartnerDto> partners = partnerMatchingService.findPartners(email, language, level, interest, search);
        return ResponseEntity.ok(partners);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartnerDto> getPartner(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails != null ? userDetails.getUsername() : "";
        PartnerDto partner = partnerMatchingService.getPartnerById(id, email);
        return ResponseEntity.ok(partner);
    }
}
