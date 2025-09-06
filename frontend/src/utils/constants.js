// Application constants for CollabSpace

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// Google Integration
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  SCOPES: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/spreadsheets'
  ],
  DISCOVERY_DOCS: [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest'
  ]
}

// Application Settings
export const APP_CONFIG = {
  NAME: 'CollabSpace',
  VERSION: '1.0.0',
  DESCRIPTION: 'Enterprise Team Collaboration Platform',
  SUPPORT_EMAIL: 'support@collabspace.dev',
  WEBSITE: 'https://collabspace.dev',
  GITHUB: 'https://github.com/collabspace/platform'
}

// User Roles and Permissions
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER', 
  VIEWER: 'VIEWER'
}

export const TEAM_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER'
}

export const PERMISSIONS = {
  // Document permissions
  DOCUMENTS_CREATE: 'documents:create',
  DOCUMENTS_READ: 'documents:read',
  DOCUMENTS_UPDATE: 'documents:update',
  DOCUMENTS_DELETE: 'documents:delete',
  DOCUMENTS_SHARE: 'documents:share',

  // Meeting permissions
  MEETINGS_CREATE: 'meetings:create',
  MEETINGS_JOIN: 'meetings:join',
  MEETINGS_MODERATE: 'meetings:moderate',
  MEETINGS_DELETE: 'meetings:delete',

  // Team permissions
  TEAMS_MANAGE: 'teams:manage',
  TEAMS_INVITE: 'teams:invite',
  TEAMS_REMOVE_MEMBERS: 'teams:remove_members',

  // Admin permissions
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_USERS: 'admin:users'
}

// Document Types
export const DOCUMENT_TYPES = {
  DOCUMENT: 'DOCUMENT',
  SPREADSHEET: 'SPREADSHEET',
  PRESENTATION: 'PRESENTATION',
  CODE: 'CODE',
  MARKDOWN: 'MARKDOWN'
}

export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPES.DOCUMENT]: 'Document',
  [DOCUMENT_TYPES.SPREADSHEET]: 'Spreadsheet',
  [DOCUMENT_TYPES.PRESENTATION]: 'Presentation',
  [DOCUMENT_TYPES.CODE]: 'Code File',
  [DOCUMENT_TYPES.MARKDOWN]: 'Markdown'
}

export const DOCUMENT_TYPE_EXTENSIONS = {
  [DOCUMENT_TYPES.DOCUMENT]: '.docx',
  [DOCUMENT_TYPES.SPREADSHEET]: '.xlsx',
  [DOCUMENT_TYPES.PRESENTATION]: '.pptx',
  [DOCUMENT_TYPES.CODE]: '.txt',
  [DOCUMENT_TYPES.MARKDOWN]: '.md'
}

// Meeting Status
export const MEETING_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

export const MEETING_STATUS_LABELS = {
  [MEETING_STATUS.SCHEDULED]: 'Scheduled',
  [MEETING_STATUS.IN_PROGRESS]: 'In Progress', 
  [MEETING_STATUS.COMPLETED]: 'Completed',
  [MEETING_STATUS.CANCELLED]: 'Cancelled'
}

export const MEETING_STATUS_COLORS = {
  [MEETING_STATUS.SCHEDULED]: 'info',
  [MEETING_STATUS.IN_PROGRESS]: 'warning',
  [MEETING_STATUS.COMPLETED]: 'success',
  [MEETING_STATUS.CANCELLED]: 'error'
}

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/markdown'
  ],
  CHUNK_SIZE: 1024 * 1024 // 1MB chunks for large files
}

// WebRTC Configuration
export const WEBRTC_CONFIG = {
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  VIDEO_CONSTRAINTS: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 }
  },
  AUDIO_CONSTRAINTS: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
}

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 240,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1200,

  // Animation durations
  ANIMATION_DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  },

  // Debounce delays
  DEBOUNCE_DELAY: {
    SEARCH: 300,
    AUTO_SAVE: 2000,
    TYPING_INDICATOR: 1000
  }
}

