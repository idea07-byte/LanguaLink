package com.lingualink.controller;

import com.lingualink.dto.ConnectionDto;
import com.lingualink.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<ConnectionDto> sendRequest(
            @PathVariable Long receiverId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ConnectionDto dto = connectionService.sendRequest(userDetails.getUsername(), receiverId);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/{connectionId}/accept")
    public ResponseEntity<ConnectionDto> acceptRequest(
            @PathVariable Long connectionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ConnectionDto dto = connectionService.acceptRequest(userDetails.getUsername(), connectionId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{connectionId}/reject")
    public ResponseEntity<ConnectionDto> rejectRequest(
            @PathVariable Long connectionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ConnectionDto dto = connectionService.rejectRequest(userDetails.getUsername(), connectionId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<ConnectionDto>> getActiveConnections(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ConnectionDto> list = connectionService.getActiveConnections(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ConnectionDto>> getPendingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ConnectionDto> list = connectionService.getPendingReceivedRequests(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<Map<String, String>> getConnectionStatus(
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String status = connectionService.getConnectionStatus(userDetails.getUsername(), targetUserId);
        return ResponseEntity.ok(Map.of("status", status));
    }
}
