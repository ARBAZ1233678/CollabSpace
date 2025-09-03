-- CollabSpace Development Seed Data
-- This file contains sample data for development and testing

-- Insert sample users
INSERT INTO users (email, name, google_id, profile_picture, role) VALUES
('john.doe@example.com', 'John Doe', 'google_id_john', 'https://i.pravatar.cc/150?img=1', 'ADMIN'),
('jane.smith@example.com', 'Jane Smith', 'google_id_jane', 'https://i.pravatar.cc/150?img=2', 'MEMBER'),
('bob.wilson@example.com', 'Bob Wilson', 'google_id_bob', 'https://i.pravatar.cc/150?img=3', 'MEMBER'),
('alice.johnson@example.com', 'Alice Johnson', 'google_id_alice', 'https://i.pravatar.cc/150?img=4', 'MEMBER'),
('charlie.brown@example.com', 'Charlie Brown', 'google_id_charlie', 'https://i.pravatar.cc/150?img=5', 'MEMBER')
ON CONFLICT (email) DO NOTHING;

-- Insert sample teams
INSERT INTO teams (name, description, owner_id, subscription_plan) VALUES
('Development Team', 'Software development and engineering team', 1, 'PRO'),
('Marketing Team', 'Product marketing and growth team', 2, 'FREE'),
('Design Team', 'User experience and visual design team', 3, 'PRO')
ON CONFLICT DO NOTHING;

-- Insert team memberships
INSERT INTO team_members (team_id, user_id, role) VALUES
-- Development Team
(1, 1, 'OWNER'),
(1, 2, 'ADMIN'),
(1, 3, 'MEMBER'),
(1, 4, 'MEMBER'),
-- Marketing Team
(2, 2, 'OWNER'),
(2, 1, 'ADMIN'),
(2, 5, 'MEMBER'),
-- Design Team
(3, 3, 'OWNER'),
(3, 4, 'ADMIN'),
(3, 5, 'MEMBER')
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (title, content, type, team_id, created_by, last_modified_by) VALUES
('Project Requirements', 'This document outlines the requirements for our new collaboration platform...', 'DOCUMENT', 1, 1, 1),
('API Documentation', '# CollabSpace API\n\nThis document describes the REST API endpoints...', 'MARKDOWN', 1, 2, 2),
('Marketing Strategy Q4', 'Our Q4 marketing strategy focuses on three key areas...', 'DOCUMENT', 2, 2, 2),
('User Interface Mockups', 'Collection of UI mockups and design specifications', 'PRESENTATION', 3, 3, 3),
('Database Schema', 'Database design and entity relationships', 'CODE', 1, 1, 4)
ON CONFLICT DO NOTHING;

-- Insert sample meetings
INSERT INTO meetings (title, description, team_id, created_by, start_time, status, participants_count) VALUES
('Weekly Standup', 'Weekly team standup meeting', 1, 1, CURRENT_TIMESTAMP + INTERVAL '1 day', 'SCHEDULED', 4),
('Sprint Planning', 'Planning meeting for next sprint', 1, 2, CURRENT_TIMESTAMP + INTERVAL '3 days', 'SCHEDULED', 3),
('Design Review', 'Review of new design proposals', 3, 3, CURRENT_TIMESTAMP + INTERVAL '2 days', 'SCHEDULED', 3),
('Quarterly Review', 'Q3 performance review meeting', 2, 2, CURRENT_TIMESTAMP - INTERVAL '7 days', 'COMPLETED', 3),
('Product Demo', 'Demo of new features to stakeholders', 1, 1, CURRENT_TIMESTAMP - INTERVAL '3 days', 'COMPLETED', 5)
ON CONFLICT DO NOTHING;

