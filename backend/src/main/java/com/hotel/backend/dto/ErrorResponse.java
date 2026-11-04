package com.hotel.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        int status,
        String error,
        String message,
        Map<String, String> validationErrors,
        LocalDateTime errorTime
) {
    public static ErrorResponse from(Exception exception, HttpStatus status) {
        return new ErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                null,
                LocalDateTime.now()
        );
    }

    public static ErrorResponse validation(Map<String, String> errors) {
        return new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed for one or more fields",
                errors,
                LocalDateTime.now()
        );
    }
}
