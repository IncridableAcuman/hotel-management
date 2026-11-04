package com.hotel.backend.repository;

import com.hotel.backend.entity.RoomEntity;
import com.hotel.backend.entity.enums.RoomType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<RoomEntity,Long> {
    boolean existsByRoomNumber(String roomNumber);
    boolean existsByRoomNumberAndIdNot(String roomNumber,Long id);
    List<RoomEntity> findAllByIsActiveTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RoomEntity r WHERE r.id = :id")
    Optional<RoomEntity> findByIdWithLock(@Param("id") Long id);

    @Query("""
            SELECT r FROM RoomEntity r
            WHERE (:onlyActive IS NULL OR r.isActive = :onlyActive)
              AND (:type IS NULL OR r.type = :type)
              AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice)
              AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice)
              AND (:capacity IS NULL OR r.capacity >= :capacity)
              AND (
                  CAST(:checkInDate AS date) IS NULL OR CAST(:checkOutDate AS date) IS NULL OR
                  r.id NOT IN (
                      SELECT b.room.id FROM BookingEntity b
                      WHERE b.status != com.hotel.backend.entity.enums.BookingStatus.CANCELLED
                        AND b.checkInDate < :checkOutDate
                        AND b.checkOutDate > :checkInDate
                  )
              )
            ORDER BY r.pricePerNight ASC
            """)
    List<RoomEntity> searchRooms(
            @Param("type") RoomType type,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("capacity") Integer capacity,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("onlyActive") Boolean onlyActive
    );
}
