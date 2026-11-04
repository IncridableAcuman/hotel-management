package com.hotel.backend.dto;

import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {

    @Builder
    public record UserResponse(
            Long id,
            String firstName,
            String lastName,
            String email,
            String phone,
            RoleType role,
            LocalDateTime createdAt
    ) {
        public static UserResponse from(UserEntity user) {
            return UserResponse.builder()
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .role(user.getRole() != null ? user.getRole().getType() : null)
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }
}
