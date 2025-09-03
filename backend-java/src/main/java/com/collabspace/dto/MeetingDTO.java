package com.collabspace.dto;

import com.collabspace.model.Meeting;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class MeetingDTO {

    private Long id;

    @NotBlank
    @Size(max = 255)
    private String title;

    private String description;

    @NotNull
    private Long teamId;

    private Long createdById;
    private String createdByName;

    @NotNull
    private LocalDateTime startTime;

    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String status;
    private String meetingUrl;
    private String googleCalendarEventId;
    private String transcriptUrl;
    private String summary;
    private String actionItems;
    private Integer participantsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<UserDTO> participants;

    // Constructors
    public MeetingDTO() {}

    public MeetingDTO(Meeting meeting) {
        this.id = meeting.getId();
        this.title = meeting.getTitle();
        this.description = meeting.getDescription();
        this.teamId = meeting.getTeam().getId();
        this.createdById = meeting.getCreatedBy().getId();
        this.createdByName = meeting.getCreatedBy().getName();
        this.startTime = meeting.getStartTime();
        this.endTime = meeting.getEndTime();
        this.durationMinutes = meeting.getDurationMinutes();
        this.status = meeting.getStatus().name();
        this.meetingUrl = meeting.getMeetingUrl();
        this.googleCalendarEventId = meeting.getGoogleCalendarEventId();
        this.transcriptUrl = meeting.getTranscriptUrl();
        this.summary = meeting.getSummary();
        this.actionItems = meeting.getActionItems();
        this.participantsCount = meeting.getParticipantsCount();
        this.createdAt = meeting.getCreatedAt();
        this.updatedAt = meeting.getUpdatedAt();
        this.participants = meeting.getParticipants().stream().map(UserDTO::new).toList();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMeetingUrl() { return meetingUrl; }
    public void setMeetingUrl(String meetingUrl) { this.meetingUrl = meetingUrl; }

    public String getGoogleCalendarEventId() { return googleCalendarEventId; }
    public void setGoogleCalendarEventId(String googleCalendarEventId) { this.googleCalendarEventId = googleCalendarEventId; }

    public String getTranscriptUrl() { return transcriptUrl; }
    public void setTranscriptUrl(String transcriptUrl) { this.transcriptUrl = transcriptUrl; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getActionItems() { return actionItems; }
    public void setActionItems(String actionItems) { this.actionItems = actionItems; }

    public Integer getParticipantsCount() { return participantsCount; }
    public void setParticipantsCount(Integer participantsCount) { this.participantsCount = participantsCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<UserDTO> getParticipants() { return participants; }
    public void setParticipants(List<UserDTO> participants) { this.participants = participants; }
}
