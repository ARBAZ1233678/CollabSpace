package com.collabspace.repository;

import com.collabspace.model.Meeting;
import com.collabspace.model.Team;
import com.collabspace.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findByTeamOrderByStartTimeDesc(Team team);

    Page<Meeting> findByTeamOrderByStartTimeDesc(Team team, Pageable pageable);

    List<Meeting> findByCreatedBy(User user);

    @Query("SELECT m FROM Meeting m JOIN m.participants p WHERE p.id = :userId ORDER BY m.startTime DESC")
    List<Meeting> findByParticipantId(@Param("userId") Long userId);

    @Query("SELECT m FROM Meeting m WHERE m.team.id = :teamId AND m.startTime >= :startDate AND m.startTime <= :endDate")
    List<Meeting> findMeetingsBetweenDates(@Param("teamId") Long teamId, 
                                         @Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT m FROM Meeting m WHERE m.status = 'SCHEDULED' AND m.startTime <= :now")
    List<Meeting> findOverdueMeetings(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(m) FROM Meeting m WHERE m.team.id = :teamId AND m.status = 'COMPLETED'")
    Long countCompletedMeetingsByTeamId(@Param("teamId") Long teamId);

    @Query("SELECT AVG(m.durationMinutes) FROM Meeting m WHERE m.team.id = :teamId AND m.status = 'COMPLETED'")
    Double findAverageMeetingDurationByTeamId(@Param("teamId") Long teamId);

    Optional<Meeting> findByIdAndTeamId(Long id, Long teamId);

    Optional<Meeting> findByGoogleCalendarEventId(String eventId);
}
