package com.lingualink.controller;

import com.lingualink.dto.ApiResponse;
import com.lingualink.dto.DashboardResponse;
import com.lingualink.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(Principal principal) {
        DashboardResponse dashboard = dashboardService.getDashboard(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Dashboard data loaded", dashboard));
    }
}
