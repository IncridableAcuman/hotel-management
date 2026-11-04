package com.hotel.backend.controller;

import com.hotel.backend.dto.RoomDto;
import com.hotel.backend.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<RoomDto.RoomResponse> createRoom(@Valid @RequestBody RoomDto.CreateRoomRequest request){
        return ResponseEntity.ok(roomService.createRoom(request));
    }
    @GetMapping
    public ResponseEntity<List<RoomDto.RoomResponse>> getAllRooms(
            @ModelAttribute RoomDto.RoomFilterRequest filter
    ){
        return ResponseEntity.ok(roomService.searchRooms(filter));
    }
    @GetMapping("/{id}")
    public ResponseEntity<RoomDto.RoomResponse> getRoomById(@PathVariable Long id){
        return ResponseEntity.ok(roomService.getRoomById(id));
    }
    @PutMapping("/{id}")
    public ResponseEntity<RoomDto.RoomResponse> updateRoom(@PathVariable Long id,@Valid @RequestBody RoomDto.UpdateRoomRequest request){
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id){
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
