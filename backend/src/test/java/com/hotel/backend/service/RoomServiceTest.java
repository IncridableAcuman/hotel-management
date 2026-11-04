package com.hotel.backend.service;

import com.hotel.backend.dto.RoomDto;
import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.entity.enums.RoomType;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomService roomService;

    private RoomEntity sampleRoom;

    @BeforeEach
    void setUp() {
        sampleRoom = RoomEntity.builder()
                .id(1L)
                .roomNumber("101")
                .type(RoomType.SINGLE)
                .pricePerNight(150_000)
                .capacity(1)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("createRoom: Yangi xona muvaffaqiyatli yaratiladi")
    void createRoom_success() {
        RoomDto.CreateRoomRequest request = new RoomDto.CreateRoomRequest();
        request.setRoomNumber("102");
        request.setType(RoomType.DOUBLE);
        request.setPricePerNight(250_000);
        request.setCapacity(2);

        when(roomRepository.existsByRoomNumber("102")).thenReturn(false);
        when(roomRepository.save(any(RoomEntity.class))).thenAnswer(i -> {
            RoomEntity r = i.getArgument(0);
            r.setId(2L);
            return r;
        });

        RoomDto.RoomResponse response = roomService.createRoom(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(2L);
        assertThat(response.roomNumber()).isEqualTo("102");
        assertThat(response.isActive()).isTrue();
        verify(roomRepository, times(1)).save(any(RoomEntity.class));
    }

    @Test
    @DisplayName("createRoom: Xona raqami mavjud bo'lsa xatolik berishi kerak")
    void createRoom_duplicateNumber_throwsBadRequest() {
        RoomDto.CreateRoomRequest request = new RoomDto.CreateRoomRequest();
        request.setRoomNumber("101");
        request.setType(RoomType.SINGLE);
        request.setPricePerNight(150_000);
        request.setCapacity(1);

        when(roomRepository.existsByRoomNumber("101")).thenReturn(true);

        assertThatThrownBy(() -> roomService.createRoom(request))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("getRoomById: Mavjud bo'lmagan xona id si bilan chaqirilsa NotFoundException berishi kerak")
    void getRoomById_notFound_throwsNotFound() {
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.getRoomById(999L))
                .isInstanceOf(CustomNotFoundException.class)
                .hasMessageContaining("Room not found with id: 999");
    }

    @Test
    @DisplayName("deleteRoom: Xona soft delete qilinishi (isActive = false) kerak")
    void deleteRoom_softDelete() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(sampleRoom));
        when(roomRepository.save(any(RoomEntity.class))).thenAnswer(i -> i.getArgument(0));

        roomService.deleteRoom(1L);

        assertThat(sampleRoom.isActive()).isFalse();
        verify(roomRepository, times(1)).save(sampleRoom);
    }

    @Test
    @DisplayName("searchRooms: Check-in sanasi bugundan oldin bo'lsa xatolik berishi kerak")
    void searchRooms_pastDate_throwsBadRequest() {
        RoomDto.RoomFilterRequest filter = new RoomDto.RoomFilterRequest();
        filter.setCheckInDate(LocalDate.now().minusDays(2));
        filter.setCheckOutDate(LocalDate.now().plusDays(2));

        assertThatThrownBy(() -> roomService.searchRooms(filter))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Check-in date cannot be in the past");
    }

    @Test
    @DisplayName("searchRooms: minPrice maxPrice dan katta bo'lsa xatolik berishi kerak")
    void searchRooms_minPriceGreaterThanMaxPrice_throwsBadRequest() {
        RoomDto.RoomFilterRequest filter = new RoomDto.RoomFilterRequest();
        filter.setMinPrice(500_000.0);
        filter.setMaxPrice(200_000.0);

        assertThatThrownBy(() -> roomService.searchRooms(filter))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Min price cannot be greater than max price");
    }
}
