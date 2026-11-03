package com.hotel.backend.service;

import com.hotel.backend.dto.AuthDto;
import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.exception.CustomUnauthorizedException;
import com.hotel.backend.repository.UserRepository;
import com.hotel.backend.util.CookieUtil;
import com.hotel.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final CookieUtil cookieUtil;
    private final TokenService tokenService;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    private AuthDto.AuthResponse authResponse(UserEntity user,HttpServletResponse response){
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        tokenService.saveToken(user,refreshToken);
        cookieUtil.addCookie(refreshToken,response);
        return AuthDto.AuthResponse.from(accessToken);
    }
    public UserEntity getUserByEmail(String email){
        return userRepository.findByEmail(email).orElseThrow(()-> new CustomNotFoundException("User not found"));
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request, HttpServletResponse response){
        if (userRepository.existsByEmail(request.getEmail())){
            throw new CustomBadRequestException("User already exist");
        }
        UserEntity user = UserEntity
                .builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .build();

        RoleEntity role = roleService.createRole(user, RoleType.CUSTOMER);

        user.setRole(role);

        UserEntity saved = userRepository.save(user);
        return authResponse(saved,response);
    }
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request,HttpServletResponse response){
        UserEntity user = getUserByEmail(request.getEmail());
        if (!passwordEncoder.matches(request.getPassword(),user.getPassword())){
            throw new CustomBadRequestException("Password does not match");
        }
        return authResponse(user,response);
    }
    public UserEntity checkingAndValidatingRefreshToken(String refreshToken){
        if (refreshToken == null || refreshToken.isEmpty()){
            throw new CustomBadRequestException("Refresh token is missing");
        }
        if (!jwtUtil.validateToken(refreshToken)){
            throw new CustomUnauthorizedException("Invalid or expired refresh token");
        }
        if (!JwtUtil.REFRESH_TOKEN.equals(jwtUtil.getTokenType(refreshToken))){
            throw new CustomBadRequestException("Invalid token type provided");
        }
        String email = jwtUtil.getSubject(refreshToken);
        return getUserByEmail(email);
    }

    public AuthDto.AuthResponse refresh(String refreshToken,HttpServletResponse response){
        UserEntity user = checkingAndValidatingRefreshToken(refreshToken);
        return authResponse(user,response);
    }
    public void logout(String refreshToken,HttpServletResponse response){
        UserEntity user = checkingAndValidatingRefreshToken(refreshToken);
        tokenService.deleteToken(user);
        cookieUtil.clearCookie(response);
    }
}
