package com.collabspace.dto;

import com.collabspace.model.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class DocumentDTO {

    private Long id;

    @NotBlank
    @Size(max = 255)
    private String title;

    private String content;
    private String type;

    @NotNull
    private Long teamId;

    private Long createdById;
    private String createdByName;
    private Long lastModifiedById;
    private String lastModifiedByName;
    private Integer version;
    private Boolean isLocked;
    private Long lockedBy;
    private String lockedByName;
    private LocalDateTime lockedAt;
    private String googleDriveId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public DocumentDTO() {}

    public DocumentDTO(Document document) {
        this.id = document.getId();
        this.title = document.getTitle();
        this.content = document.getContent();
        this.type = document.getType().name();
        this.teamId = document.getTeam().getId();
        this.createdById = document.getCreatedBy().getId();
        this.createdByName = document.getCreatedBy().getName();
        this.lastModifiedById = document.getLastModifiedBy() != null ? document.getLastModifiedBy().getId() : null;
        this.lastModifiedByName = document.getLastModifiedBy() != null ? document.getLastModifiedBy().getName() : null;
        this.version = document.getVersion();
        this.isLocked = document.getIsLocked();
        this.lockedBy = document.getLockedBy();
        this.lockedAt = document.getLockedAt();
        this.googleDriveId = document.getGoogleDriveId();
        this.createdAt = document.getCreatedAt();
        this.updatedAt = document.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public Long getLastModifiedById() { return lastModifiedById; }
    public void setLastModifiedById(Long lastModifiedById) { this.lastModifiedById = lastModifiedById; }

    public String getLastModifiedByName() { return lastModifiedByName; }
    public void setLastModifiedByName(String lastModifiedByName) { this.lastModifiedByName = lastModifiedByName; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }

    public Long getLockedBy() { return lockedBy; }
    public void setLockedBy(Long lockedBy) { this.lockedBy = lockedBy; }

    public String getLockedByName() { return lockedByName; }
    public void setLockedByName(String lockedByName) { this.lockedByName = lockedByName; }

    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }

    public String getGoogleDriveId() { return googleDriveId; }
    public void setGoogleDriveId(String googleDriveId) { this.googleDriveId = googleDriveId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
