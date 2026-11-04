package com.hotel.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.backend.dto.AuthDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    @DisplayName("Integratsion: Yangi foydalanuvchi muvaffaqiyatli ro'yxatdan o'tadi va token oladi")
    void register_success() throws Exception {
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setFirstName("Olim");
        request.setLastName("Zokirov");
        request.setEmail("olim" + System.currentTimeMillis() + "@gmail.com");
        request.setPassword("password123");
        request.setPhone("+998901234567");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(cookie().exists("refreshToken"));
    }

    @Test
    @DisplayName("Integratsion: Noto'g'ri validatsiyada 400 qaytarishi kerak")
    void register_validationFail() throws Exception {
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setFirstName("O");
        request.setLastName("Z");
        request.setEmail("not-an-email");
        request.setPassword("123"); // 8 tadan kam
        request.setPhone("123");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }

    @Test
    @DisplayName("Integratsion: Ro'yxatdan o'tgan foydalanuvchi tizimga muvaffaqiyatli kiradi")
    void login_success() throws Exception {
        String email = "login_test_" + System.currentTimeMillis() + "@gmail.com";
        AuthDto.RegisterRequest regRequest = new AuthDto.RegisterRequest();
        regRequest.setFirstName("Test");
        regRequest.setLastName("User");
        regRequest.setEmail(email);
        regRequest.setPassword("strongpassword123");
        regRequest.setPhone("+998909876543");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isOk());

        AuthDto.LoginRequest loginRequest = new AuthDto.LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword("strongpassword123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(cookie().exists("refreshToken"));
    }
}
