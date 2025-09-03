package com.collabspace.controller;

import com.collabspace.dto.UserDTO;
import com.collabspace.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/google-login")
    @Operation(summary = "Login with Google OAuth", description = "Authenticate user using Google OAuth token")
    public ResponseEntity<?> googleLogin(@RequestBody @Valid Map<String, String> request) {
        try {
            String googleToken = request.get("token");
            if (googleToken == null || googleToken.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Google token is required"));
            }

            Map<String, Object> response = authService.authenticateWithGoogle(googleToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh JWT token", description = "Get a new JWT token using refresh token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Refresh token is required"));
            }

            Map<String, Object> response = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token refresh failed: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Get current authenticated user's profile")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            UserDTO user = authService.getCurrentUserProfile(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update current user's profile information")
    public ResponseEntity<?> updateProfile(@RequestBody @Valid UserDTO userDTO, HttpServletRequest request) {
        try {
            Long userId = authService.getCurrentUserId(request);
            UserDTO updatedUser = authService.updateUserProfile(userId, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Profile update failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Invalidate user session and JWT token")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            authService.logout(request);
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("message", "Logout completed"));
        }
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token", description = "Check if the current JWT token is valid")
    public ResponseEntity<?> validateToken(HttpServletRequest request) {
        try {
            boolean isValid = authService.validateToken(request);
            if (isValid) {
                Long userId = authService.getCurrentUserId(request);
                UserDTO user = authService.getCurrentUserProfile(userId);
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "user", user
                ));
            } else {
                return ResponseEntity.ok(Map.of("valid", false));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if authentication service is working")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "authentication",
            "timestamp", System.currentTimeMillis()
        ));
    }
}
