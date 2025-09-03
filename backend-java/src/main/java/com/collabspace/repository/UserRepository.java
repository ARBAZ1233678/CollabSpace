package com.collabspace.repository;

import com.collabspace.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    List<User> findByIsActiveTrue();

    @Query("SELECT u FROM User u WHERE u.lastLoginAt > :since")
    List<User> findActiveUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT u FROM User u JOIN u.teams t WHERE t.id = :teamId")
    List<User> findByTeamId(@Param("teamId") Long teamId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate AND u.createdAt <= :endDate")
    Long countUsersCreatedBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    boolean existsByEmail(String email);

    boolean existsByGoogleId(String googleId);
}
