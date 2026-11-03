package com.hotel.backend.dto;

import com.hotel.backend.entity.BookingEntity;
import com.hotel.backend.entity.enums.BookingStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingDto {
    @Data
    public static class CreateBookingRequest {
        @NotNull(message = "Room ID is required")
        private Long roomId;

        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in date must be today or in the future")
        private LocalDate checkInDate;

        @NotNull(message = "Check-out date is required")
        @Future(message = "Check-out date must be in the future")
        private LocalDate checkOutDate;

        @Min(value = 1, message = "Guests count must be at least 1")
        private int guestsCount;
    }
    @Data
    public static class UpdateStatusRequest {
        @NotNull(message = "Booking status is required")
        private BookingStatus status;
    }

    @Builder
    public record BookingResponse(
            Long id,
            Long userId,
            String userEmail,
            String userFullName,
            Long roomId,
            String roomNumber,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            BigDecimal totalAmount,
            int guestsCount,
            BookingStatus status,
            LocalDateTime createdAt
    ) {
        public static BookingResponse from(BookingEntity booking) {
            return BookingResponse.builder()
                    .id(booking.getId())
                    .userId(booking.getUser().getId())
                    .userEmail(booking.getUser().getEmail())
                    .userFullName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName())
                    .roomId(booking.getRoom().getId())
                    .roomNumber(booking.getRoom().getRoomNumber())
                    .checkInDate(booking.getCheckInDate())
                    .checkOutDate(booking.getCheckOutDate())
                    .totalAmount(booking.getTotalAmount())
                    .guestsCount(booking.getGuestsCount())
                    .status(booking.getStatus())
                    .createdAt(booking.getCreatedAt())
                    .build();
        }
    }
}
