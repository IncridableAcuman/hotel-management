package com.hotel.backend.controller;

import com.hotel.backend.dto.BookingDto;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDto.BookingResponse> createBooking(
            @AuthenticationPrincipal UserEntity currentUser,
            @Valid @RequestBody BookingDto.CreateBookingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(currentUser, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDto.BookingResponse>> getMyBookings(@AuthenticationPrincipal UserEntity currentUser) {
        return ResponseEntity.ok(bookingService.getMyBookings(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto.BookingResponse> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<BookingDto.BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDto.BookingResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUser));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDto.BookingResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingDto.UpdateStatusRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateStatus(id, request.getStatus()));
    }
}
