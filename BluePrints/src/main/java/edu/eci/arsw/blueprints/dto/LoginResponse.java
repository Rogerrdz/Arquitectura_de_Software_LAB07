package edu.eci.arsw.blueprints.dto;

/**
 * DTO for login response containing JWT token
 */
public record LoginResponse(
    String token,
    String username,
    String message
) {}