// Notification Types
export const NOTIFICATION_TYPES = {
  DOCUMENT_SHARED: 'DOCUMENT_SHARED',
  DOCUMENT_UPDATED: 'DOCUMENT_UPDATED',
  MEETING_INVITATION: 'MEETING_INVITATION',
  MEETING_REMINDER: 'MEETING_REMINDER',
  MEETING_STARTED: 'MEETING_STARTED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TEAM_INVITATION: 'TEAM_INVITATION',
  MENTION: 'MENTION',
  COMMENT: 'COMMENT',
  SYSTEM: 'SYSTEM'
}

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',

  // Document collaboration
  DOCUMENT_JOIN: 'document:join',
  DOCUMENT_LEAVE: 'document:leave',
  DOCUMENT_OPERATION: 'document:operation',
  DOCUMENT_CURSOR: 'document:cursor',
  DOCUMENT_SELECTION: 'document:selection',

  // Typing indicators
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Collaborators
  COLLABORATOR_JOINED: 'collaborator:joined',
  COLLABORATOR_LEFT: 'collaborator:left',
  COLLABORATOR_CURSOR: 'collaborator:cursor',
  COLLABORATOR_TYPING: 'collaborator:typing',

  // Meetings
  MEETING_JOIN: 'meeting:join',
  MEETING_LEAVE: 'meeting:leave',
  MEETING_MEDIA_TOGGLE: 'meeting:media-toggle',
  MEETING_CHAT_MESSAGE: 'meeting:chat-message',

  // Participants
  PARTICIPANT_JOINED: 'participant:joined',
  PARTICIPANT_LEFT: 'participant:left',
  PARTICIPANT_MEDIA_TOGGLE: 'participant:media-toggle',

  // WebRTC signaling
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE_CANDIDATE: 'webrtc:ice-candidate',

  // User presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  // Notifications
  NOTIFICATION: 'notification',

  // Errors
  ERROR: 'error',
  HEARTBEAT: 'heartbeat'
}

// Error Codes
export const ERROR_CODES = {
  // Authentication errors
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',

  // Document errors
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  DOCUMENT_LOCKED: 'DOCUMENT_LOCKED',
  DOCUMENT_VERSION_CONFLICT: 'DOCUMENT_VERSION_CONFLICT',

  // Meeting errors
  MEETING_NOT_FOUND: 'MEETING_NOT_FOUND',
  MEETING_FULL: 'MEETING_FULL',
  MEETING_ENDED: 'MEETING_ENDED',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  UPLOAD_FAILED: 'UPLOAD_FAILED'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  DOCUMENT_CREATED: 'Document created successfully',
  DOCUMENT_UPDATED: 'Document saved successfully',
  DOCUMENT_DELETED: 'Document deleted successfully',
  DOCUMENT_SHARED: 'Document shared successfully',

  MEETING_CREATED: 'Meeting scheduled successfully',
  MEETING_UPDATED: 'Meeting updated successfully',
  MEETING_DELETED: 'Meeting cancelled successfully',
  MEETING_JOINED: 'Joined meeting successfully',

  TEAM_CREATED: 'Team created successfully',
  TEAM_UPDATED: 'Team updated successfully',
  TEAM_MEMBER_INVITED: 'Team member invited successfully',

  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',

  FILE_UPLOADED: 'File uploaded successfully',
  EXPORT_COMPLETED: 'Export completed successfully'
}

// Default Values
export const DEFAULTS = {
  MEETING_DURATION: 60, // minutes
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  PAGE_SIZE: 20,
  MAX_COLLABORATORS: 10,
  MAX_MEETING_PARTICIPANTS: 25,
  MAX_FILE_SIZE_MB: 10,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  TYPING_TIMEOUT: 3000, // 3 seconds
  CURSOR_UPDATE_THROTTLE: 100, // 100ms
}

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^[+]?[1-9][\d\s\-\(\)]{7,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  MENTION: /@[a-zA-Z0-9_]+/g,
  HASHTAG: /#[a-zA-Z0-9_]+/g
}

// Feature Flags
export const FEATURE_FLAGS = {
  GOOGLE_WORKSPACE: import.meta.env.VITE_ENABLE_GOOGLE_WORKSPACE === 'true',
  REAL_TIME: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
  AI_FEATURES: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
  VIDEO_CALLS: import.meta.env.VITE_ENABLE_VIDEO_CALLS === 'true',
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  PWA: import.meta.env.VITE_ENABLE_PWA === 'true'
}

// Theme Configuration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#1976d2',
  SECONDARY_COLOR: '#dc004e',
  SUCCESS_COLOR: '#4caf50',
  WARNING_COLOR: '#ff9800',
  ERROR_COLOR: '#f44336',
  INFO_COLOR: '#2196f3',

  FONT_FAMILY: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
  FONT_SIZES: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  SPACING: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  BORDER_RADIUS: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px'
  }
}

// Export all constants as default
export default {
  API_CONFIG,
  GOOGLE_CONFIG,
  APP_CONFIG,
  USER_ROLES,
  TEAM_ROLES,
  PERMISSIONS,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_EXTENSIONS,
  MEETING_STATUS,
  MEETING_STATUS_LABELS,
  MEETING_STATUS_COLORS,
  UPLOAD_CONFIG,
  WEBRTC_CONFIG,
  UI_CONFIG,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  DEFAULTS,
  REGEX_PATTERNS,
  FEATURE_FLAGS,
  THEME_CONFIG
}
