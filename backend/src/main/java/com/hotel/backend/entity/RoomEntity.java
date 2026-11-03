package com.hotel.backend.entity;

import com.hotel.backend.entity.enums.RoomType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter
@Builder
public class RoomEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number",nullable = false,unique = true)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private RoomType type;

    @Column(name = "price_per_night")
    private double pricePerNight;

    @Column(name = "capacity")
    private int capacity;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive=true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void toCreate(){
        this.createdAt=LocalDateTime.now();
        this.updatedAt=LocalDateTime.now();
    }
    @PreUpdate
    public void update(){
        this.updatedAt=LocalDateTime.now();
    }
}
