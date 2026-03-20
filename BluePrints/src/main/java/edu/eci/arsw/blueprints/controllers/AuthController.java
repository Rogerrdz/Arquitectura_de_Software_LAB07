package edu.eci.arsw.blueprints.controllers;

import edu.eci.arsw.blueprints.dto.LoginRequest;
import edu.eci.arsw.blueprints.dto.LoginResponse;
import edu.eci.arsw.blueprints.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for login and JWT token generation
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and JWT token generation")
public class AuthController {

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    @Operation(
        summary = "User login",
        description = "Authenticates user credentials and returns a JWT token. For testing, use any username and password."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Login successful, JWT token generated",
        content = @Content(schema = @Schema(implementation = LoginResponse.class))
    )
    @ApiResponse(
        responseCode = "401",
        description = "Invalid credentials"
    )
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // Simple authentication logic for demonstration
        // In production, validate against a real user database
        // For now, accept any non-empty username/password for testing
        
        if (request.username() == null || request.username().isBlank() ||
            request.password() == null || request.password().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // For demo purposes, accept common test credentials
        // You can extend this to validate against a real user service
        String token = jwtUtil.generateToken(request.username());
        
        LoginResponse response = new LoginResponse(
            token,
            request.username(),
            "Login successful"
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    @Operation(
        summary = "Validate JWT token",
        description = "Validates if a JWT token is valid"
    )
    @ApiResponse(responseCode = "200", description = "Token is valid")
    @ApiResponse(responseCode = "401", description = "Token is invalid or expired")
    public ResponseEntity<String> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.getUsernameFromToken(token);
                return ResponseEntity.ok("Token is valid for user: " + username);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }
}
