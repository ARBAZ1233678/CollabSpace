package com.collabspace.repository;

import com.collabspace.model.Document;
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
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByTeamOrderByUpdatedAtDesc(Team team);

    Page<Document> findByTeamOrderByUpdatedAtDesc(Team team, Pageable pageable);

    List<Document> findByCreatedBy(User user);

    @Query("SELECT d FROM Document d WHERE d.team.id = :teamId AND d.title ILIKE %:title%")
    List<Document> findByTeamIdAndTitleContainingIgnoreCase(@Param("teamId") Long teamId, @Param("title") String title);

    @Query("SELECT d FROM Document d WHERE d.team.id = :teamId AND d.isLocked = true")
    List<Document> findLockedDocumentsByTeamId(@Param("teamId") Long teamId);

    @Query("SELECT d FROM Document d WHERE d.isLocked = true AND d.lockedAt < :lockTimeout")
    List<Document> findExpiredLockedDocuments(@Param("lockTimeout") LocalDateTime lockTimeout);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.team.id = :teamId")
    Long countDocumentsByTeamId(@Param("teamId") Long teamId);

    @Query("SELECT d FROM Document d WHERE d.team.id = :teamId AND d.updatedAt >= :since")
    List<Document> findRecentlyUpdatedDocuments(@Param("teamId") Long teamId, @Param("since") LocalDateTime since);

    Optional<Document> findByIdAndTeamId(Long id, Long teamId);
}
