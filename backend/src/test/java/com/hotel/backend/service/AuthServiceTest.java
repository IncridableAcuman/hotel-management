package com.hotel.backend.service;

import com.hotel.backend.dto.AuthDto;
import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.repository.UserRepository;
import com.hotel.backend.util.CookieUtil;
import com.hotel.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private CookieUtil cookieUtil;
    @Mock
    private TokenService tokenService;
    @Mock
    private RoleService roleService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private HttpServletResponse httpServletResponse;

    @InjectMocks
    private AuthService authService;

    private UserEntity user;

    @BeforeEach
    void setUp() {
        user = UserEntity.builder()
                .id(1L)
                .firstName("Sardor")
                .lastName("Karimov")
                .email("sardor@example.com")
                .password("hashed_password")
                .phone("+998901234567")
                .role(RoleEntity.builder().type(RoleType.CUSTOMER).build())
                .build();
    }

    @Test
    @DisplayName("register: Yangi foydalanuvchi muvaffaqiyatli ro'yxatdan o'tadi va token oladi")
    void register_success() {
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setFirstName("Sardor");
        request.setLastName("Karimov");
        request.setEmail("sardor@example.com");
        request.setPassword("password123");
        request.setPhone("+998901234567");

        when(userRepository.existsByEmail("sardor@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(i -> {
            UserEntity u = i.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(roleService.createRole(any(UserEntity.class), eq(RoleType.CUSTOMER)))
                .thenReturn(RoleEntity.builder().type(RoleType.CUSTOMER).build());
        when(jwtUtil.generateAccessToken(any(UserEntity.class))).thenReturn("access_token_123");
        when(jwtUtil.generateRefreshToken(any(UserEntity.class))).thenReturn("refresh_token_123");

        AuthDto.AuthResponse response = authService.register(request, httpServletResponse);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("access_token_123");
        verify(cookieUtil, times(1)).addCookie(eq("refresh_token_123"), eq(httpServletResponse));
        verify(tokenService, times(1)).saveToken(any(UserEntity.class), eq("refresh_token_123"));
    }

    @Test
    @DisplayName("register: Email allaqachon mavjud bo'lsa xatolik otilishi kerak")
    void register_existingEmail_throwsBadRequest() {
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setEmail("sardor@example.com");

        when(userRepository.existsByEmail("sardor@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request, httpServletResponse))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("User already exist");
    }

    @Test
    @DisplayName("login: Muvaffaqiyatli kirish")
    void login_success() {
        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setEmail("sardor@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("sardor@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(jwtUtil.generateAccessToken(user)).thenReturn("valid_access_token");
        when(jwtUtil.generateRefreshToken(user)).thenReturn("valid_refresh_token");

        AuthDto.AuthResponse response = authService.login(request, httpServletResponse);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("valid_access_token");
    }

    @Test
    @DisplayName("login: Parol xato bo'lsa xatolik otilishi kerak")
    void login_wrongPassword_throwsBadRequest() {
        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setEmail("sardor@example.com");
        request.setPassword("wrongpassword");

        when(userRepository.findByEmail("sardor@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashed_password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request, httpServletResponse))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Password does not match");
    }
}
