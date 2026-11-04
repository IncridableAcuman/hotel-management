package com.hotel.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.backend.dto.AuthDto;
import com.hotel.backend.dto.RoomDto;
import com.hotel.backend.entity.enums.RoomType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class RoomControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private MockMvc mockMvc;
    private String adminToken;
    private String customerToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Admin orqali tizimga kirish (DataInitializer dagi admin orqali)
        AuthDto.LoginRequest adminLogin = new AuthDto.LoginRequest();
        adminLogin.setEmail("izzatbek.engineer@gmail.com");
        adminLogin.setPassword("admin123");

        MvcResult adminRes = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        AuthDto.AuthResponse adminAuth = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthDto.AuthResponse.class);
        adminToken = adminAuth.accessToken();

        // Yangi CUSTOMER yaratish
        String customerEmail = "customer_" + System.currentTimeMillis() + "@gmail.com";
        AuthDto.RegisterRequest customerReg = new AuthDto.RegisterRequest();
        customerReg.setFirstName("Customer");
        customerReg.setLastName("User");
        customerReg.setEmail(customerEmail);
        customerReg.setPassword("customer123");
        customerReg.setPhone("+998901112233");

        MvcResult customerRes = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customerReg)))
                .andExpect(status().isOk())
                .andReturn();

        AuthDto.AuthResponse customerAuth = objectMapper.readValue(customerRes.getResponse().getContentAsString(), AuthDto.AuthResponse.class);
        customerToken = customerAuth.accessToken();
    }

    @Test
    @DisplayName("Integratsion: Xonalarni ko'rish barcha uchun (token talab qilinmaydi) ochiq")
    void getAllRooms_publicAccess() throws Exception {
        mockMvc.perform(get("/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Integratsion: Xona qo'shishda token berilmasa ruxsat berilmasligi kerak")
    void createRoom_unauthorized() throws Exception {
        RoomDto.CreateRoomRequest request = new RoomDto.CreateRoomRequest();
        request.setRoomNumber("999");
        request.setType(RoomType.SUITE);
        request.setPricePerNight(1_000_000);
        request.setCapacity(2);

        mockMvc.perform(post("/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Integratsion: Oddiy mijoz (CUSTOMER) xona qo'shmoqchi bo'lsa 403 Forbidden berishi kerak")
    void createRoom_forbiddenForCustomer() throws Exception {
        RoomDto.CreateRoomRequest request = new RoomDto.CreateRoomRequest();
        request.setRoomNumber("888");
        request.setType(RoomType.SINGLE);
        request.setPricePerNight(200_000);
        request.setCapacity(1);

        mockMvc.perform(post("/rooms")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Integratsion: Administrator (ADMIN) xona qo'sha olishi kerak")
    void createRoom_successForAdmin() throws Exception {
        String uniqueRoomNumber = "TEST_" + System.currentTimeMillis();
        RoomDto.CreateRoomRequest request = new RoomDto.CreateRoomRequest();
        request.setRoomNumber(uniqueRoomNumber);
        request.setType(RoomType.DELUXE);
        request.setPricePerNight(550_000);
        request.setCapacity(3);

        mockMvc.perform(post("/rooms")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomNumber").value(uniqueRoomNumber))
                .andExpect(jsonPath("$.type").value(RoomType.DELUXE.name()));
    }
}
