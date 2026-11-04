package com.hotel.backend.config;

import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.entity.enums.RoomType;
import com.hotel.backend.repository.RoleRepository;
import com.hotel.backend.repository.RoomRepository;
import com.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initAdminUser();
        initSampleRooms();
    }

    private void initAdminUser() {
        String adminEmail = "izzatbek.engineer@gmail.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            UserEntity admin = UserEntity.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .phone("+998901234567")
                    .build();

            UserEntity savedAdmin = userRepository.save(admin);

            RoleEntity adminRole = RoleEntity.builder()
                    .user(savedAdmin)
                    .type(RoleType.ADMIN)
                    .build();
            roleRepository.save(adminRole);
            savedAdmin.setRole(adminRole);

            log.info("Default ADMIN user created: email={}, password=admin123", adminEmail);
        }
    }

    private void initSampleRooms() {
        if (roomRepository.count() == 0) {
            List<RoomEntity> sampleRooms = List.of(
                    RoomEntity.builder().roomNumber("101").type(RoomType.SINGLE).pricePerNight(150_000).capacity(1).isActive(true).build(),
                    RoomEntity.builder().roomNumber("102").type(RoomType.DOUBLE).pricePerNight(250_000).capacity(2).isActive(true).build(),
                    RoomEntity.builder().roomNumber("201").type(RoomType.DELUXE).pricePerNight(450_000).capacity(2).isActive(true).build(),
                    RoomEntity.builder().roomNumber("202").type(RoomType.FAMILY).pricePerNight(600_000).capacity(4).isActive(true).build(),
                    RoomEntity.builder().roomNumber("301").type(RoomType.SUITE).pricePerNight(900_000).capacity(3).isActive(true).build()
            );
            roomRepository.saveAll(sampleRooms);
            log.info("Initialized {} sample rooms.", sampleRooms.size());
        }
    }
}
