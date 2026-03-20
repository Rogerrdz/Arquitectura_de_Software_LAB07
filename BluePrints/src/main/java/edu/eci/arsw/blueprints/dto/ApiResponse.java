package edu.eci.arsw.blueprints.dto;

/**
 * Generic API Response wrapper for consistent REST responses.
 * @param <T> The type of data being returned
 */
public record ApiResponse<T>(
        int code,
        String message,
        T data
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(200, "Success", data);
    }

    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(201, "Created successfully", data);
    }

    public static <T> ApiResponse<T> accepted(T data) {
        return new ApiResponse<>(202, "Accepted", data);
    }

    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<>(404, message, null);
    }

    public static <T> ApiResponse<T> badRequest(String message) {
        return new ApiResponse<>(400, message, null);
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}
