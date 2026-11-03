package com.hotel.backend.service;

import com.hotel.backend.dto.BookingDto;
import com.hotel.backend.entity.BookingEntity;
import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.BookingStatus;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.BookingRepository;
import com.hotel.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public BookingDto.BookingResponse createBooking(UserEntity user, BookingDto.CreateBookingRequest request) {
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new CustomBadRequestException("Check-out date must be after check-in date");
        }

        RoomEntity room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new CustomNotFoundException("Room not found with id: " + request.getRoomId()));

        if (!room.isActive()) {
            throw new CustomBadRequestException("Room is currently not active");
        }

        if (request.getGuestsCount() > room.getCapacity()) {
            throw new CustomBadRequestException("Guests count exceeds room capacity (" + room.getCapacity() + " persons)");
        }

        // Sanalar to'qnashuvini tekshirish (CANCELLED statusdagilar hisobga olinmaydi)
        boolean hasOverlap = bookingRepository.existsOverlappingBooking(
                room.getId(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                List.of(BookingStatus.CANCELLED)
        );

        if (hasOverlap) {
            throw new CustomBadRequestException("Room is already booked for the selected dates");
        }

        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalAmount = BigDecimal.valueOf(room.getPricePerNight()).multiply(BigDecimal.valueOf(days));

        BookingEntity booking = BookingEntity.builder()
                .user(user)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .guestsCount(request.getGuestsCount())
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .build();

        return BookingDto.BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingDto.BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findAllByUserIdWithDetails(userId)
                .stream()
                .map(BookingDto.BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDto.BookingResponse> getAllBookings() {
        return bookingRepository.findAllWithDetails()
                .stream()
                .map(BookingDto.BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingDto.BookingResponse getBookingById(Long bookingId, UserEntity user) {
        BookingEntity booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new CustomNotFoundException("Booking not found with id: " + bookingId));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !booking.getUser().getId().equals(user.getId())) {
            throw new CustomBadRequestException("You do not have permission to view this booking");
        }

        return BookingDto.BookingResponse.from(booking);
    }

    @Transactional
    public BookingDto.BookingResponse cancelBooking(Long bookingId, UserEntity user) {
        BookingEntity booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new CustomNotFoundException("Booking not found with id: " + bookingId));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !booking.getUser().getId().equals(user.getId())) {
            throw new CustomBadRequestException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new CustomBadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.CHECKED_IN || booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new CustomBadRequestException("Cannot cancel a booking that is already checked in or completed");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return BookingDto.BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDto.BookingResponse updateStatus(Long bookingId, BookingStatus status) {
        BookingEntity booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new CustomNotFoundException("Booking not found with id: " + bookingId));

        booking.setStatus(status);
        return BookingDto.BookingResponse.from(bookingRepository.save(booking));
    }
}
