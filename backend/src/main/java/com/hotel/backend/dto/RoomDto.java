package com.hotel.backend.dto;

import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.entity.enums.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RoomDto {
    @Data
    public static class RoomFilterRequest {
        private RoomType type;
        private Double minPrice;
        private Double maxPrice;
        private Integer capacity;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Boolean onlyActive = true;
    }

    @Data
    public static class CreateRoomRequest {
        @NotBlank(message = "Room number is required")
        private String roomNumber;

        @NotNull(message = "Room type is required")
        private RoomType type;

        @Positive(message = "Price per night must be greater than 0")
        private double pricePerNight;

        @Min(value = 1,message = "Capacity must be at least 1 person")
        private int capacity;
    }
    @Data
    public static class UpdateRoomRequest {
        @NotBlank(message = "Room number is required")
        private String roomNumber;

        @NotNull(message = "Room type is required")
        private RoomType type;

        @Positive(message = "Price per night must be greater than 0")
        private double pricePerNight;

        @Min(value = 1,message = "Capacity must be least 1 person")
        private int capacity;

        private Boolean isActive;
    }
    @Builder
    public record RoomResponse(
            Long id,
            String roomNumber,
            RoomType type,
            double pricePerNight,
            int capacity,
            boolean isActive,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ){
        public static RoomResponse from(RoomEntity room){
            return RoomResponse
                    .builder()
                    .id(room.getId())
                    .roomNumber(room.getRoomNumber())
                    .type(room.getType())
                    .pricePerNight(room.getPricePerNight())
                    .capacity(room.getCapacity())
                    .isActive(room.isActive())
                    .createdAt(room.getCreatedAt())
                    .updatedAt(room.getUpdatedAt())
                    .build();
        }
    }
}