-- Insert meeting participants
INSERT INTO meeting_participants (meeting_id, user_id, joined_at, attendance_duration_minutes) VALUES
-- Weekly Standup
(1, 1, CURRENT_TIMESTAMP + INTERVAL '1 day', NULL),
(1, 2, CURRENT_TIMESTAMP + INTERVAL '1 day', NULL),
(1, 3, CURRENT_TIMESTAMP + INTERVAL '1 day', NULL),
(1, 4, CURRENT_TIMESTAMP + INTERVAL '1 day', NULL),
-- Sprint Planning
(2, 1, CURRENT_TIMESTAMP + INTERVAL '3 days', NULL),
(2, 2, CURRENT_TIMESTAMP + INTERVAL '3 days', NULL),
(2, 4, CURRENT_TIMESTAMP + INTERVAL '3 days', NULL),
-- Design Review
(3, 3, CURRENT_TIMESTAMP + INTERVAL '2 days', NULL),
(3, 4, CURRENT_TIMESTAMP + INTERVAL '2 days', NULL),
(3, 5, CURRENT_TIMESTAMP + INTERVAL '2 days', NULL),
-- Quarterly Review (completed)
(4, 2, CURRENT_TIMESTAMP - INTERVAL '7 days', 45),
(4, 1, CURRENT_TIMESTAMP - INTERVAL '7 days', 45),
(4, 5, CURRENT_TIMESTAMP - INTERVAL '7 days', 45),
-- Product Demo (completed)
(5, 1, CURRENT_TIMESTAMP - INTERVAL '3 days', 30),
(5, 2, CURRENT_TIMESTAMP - INTERVAL '3 days', 30),
(5, 3, CURRENT_TIMESTAMP - INTERVAL '3 days', 25),
(5, 4, CURRENT_TIMESTAMP - INTERVAL '3 days', 30),
(5, 5, CURRENT_TIMESTAMP - INTERVAL '3 days', 20)
ON CONFLICT (meeting_id, user_id) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (title, description, team_id, created_by, assigned_to, status, priority, due_date) VALUES
('Implement user authentication', 'Set up OAuth integration with Google', 1, 1, 2, 'IN_PROGRESS', 'HIGH', CURRENT_TIMESTAMP + INTERVAL '5 days'),
('Design login page', 'Create mockups for the login/signup flow', 3, 3, 4, 'TODO', 'MEDIUM', CURRENT_TIMESTAMP + INTERVAL '7 days'),
('Write API documentation', 'Document all REST endpoints', 1, 2, 2, 'REVIEW', 'MEDIUM', CURRENT_TIMESTAMP + INTERVAL '3 days'),
('Set up monitoring', 'Implement Prometheus and Grafana monitoring', 1, 1, 1, 'TODO', 'LOW', CURRENT_TIMESTAMP + INTERVAL '14 days'),
('Social media campaign', 'Launch Q4 social media marketing campaign', 2, 2, 5, 'DONE', 'HIGH', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('User testing', 'Conduct usability testing sessions', 3, 3, 4, 'TODO', 'MEDIUM', CURRENT_TIMESTAMP + INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, content, data) VALUES
(1, 'MEETING_REMINDER', 'Meeting in 30 minutes', 'Weekly Standup meeting starts at 2:00 PM', '{"meeting_id": 1, "time": "14:00"}'),
(2, 'DOCUMENT_SHARED', 'Document shared with you', 'John Doe shared "Project Requirements" document', '{"document_id": 1, "shared_by": 1}'),
(3, 'TASK_ASSIGNED', 'New task assigned', 'You have been assigned: Design login page', '{"task_id": 2, "assigned_by": 3}'),
(4, 'MENTION', 'You were mentioned', 'Alice Johnson mentioned you in a comment', '{"document_id": 4, "mentioned_by": 4}'),
(5, 'TASK_COMPLETED', 'Task completed', 'Social media campaign task has been marked as done', '{"task_id": 5, "completed_by": 5}')
ON CONFLICT DO NOTHING;

-- Insert sample document versions
INSERT INTO document_versions (document_id, version_number, content, changes_summary, created_by) VALUES
(1, 1, 'Initial draft of project requirements...', 'Initial version', 1),
(1, 2, 'Updated project requirements with stakeholder feedback...', 'Added stakeholder requirements', 1),
(2, 1, '# API Documentation\n\nBasic API structure...', 'Initial API docs', 2),
(3, 1, 'Marketing strategy outline...', 'Initial strategy document', 2)
ON CONFLICT (document_id, version_number) DO NOTHING;

-- Insert sample activity logs
INSERT INTO activity_logs (user_id, team_id, entity_type, entity_id, action, details) VALUES
(1, 1, 'DOCUMENT', 1, 'CREATE', '{"title": "Project Requirements"}'),
(2, 1, 'DOCUMENT', 1, 'UPDATE', '{"changes": "Added new requirements section"}'),
(3, 3, 'MEETING', 3, 'CREATE', '{"title": "Design Review"}'),
(2, 2, 'TASK', 5, 'COMPLETE', '{"title": "Social media campaign"}'),
(1, 1, 'TEAM', 1, 'ADD_MEMBER', '{"new_member": "Alice Johnson"}')
ON CONFLICT DO NOTHING;

-- Update team member counts
UPDATE teams SET updated_at = CURRENT_TIMESTAMP;

-- Update document versions
UPDATE documents SET version = 2 WHERE id IN (1);
UPDATE documents SET updated_at = CURRENT_TIMESTAMP - INTERVAL '1 hour' WHERE id IN (1, 2, 3);

ANALYZE;
