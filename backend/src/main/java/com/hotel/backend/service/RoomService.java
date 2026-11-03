package com.hotel.backend.service;

import com.hotel.backend.dto.RoomDto;
import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
