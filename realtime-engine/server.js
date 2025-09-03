const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'realtime-engine' },
  transports: [
    new winston.transports.File({ filename: '/app/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '/app/logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Initialize Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.connect().catch(console.error);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store active connections and document collaborators
const activeConnections = new Map();
const documentCollaborators = new Map();
const meetingParticipants = new Map();

// JWT verification middleware for Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    socket.userId = decoded.sub || decoded.id;
    socket.userEmail = decoded.email;
    socket.userName = decoded.name;

    logger.info(`User authenticated: ${socket.userName} (${socket.userId})`);
    next();
  } catch (err) {
    logger.error('Socket authentication failed:', err.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.userName} (${socket.id})`);

  // Store active connection
  activeConnections.set(socket.id, {
    userId: socket.userId,
    userName: socket.userName,
    userEmail: socket.userEmail,
    connectedAt: new Date(),
    lastActivity: new Date()
  });

  // Update user presence in Redis
  updateUserPresence(socket.userId, 'online');

  // Handle document collaboration
  socket.on('document:join', async (data) => {
    try {
      const { documentId, teamId } = data;

      if (!documentId) {
        socket.emit('error', { message: 'Document ID is required' });
        return;
      }

      // Join document room
      socket.join(`document:${documentId}`);

      // Track collaborators
      if (!documentCollaborators.has(documentId)) {
        documentCollaborators.set(documentId, new Set());
      }
      documentCollaborators.get(documentId).add({
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id,
        cursor: null
      });

      // Store document session in Redis
      await redisClient.setEx(
        `doc_session:${socket.id}`,
        3600, // 1 hour TTL
        JSON.stringify({ documentId, teamId, userId: socket.userId })
      );

      // Notify other collaborators
      socket.to(`document:${documentId}`).emit('collaborator:joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });

      // Send current collaborators list
      const collaborators = Array.from(documentCollaborators.get(documentId) || []);
      socket.emit('document:collaborators', collaborators);

      logger.info(`User ${socket.userName} joined document ${documentId}`);
    } catch (error) {
      logger.error('Error joining document:', error);
      socket.emit('error', { message: 'Failed to join document' });
    }
  });

  socket.on('document:leave', async (data) => {
    try {
      const { documentId } = data;
      await leaveDocument(socket, documentId);
    } catch (error) {
      logger.error('Error leaving document:', error);
    }
  });

  socket.on('document:operation', async (data) => {
    try {
      const { documentId, operation, version } = data;

      if (!documentId || !operation) {
        socket.emit('error', { message: 'Document ID and operation are required' });
        return;
      }

      // Broadcast operation to other collaborators
      socket.to(`document:${documentId}`).emit('document:operation', {
        operation,
        version,
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });

      // Store operation in Redis for conflict resolution
      await redisClient.lPush(
        `doc_ops:${documentId}`,
        JSON.stringify({
          operation,
          version,
          userId: socket.userId,
          timestamp: new Date()
        })
      );

      // Keep only last 100 operations
      await redisClient.lTrim(`doc_ops:${documentId}`, 0, 99);

      logger.debug(`Document operation applied: ${documentId} by ${socket.userName}`);
    } catch (error) {
      logger.error('Error handling document operation:', error);
      socket.emit('error', { message: 'Failed to apply operation' });
    }
  });

  socket.on('document:cursor', (data) => {
    try {
      const { documentId, cursor } = data;

      // Update cursor position for collaborator
      if (documentCollaborators.has(documentId)) {
        const collaborators = documentCollaborators.get(documentId);
        for (const collaborator of collaborators) {
          if (collaborator.socketId === socket.id) {
            collaborator.cursor = cursor;
            break;
          }
        }
      }

      // Broadcast cursor position to other collaborators
      socket.to(`document:${documentId}`).emit('collaborator:cursor', {
        userId: socket.userId,
        userName: socket.userName,
        cursor,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating cursor:', error);
    }
  });

  socket.on('document:selection', (data) => {
    try {
      const { documentId, selection } = data;

      // Broadcast selection to other collaborators
      socket.to(`document:${documentId}`).emit('collaborator:selection', {
        userId: socket.userId,
        userName: socket.userName,
        selection,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error broadcasting selection:', error);
    }
  });

  // Handle meeting participation
  socket.on('meeting:join', async (data) => {
    try {
      const { meetingId, meetingUrl } = data;

      if (!meetingId) {
        socket.emit('error', { message: 'Meeting ID is required' });
        return;
      }

      // Join meeting room
      socket.join(`meeting:${meetingId}`);

      // Track participants
      if (!meetingParticipants.has(meetingId)) {
        meetingParticipants.set(meetingId, new Set());
      }
      meetingParticipants.get(meetingId).add({
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id,
        joinedAt: new Date(),
        videoEnabled: false,
        audioEnabled: false
      });

      // Notify other participants
      socket.to(`meeting:${meetingId}`).emit('participant:joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });

      // Send current participants list
      const participants = Array.from(meetingParticipants.get(meetingId) || []);
      socket.emit('meeting:participants', participants);

      logger.info(`User ${socket.userName} joined meeting ${meetingId}`);
    } catch (error) {
      logger.error('Error joining meeting:', error);
      socket.emit('error', { message: 'Failed to join meeting' });
    }
  });

  socket.on('meeting:leave', async (data) => {
    try {
      const { meetingId } = data;
      await leaveMeeting(socket, meetingId);
    } catch (error) {
      logger.error('Error leaving meeting:', error);
    }
  });

  socket.on('meeting:media-toggle', (data) => {
    try {
      const { meetingId, type, enabled } = data;

      // Update participant media status
      if (meetingParticipants.has(meetingId)) {
        const participants = meetingParticipants.get(meetingId);
        for (const participant of participants) {
          if (participant.socketId === socket.id) {
            if (type === 'video') {
              participant.videoEnabled = enabled;
            } else if (type === 'audio') {
              participant.audioEnabled = enabled;
            }
            break;
          }
        }
      }

      // Broadcast media status change
      socket.to(`meeting:${meetingId}`).emit('participant:media-toggle', {
        userId: socket.userId,
        userName: socket.userName,
        type,
        enabled,
        timestamp: new Date()
      });

      logger.debug(`User ${socket.userName} toggled ${type}: ${enabled}`);
    } catch (error) {
      logger.error('Error toggling media:', error);
    }
  });

  socket.on('meeting:chat-message', (data) => {
    try {
      const { meetingId, message } = data;

      if (!meetingId || !message) {
        socket.emit('error', { message: 'Meeting ID and message are required' });
        return;
      }

      // Broadcast chat message to meeting participants
      io.to(`meeting:${meetingId}`).emit('meeting:chat-message', {
        id: uuidv4(),
        message,
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });

      logger.debug(`Chat message in meeting ${meetingId} from ${socket.userName}`);
    } catch (error) {
      logger.error('Error sending chat message:', error);
    }
  });

  // Handle WebRTC signaling
  socket.on('webrtc:offer', (data) => {
    try {
      const { targetUserId, offer, meetingId } = data;

      // Find target user socket
      const targetSocket = findUserSocket(targetUserId);
      if (targetSocket) {
        targetSocket.emit('webrtc:offer', {
          fromUserId: socket.userId,
          fromUserName: socket.userName,
          offer,
          meetingId
        });
      }
    } catch (error) {
      logger.error('Error handling WebRTC offer:', error);
    }
  });

  socket.on('webrtc:answer', (data) => {
    try {
      const { targetUserId, answer, meetingId } = data;

      const targetSocket = findUserSocket(targetUserId);
      if (targetSocket) {
        targetSocket.emit('webrtc:answer', {
          fromUserId: socket.userId,
          fromUserName: socket.userName,
          answer,
          meetingId
        });
      }
    } catch (error) {
      logger.error('Error handling WebRTC answer:', error);
    }
  });

  socket.on('webrtc:ice-candidate', (data) => {
    try {
      const { targetUserId, candidate, meetingId } = data;

      const targetSocket = findUserSocket(targetUserId);
      if (targetSocket) {
        targetSocket.emit('webrtc:ice-candidate', {
          fromUserId: socket.userId,
          candidate,
          meetingId
        });
      }
    } catch (error) {
      logger.error('Error handling ICE candidate:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing:start', (data) => {
    try {
      const { documentId } = data;
      socket.to(`document:${documentId}`).emit('collaborator:typing', {
        userId: socket.userId,
        userName: socket.userName,
        typing: true
      });
    } catch (error) {
      logger.error('Error handling typing start:', error);
    }
  });

  socket.on('typing:stop', (data) => {
    try {
      const { documentId } = data;
      socket.to(`document:${documentId}`).emit('collaborator:typing', {
        userId: socket.userId,
        userName: socket.userName,
        typing: false
      });
    } catch (error) {
      logger.error('Error handling typing stop:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    logger.info(`User disconnected: ${socket.userName} (${socket.id})`);

    try {
      // Clean up document collaborations
      await cleanupUserCollaborations(socket);

      // Clean up meeting participations
      await cleanupUserMeetings(socket);

      // Remove from active connections
      activeConnections.delete(socket.id);

      // Update user presence
      const hasOtherConnections = Array.from(activeConnections.values())
        .some(conn => conn.userId === socket.userId);

      if (!hasOtherConnections) {
        await updateUserPresence(socket.userId, 'offline');
      }
    } catch (error) {
      logger.error('Error during disconnect cleanup:', error);
    }
  });

  // Update last activity
  socket.on('activity', () => {
    const connection = activeConnections.get(socket.id);
    if (connection) {
      connection.lastActivity = new Date();
    }
  });
});

// Helper functions
async function leaveDocument(socket, documentId) {
  socket.leave(`document:${documentId}`);

  // Remove from collaborators
  if (documentCollaborators.has(documentId)) {
    const collaborators = documentCollaborators.get(documentId);
    for (const collaborator of collaborators) {
      if (collaborator.socketId === socket.id) {
        collaborators.delete(collaborator);
        break;
      }
    }

    // Clean up empty collaborator sets
    if (collaborators.size === 0) {
      documentCollaborators.delete(documentId);
    }
  }

  // Notify other collaborators
  socket.to(`document:${documentId}`).emit('collaborator:left', {
    userId: socket.userId,
    userName: socket.userName,
    timestamp: new Date()
  });

  // Clean up Redis session
  await redisClient.del(`doc_session:${socket.id}`);

  logger.info(`User ${socket.userName} left document ${documentId}`);
}

async function leaveMeeting(socket, meetingId) {
  socket.leave(`meeting:${meetingId}`);

  // Remove from participants
  if (meetingParticipants.has(meetingId)) {
    const participants = meetingParticipants.get(meetingId);
    for (const participant of participants) {
      if (participant.socketId === socket.id) {
        participants.delete(participant);
        break;
      }
    }

    // Clean up empty participant sets
    if (participants.size === 0) {
      meetingParticipants.delete(meetingId);
    }
  }

  // Notify other participants
  socket.to(`meeting:${meetingId}`).emit('participant:left', {
    userId: socket.userId,
    userName: socket.userName,
    timestamp: new Date()
  });

  logger.info(`User ${socket.userName} left meeting ${meetingId}`);
}

function findUserSocket(userId) {
  for (const [socketId, connection] of activeConnections) {
    if (connection.userId === userId) {
      return io.sockets.sockets.get(socketId);
    }
  }
  return null;
}

async function cleanupUserCollaborations(socket) {
  for (const [documentId, collaborators] of documentCollaborators) {
    for (const collaborator of collaborators) {
      if (collaborator.socketId === socket.id) {
        await leaveDocument(socket, documentId);
        break;
      }
    }
  }
}

async function cleanupUserMeetings(socket) {
  for (const [meetingId, participants] of meetingParticipants) {
    for (const participant of participants) {
      if (participant.socketId === socket.id) {
        await leaveMeeting(socket, meetingId);
        break;
      }
    }
  }
}

async function updateUserPresence(userId, status) {
  try {
    await redisClient.setEx(
      `user_presence:${userId}`,
      300, // 5 minutes TTL
      JSON.stringify({
        status,
        lastSeen: new Date(),
        timestamp: Date.now()
      })
    );
  } catch (error) {
    logger.error('Error updating user presence:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'realtime-engine',
    timestamp: new Date().toISOString(),
    connections: activeConnections.size,
    documents: documentCollaborators.size,
    meetings: meetingParticipants.size
  });
});

// Get active collaborators for a document
app.get('/document/:documentId/collaborators', (req, res) => {
  const { documentId } = req.params;
  const collaborators = Array.from(documentCollaborators.get(documentId) || []);
  res.json({ collaborators });
});

// Get active participants for a meeting
app.get('/meeting/:meetingId/participants', (req, res) => {
  const { meetingId } = req.params;
  const participants = Array.from(meetingParticipants.get(meetingId) || []);
  res.json({ participants });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`CollabSpace Realtime Engine listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  // Close Redis connection
  await redisClient.quit();

  // Close server
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };
