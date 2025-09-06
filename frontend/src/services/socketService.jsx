
import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  useEffect(() => {
    // Get auth token for socket connection
    const token = localStorage.getItem('accessToken')

    if (!token) {
      console.log('No auth token found, skipping socket connection')
      return
    }

    // Initialize socket connection
    const socketInstance = io(
      import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001',
      {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5
      }
    )

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setConnected(true)
      setConnectionError(null)
      toast.success('Connected to real-time services')
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setConnected(false)

      if (reason !== 'io client disconnect') {
        toast.error('Lost connection to real-time services')
      }
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnectionError(error.message)
      setConnected(false)
      toast.error('Failed to connect to real-time services')
    })

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      setConnected(true)
      setConnectionError(null)
      toast.success('Reconnected to real-time services')
    })

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
      setConnectionError(error.message)
    })

    // Document collaboration events
    socketInstance.on('document:operation', (data) => {
      // Handle document operations from other users
      console.log('Document operation received:', data)
    })

    socketInstance.on('collaborator:joined', (data) => {
      toast.success(`${data.userName} joined the document`)
    })

    socketInstance.on('collaborator:left', (data) => {
      toast(`${data.userName} left the document`)
    })

    socketInstance.on('collaborator:cursor', (data) => {
      // Handle cursor position updates
      console.log('Cursor update:', data)
    })

    // Meeting events
    socketInstance.on('participant:joined', (data) => {
      toast.success(`${data.userName} joined the meeting`)
    })

    socketInstance.on('participant:left', (data) => {
      toast(`${data.userName} left the meeting`)
    })

    socketInstance.on('meeting:chat-message', (data) => {
      // Handle chat messages in meetings
      console.log('Meeting chat message:', data)
    })

    // Notification events
    socketInstance.on('notification', (data) => {
      toast.info(data.message)
    })

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error('Real-time service error: ' + error.message)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [])

  // Socket helper functions
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit:', event)
    }
  }

  const joinDocument = (documentId, teamId) => {
    emit('document:join', { documentId, teamId })
  }

  const leaveDocument = (documentId) => {
    emit('document:leave', { documentId })
  }

  const sendDocumentOperation = (documentId, operation, version) => {
    emit('document:operation', { documentId, operation, version })
  }

  const updateCursor = (documentId, cursor) => {
    emit('document:cursor', { documentId, cursor })
  }

  const startTyping = (documentId) => {
    emit('typing:start', { documentId })
  }

  const stopTyping = (documentId) => {
    emit('typing:stop', { documentId })
  }

  const joinMeeting = (meetingId, meetingUrl) => {
    emit('meeting:join', { meetingId, meetingUrl })
  }

  const leaveMeeting = (meetingId) => {
    emit('meeting:leave', { meetingId })
  }

  const toggleMeetingMedia = (meetingId, type, enabled) => {
    emit('meeting:media-toggle', { meetingId, type, enabled })
  }

  const sendChatMessage = (meetingId, message) => {
    emit('meeting:chat-message', { meetingId, message })
  }

  // WebRTC signaling helpers
  const sendWebRTCOffer = (targetUserId, offer, meetingId) => {
    emit('webrtc:offer', { targetUserId, offer, meetingId })
  }

  const sendWebRTCAnswer = (targetUserId, answer, meetingId) => {
    emit('webrtc:answer', { targetUserId, answer, meetingId })
  }

  const sendICECandidate = (targetUserId, candidate, meetingId) => {
    emit('webrtc:ice-candidate', { targetUserId, candidate, meetingId })
  }

  const value = {
    socket,
    connected,
    connectionError,
    emit,
    // Document collaboration
    joinDocument,
    leaveDocument,
    sendDocumentOperation,
    updateCursor,
    startTyping,
    stopTyping,
    // Meeting functionality
    joinMeeting,
    leaveMeeting,
    toggleMeetingMedia,
    sendChatMessage,
    // WebRTC signaling
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendICECandidate
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
