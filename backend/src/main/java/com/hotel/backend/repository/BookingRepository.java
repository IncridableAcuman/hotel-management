package com.hotel.backend.repository;

import com.hotel.backend.entity.BookingEntity;
import com.hotel.backend.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity,Long> {
    List<BookingEntity> findAllByUserId(Long userId);

    @Query("SELECT b FROM BookingEntity b JOIN FETCH b.user JOIN FETCH b.room WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<BookingEntity> findAllByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT b FROM BookingEntity b JOIN FETCH b.user JOIN FETCH b.room ORDER BY b.createdAt DESC")
    List<BookingEntity> findAllWithDetails();

    @Query("SELECT b FROM BookingEntity b JOIN FETCH b.user JOIN FETCH b.room WHERE b.id = :id")
    Optional<BookingEntity> findByIdWithDetails(@Param("id") Long id);

    @Query("""
            SELECT COUNT(b) > 0 FROM BookingEntity b
            WHERE b.room.id = :roomId
              AND b.status NOT IN (:excludedStatuses)
              AND b.checkInDate < :checkOutDate
              AND b.checkOutDate > :checkInDate
        """)
    boolean existsOverlappingBooking(
            @Param("roomId") Long roomId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("excludedStatuses") List<BookingStatus> excludedStatuses
    );
}
