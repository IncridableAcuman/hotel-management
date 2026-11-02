package com.hotel.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthDto {
    @Data
    public static class RegisterRequest{
        @NotBlank(message = "Firstname must be required")
        @Size(min = 3,max = 100,message = "Firstname must be between 3 and 100 character")
        private String firstName;

        @NotBlank(message = "Lastname must be required")
        @Size(min = 3,max = 100,message = "Lastname must be between 3 and 100 character")
        private String lastName;

        @NotBlank(message = "Email must be required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password must be required")
        @Size(min = 8,message = "Password must be greater than 8 character long")
        private String password;
    }
    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email must be required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password must be required")
        @Size(min = 8,message = "Password must be greater than 8 character long")
        private String password;
    }

}
