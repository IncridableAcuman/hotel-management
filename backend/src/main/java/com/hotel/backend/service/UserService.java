package com.hotel.backend.service;

import com.hotel.backend.dto.UserDto;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDto.UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByIdDesc()
                .stream()
                .map(UserDto.UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDto.UserResponse getUserById(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new CustomNotFoundException("User not found with id: " + id));
        return UserDto.UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserDto.UserResponse getCurrentUserProfile(UserEntity currentUser) {
        return UserDto.UserResponse.from(currentUser);
    }
}
