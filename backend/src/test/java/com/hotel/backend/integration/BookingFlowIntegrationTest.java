package com.hotel.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.backend.dto.AuthDto;
import com.hotel.backend.dto.BookingDto;
import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.entity.enums.BookingStatus;
import com.hotel.backend.entity.enums.RoomType;
import com.hotel.backend.repository.RoomRepository;
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

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class BookingFlowIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private RoomRepository roomRepository;

    private MockMvc mockMvc;
    private String customer1Token;
    private String customer2Token;
    private String adminToken;
    private Long testRoomId;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // 1. Alohida test xonasi yaratish
        RoomEntity room = roomRepository.save(RoomEntity.builder()
                .roomNumber("ROOM_" + System.currentTimeMillis())
                .type(RoomType.DOUBLE)
                .pricePerNight(300_000)
                .capacity(2)
                .isActive(true)
                .build());
        testRoomId = room.getId();

        // 2. Customer 1 ro'yxatdan o'tkazish
        customer1Token = registerAndGetToken("user1_" + System.currentTimeMillis() + "@gmail.com");

        // 3. Customer 2 ro'yxatdan o'tkazish
        customer2Token = registerAndGetToken("user2_" + System.currentTimeMillis() + "@gmail.com");

        // 4. Admin login qilish
        AuthDto.LoginRequest adminLogin = new AuthDto.LoginRequest();
        adminLogin.setEmail("izzatbek.engineer@gmail.com");
        adminLogin.setPassword("admin123");

        MvcResult adminRes = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        adminToken = objectMapper.readValue(adminRes.getResponse().getContentAsString(), AuthDto.AuthResponse.class).accessToken();
    }

    private String registerAndGetToken(String email) throws Exception {
        AuthDto.RegisterRequest reg = new AuthDto.RegisterRequest();
        reg.setFirstName("Test");
        reg.setLastName("Customer");
        reg.setEmail(email);
        reg.setPassword("customerPass123");
        reg.setPhone("+998901234567");

        MvcResult res = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readValue(res.getResponse().getContentAsString(), AuthDto.AuthResponse.class).accessToken();
    }

    @Test
    @DisplayName("To'liq bron qilish lifecycle: Bron qilish -> Sanalar to'qnashuvini oldini olish -> Tasdiqlash -> Check-In -> Check-Out")
    void completeBookingLifecycleAndDoubleBookingPrevention() throws Exception {
        LocalDate checkIn = LocalDate.now();
        LocalDate checkOut = LocalDate.now().plusDays(3);

        // 1-qadam: Customer 1 xonani muvaffaqiyatli band qiladi
        BookingDto.CreateBookingRequest bookingRequest = new BookingDto.CreateBookingRequest();
        bookingRequest.setRoomId(testRoomId);
        bookingRequest.setCheckInDate(checkIn);
        bookingRequest.setCheckOutDate(checkOut);
        bookingRequest.setGuestsCount(2);

        MvcResult createRes = mockMvc.perform(post("/bookings")
                        .header("Authorization", "Bearer " + customer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(BookingStatus.PENDING.name()))
                .andExpect(jsonPath("$.roomId").value(testRoomId))
                .andReturn();

        BookingDto.BookingResponse bookingResponse = objectMapper.readValue(
                createRes.getResponse().getContentAsString(),
                BookingDto.BookingResponse.class
        );
        Long bookingId = bookingResponse.id();
        assertThat(bookingId).isNotNull();

        // 2-qadam: Customer 2 xuddi shu sanaga ayni shu xonani band qilmoqchi bo'ladi (Double booking prevention)
        BookingDto.CreateBookingRequest conflictRequest = new BookingDto.CreateBookingRequest();
        conflictRequest.setRoomId(testRoomId);
        conflictRequest.setCheckInDate(checkIn.plusDays(1));
        conflictRequest.setCheckOutDate(checkOut.plusDays(2));
        conflictRequest.setGuestsCount(1);

        mockMvc.perform(post("/bookings")
                        .header("Authorization", "Bearer " + customer2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Room is already booked for the selected dates"));

        // 3-qadam: Customer 1 o'z bronlarini ko'radi
        mockMvc.perform(get("/bookings/my")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(bookingId));

        // 4-qadam: Admin bronni tasdiqlaydi (CONFIRMED)
        mockMvc.perform(patch("/bookings/" + bookingId + "/confirm")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CONFIRMED.name()));

        // 5-qadam: Admin mehmonni kutib oladi va ro'yxatga oladi (CHECKED_IN)
        mockMvc.perform(patch("/bookings/" + bookingId + "/check-in")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CHECKED_IN.name()));

        // 6-qadam: Check-in qilingan bronni mijoz bekor qila olmasligi kerak
        mockMvc.perform(patch("/bookings/" + bookingId + "/cancel")
                        .header("Authorization", "Bearer " + customer1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot cancel a booking that is already checked in or completed"));

        // 7-qadam: Admin mehmonni kuzatib qo'yadi (CHECKED_OUT)
        mockMvc.perform(patch("/bookings/" + bookingId + "/check-out")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(BookingStatus.CHECKED_OUT.name()));
    }
}
