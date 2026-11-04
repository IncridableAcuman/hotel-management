package com.hotel.backend.service;

import com.hotel.backend.dto.RoomDto;
import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;

    @Transactional
    public RoomDto.RoomResponse createRoom(RoomDto.CreateRoomRequest request){
        if (roomRepository.existsByRoomNumber(request.getRoomNumber())){
            throw new CustomBadRequestException("Room with number " + request.getRoomNumber() + " already exists");
        }
        RoomEntity room = RoomEntity
                .builder()
                .roomNumber(request.getRoomNumber())
                .type(request.getType())
                .pricePerNight(request.getPricePerNight())
                .capacity(request.getCapacity())
                .isActive(true)
                .build();
        return RoomDto.RoomResponse.from(roomRepository.save(room));
    }

    @Transactional(readOnly = true)
    public List<RoomDto.RoomResponse> searchRooms(RoomDto.RoomFilterRequest filter) {
        if (filter.getCheckInDate() != null && filter.getCheckOutDate() != null) {
            if (!filter.getCheckOutDate().isAfter(filter.getCheckInDate())) {
                throw new CustomBadRequestException("Check-out date must be after check-in date");
            }
            if (filter.getCheckInDate().isBefore(LocalDate.now())) {
                throw new CustomBadRequestException("Check-in date cannot be in the past");
            }
        } else if (filter.getCheckInDate() != null || filter.getCheckOutDate() != null) {
            throw new CustomBadRequestException("Both check-in and check-out dates must be provided");
        }

        if (filter.getMinPrice() != null && filter.getMaxPrice() != null && filter.getMinPrice() > filter.getMaxPrice()) {
            throw new CustomBadRequestException("Min price cannot be greater than max price");
        }

        List<RoomEntity> rooms = roomRepository.searchRooms(
                filter.getType(),
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getCapacity(),
                filter.getCheckInDate(),
                filter.getCheckOutDate(),
                filter.getOnlyActive()
        );

        return rooms.stream()
                .map(RoomDto.RoomResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoomDto.RoomResponse> getAllRooms(boolean onlyActive){
        List<RoomEntity> rooms = onlyActive ? roomRepository.findAllByIsActiveTrue() : roomRepository.findAll();
        return rooms
                .stream()
                .map(RoomDto.RoomResponse::from)
                .toList();
    }
    @Transactional(readOnly = true)
    public RoomDto.RoomResponse getRoomById(Long id){
        RoomEntity room = roomRepository.findById(id).orElseThrow(()-> new CustomNotFoundException("Room not found with id: " + id));
        return RoomDto.RoomResponse.from(room);
    }
    @Transactional
    public RoomDto.RoomResponse updateRoom(Long id,RoomDto.UpdateRoomRequest request){
        RoomEntity room = roomRepository.findById(id).orElseThrow(()-> new CustomNotFoundException("Room not found with id: " + id));
        if (roomRepository.existsByRoomNumberAndIdNot(request.getRoomNumber(), id)){
            throw new CustomBadRequestException("Room number " + request.getRoomNumber() + " is already exists");
        }
        room.setRoomNumber(request.getRoomNumber());
        room.setType(request.getType());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        if (request.getIsActive() != null){
            room.setActive(request.getIsActive());
        }

        return RoomDto.RoomResponse.from(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Long id){
        RoomEntity room = roomRepository.findById(id)
                .orElseThrow(()-> new CustomNotFoundException("Room not found with id: " + id));
        room.setActive(false);
        roomRepository.save(room);
    }
}
