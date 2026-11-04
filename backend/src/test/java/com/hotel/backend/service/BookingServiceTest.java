package com.hotel.backend.service;

import com.hotel.backend.dto.BookingDto;
import com.hotel.backend.entity.BookingEntity;
import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.BookingStatus;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.entity.enums.RoomType;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.BookingRepository;
import com.hotel.backend.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private BookingService bookingService;

    private UserEntity customer;
    private UserEntity anotherCustomer;
    private UserEntity admin;
    private RoomEntity room;

    @BeforeEach
    void setUp() {
        customer = UserEntity.builder()
                .id(1L)
                .firstName("Ali")
                .lastName("Valiyev")
                .email("ali@example.com")
                .password("encoded_pass")
                .phone("+998901112233")
                .role(RoleEntity.builder().type(RoleType.CUSTOMER).build())
                .build();

        anotherCustomer = UserEntity.builder()
                .id(2L)
                .firstName("Hasan")
                .lastName("Husanov")
                .email("hasan@example.com")
                .password("encoded_pass")
                .phone("+998902223344")
                .role(RoleEntity.builder().type(RoleType.CUSTOMER).build())
                .build();

        admin = UserEntity.builder()
                .id(99L)
                .firstName("Admin")
                .lastName("Super")
                .email("admin@hotel.uz")
                .password("encoded_pass")
                .phone("+998909998877")
                .role(RoleEntity.builder().type(RoleType.ADMIN).build())
                .build();

        room = RoomEntity.builder()
                .id(10L)
                .roomNumber("101")
                .type(RoomType.DOUBLE)
                .pricePerNight(300_000.0)
                .capacity(2)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("createBooking: Muvaffaqiyatli band qilish va umumiy summani to'g'ri hisoblash")
    void createBooking_success() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5); // 3 kun
        BookingDto.CreateBookingRequest request = new BookingDto.CreateBookingRequest();
        request.setRoomId(10L);
        request.setCheckInDate(checkIn);
        request.setCheckOutDate(checkOut);
        request.setGuestsCount(2);

        when(roomRepository.findByIdWithLock(10L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingBooking(eq(10L), eq(checkIn), eq(checkOut), anyList()))
                .thenReturn(false);

        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(invocation -> {
            BookingEntity entity = invocation.getArgument(0);
            entity.setId(100L);
            return entity;
        });

        BookingDto.BookingResponse response = bookingService.createBooking(customer, request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.roomNumber()).isEqualTo("101");
        assertThat(response.status()).isEqualTo(BookingStatus.PENDING);
        // 3 kun * 300_000 = 900_000
        assertThat(response.totalAmount()).isEqualByComparingTo(BigDecimal.valueOf(900_000.0));
        verify(roomRepository, times(1)).findByIdWithLock(10L);
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    @DisplayName("createBooking: Chiqish sanasi kirish sanasidan oldin bo'lsa xatolik berishi kerak")
    void createBooking_invalidDates_throwsBadRequest() {
        BookingDto.CreateBookingRequest request = new BookingDto.CreateBookingRequest();
        request.setRoomId(10L);
        request.setCheckInDate(LocalDate.now().plusDays(5));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setGuestsCount(1);

        assertThatThrownBy(() -> bookingService.createBooking(customer, request))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Check-out date must be after check-in date");
    }

    @Test
    @DisplayName("createBooking: Mehmonlar soni xona sig'imidan oshganda xatolik berishi kerak")
    void createBooking_exceedsCapacity_throwsBadRequest() {
        BookingDto.CreateBookingRequest request = new BookingDto.CreateBookingRequest();
        request.setRoomId(10L);
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setGuestsCount(5); // xona sig'imi 2

        when(roomRepository.findByIdWithLock(10L)).thenReturn(Optional.of(room));

        assertThatThrownBy(() -> bookingService.createBooking(customer, request))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("exceeds room capacity");
    }

    @Test
    @DisplayName("createBooking: Tanlangan sanalarda xona band bo'lsa xatolik berishi kerak (Double-booking prevention)")
    void createBooking_overlappingBooking_throwsBadRequest() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(4);
        BookingDto.CreateBookingRequest request = new BookingDto.CreateBookingRequest();
        request.setRoomId(10L);
        request.setCheckInDate(checkIn);
        request.setCheckOutDate(checkOut);
        request.setGuestsCount(2);

        when(roomRepository.findByIdWithLock(10L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingBooking(eq(10L), eq(checkIn), eq(checkOut), anyList()))
                .thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(customer, request))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Room is already booked for the selected dates");
    }

    @Test
    @DisplayName("cancelBooking: Mijoz o'zining bronini bekor qila olishi kerak")
    void cancelBooking_byOwner_success() {
        BookingEntity booking = BookingEntity.builder()
                .id(50L)
                .user(customer)
                .room(room)
                .checkInDate(LocalDate.now().plusDays(3))
                .checkOutDate(LocalDate.now().plusDays(6))
                .status(BookingStatus.CONFIRMED)
                .totalAmount(BigDecimal.valueOf(900_000))
                .build();

        when(bookingRepository.findByIdWithDetails(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(i -> i.getArgument(0));

        BookingDto.BookingResponse response = bookingService.cancelBooking(50L, customer);

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        verify(bookingRepository, times(1)).save(booking);
    }

    @Test
    @DisplayName("cancelBooking: Boshqa mijoz birovning bronini bekor qilmoqchi bo'lsa rad etilishi kerak")
    void cancelBooking_byAnotherCustomer_throwsBadRequest() {
        BookingEntity booking = BookingEntity.builder()
                .id(50L)
                .user(customer)
                .room(room)
                .checkInDate(LocalDate.now().plusDays(3))
                .checkOutDate(LocalDate.now().plusDays(6))
                .status(BookingStatus.CONFIRMED)
                .totalAmount(BigDecimal.valueOf(900_000))
                .build();

        when(bookingRepository.findByIdWithDetails(50L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(50L, anotherCustomer))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("You can only cancel your own bookings");
    }

    @Test
    @DisplayName("confirmBooking: Admin bronni muvaffaqiyatli tasdiqlaydi")
    void confirmBooking_success() {
        BookingEntity booking = BookingEntity.builder()
                .id(60L)
                .user(customer)
                .room(room)
                .status(BookingStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(600_000))
                .build();

        when(bookingRepository.findByIdWithDetails(60L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(i -> i.getArgument(0));

        BookingDto.BookingResponse response = bookingService.confirmBooking(60L);

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    @DisplayName("checkIn: PENDING holatidagi bron tasdiqlanmasdan check-in qilinsa xatolik berishi kerak")
    void checkIn_whenPending_throwsBadRequest() {
        BookingEntity booking = BookingEntity.builder()
                .id(70L)
                .user(customer)
                .room(room)
                .checkInDate(LocalDate.now())
                .checkOutDate(LocalDate.now().plusDays(2))
                .status(BookingStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(600_000))
                .build();

        when(bookingRepository.findByIdWithDetails(70L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.checkIn(70L))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Booking must be confirmed before check-in");
    }

    @Test
    @DisplayName("checkIn: Tasdiqlangan va sanasi kelgan bron muvaffaqiyatli CHECKED_IN bo'lishi kerak")
    void checkIn_confirmedAndValidDate_success() {
        BookingEntity booking = BookingEntity.builder()
                .id(71L)
                .user(customer)
                .room(room)
                .checkInDate(LocalDate.now())
                .checkOutDate(LocalDate.now().plusDays(2))
                .status(BookingStatus.CONFIRMED)
                .totalAmount(BigDecimal.valueOf(600_000))
                .build();

        when(bookingRepository.findByIdWithDetails(71L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(i -> i.getArgument(0));

        BookingDto.BookingResponse response = bookingService.checkIn(71L);

        assertThat(response.status()).isEqualTo(BookingStatus.CHECKED_IN);
    }

    @Test
    @DisplayName("checkOut: CHECKED_IN bo'lmagan bron check-out qilinmoqchi bo'lsa xatolik berishi kerak")
    void checkOut_notCheckedIn_throwsBadRequest() {
        BookingEntity booking = BookingEntity.builder()
                .id(80L)
                .user(customer)
                .room(room)
                .status(BookingStatus.CONFIRMED)
                .totalAmount(BigDecimal.valueOf(600_000))
                .build();

        when(bookingRepository.findByIdWithDetails(80L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.checkOut(80L))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Only checked-in bookings can be checked out");
    }

    @Test
    @DisplayName("checkOut: CHECKED_IN holatidagi mehmon muvaffaqiyatli CHECKED_OUT bo'ladi")
    void checkOut_success() {
        BookingEntity booking = BookingEntity.builder()
                .id(81L)
                .user(customer)
                .room(room)
                .status(BookingStatus.CHECKED_IN)
                .totalAmount(BigDecimal.valueOf(600_000))
                .build();

        when(bookingRepository.findByIdWithDetails(81L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(i -> i.getArgument(0));

        BookingDto.BookingResponse response = bookingService.checkOut(81L);

        assertThat(response.status()).isEqualTo(BookingStatus.CHECKED_OUT);
    }
}
