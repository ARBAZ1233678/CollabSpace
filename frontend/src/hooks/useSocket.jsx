import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@hooks/useAuth'
import toast from 'react-hot-toast'

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  const reconnectTimeoutRef = useRef(null)
  const heartbeatIntervalRef = useRef(null)

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!isAuthenticated || !user) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socketInstance = io(
      import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001',
      {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5,
        forceNew: true
      }
    )

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setConnected(true)
      setConnectionError(null)
      toast.success('Connected to real-time services')

      // Start heartbeat
      startHeartbeat(socketInstance)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setConnected(false)
      stopHeartbeat()

      if (reason !== 'io client disconnect') {
        toast.error('Lost connection to real-time services')
        scheduleReconnect()
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

    // User presence events
    socketInstance.on('user:online', (userData) => {
      setOnlineUsers(prev => new Set([...prev, userData.userId]))
    })

    socketInstance.on('user:offline', (userData) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(userData.userId)
        return next
      })
    })

    // Error handling
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error('Real-time service error: ' + error.message)
    })

    setSocket(socketInstance)
    return socketInstance
  }, [isAuthenticated, user])

  // Start heartbeat to keep connection alive
  const startHeartbeat = useCallback((socketInstance) => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('heartbeat', { timestamp: Date.now() })
      }
    }, 30000) // Every 30 seconds
  }, [])

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Schedule reconnection attempt
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect...')
      initializeSocket()
      reconnectTimeoutRef.current = null
    }, 3000)
  }, [initializeSocket])

  // Socket helper functions
  const emit = useCallback((event, data) => {
    if (socket && connected) {
      socket.emit(event, data)
      return true
    } else {
      console.warn('Socket not connected, cannot emit:', event)
      return false
    }
  }, [socket, connected])

  const emitWithCallback = useCallback((event, data, callback) => {
    if (socket && connected) {
      socket.emit(event, data, callback)
      return true
    } else {
      console.warn('Socket not connected, cannot emit:', event)
      if (callback) callback(new Error('Socket not connected'))
      return false
    }
  }, [socket, connected])

  // Document collaboration methods
  const joinDocument = useCallback((documentId, teamId) => {
    return emit('document:join', { documentId, teamId })
  }, [emit])

  const leaveDocument = useCallback((documentId) => {
    return emit('document:leave', { documentId })
  }, [emit])

  const sendDocumentOperation = useCallback((documentId, operation, version) => {
    return emit('document:operation', { documentId, operation, version })
  }, [emit])

  const updateCursor = useCallback((documentId, cursor) => {
    return emit('document:cursor', { documentId, cursor })
  }, [emit])

  const sendSelection = useCallback((documentId, selection) => {
    return emit('document:selection', { documentId, selection })
  }, [emit])

  const startTyping = useCallback((documentId) => {
    return emit('typing:start', { documentId })
  }, [emit])

  const stopTyping = useCallback((documentId) => {
    return emit('typing:stop', { documentId })
  }, [emit])

  // Meeting methods
  const joinMeeting = useCallback((meetingId, meetingUrl) => {
    return emit('meeting:join', { meetingId, meetingUrl })
  }, [emit])

  const leaveMeeting = useCallback((meetingId) => {
    return emit('meeting:leave', { meetingId })
  }, [emit])

  const toggleMeetingMedia = useCallback((meetingId, type, enabled) => {
    return emit('meeting:media-toggle', { meetingId, type, enabled })
  }, [emit])

  const sendChatMessage = useCallback((meetingId, message) => {
    return emit('meeting:chat-message', { meetingId, message })
  }, [emit])

  // WebRTC signaling methods
  const sendWebRTCOffer = useCallback((targetUserId, offer, meetingId) => {
    return emit('webrtc:offer', { targetUserId, offer, meetingId })
  }, [emit])

  const sendWebRTCAnswer = useCallback((targetUserId, answer, meetingId) => {
    return emit('webrtc:answer', { targetUserId, answer, meetingId })
  }, [emit])

  const sendICECandidate = useCallback((targetUserId, candidate, meetingId) => {
    return emit('webrtc:ice-candidate', { targetUserId, candidate, meetingId })
  }, [emit])

  // Event listener management
  const addEventListener = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback)
      return () => socket.off(event, callback)
    }
    return () => {}
  }, [socket])

  const removeEventListener = useCallback((event, callback) => {
    if (socket) {
      socket.off(event, callback)
    }
  }, [socket])

  // Initialize socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      stopHeartbeat()
    }
  }, [isAuthenticated, user, initializeSocket, stopHeartbeat])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [socket])

  return {
    // Connection state
    socket,
    connected,
    connectionError,
    onlineUsers,

    // Connection methods
    initializeSocket,
    emit,
    emitWithCallback,

    // Document collaboration
    joinDocument,
    leaveDocument,
    sendDocumentOperation,
    updateCursor,
    sendSelection,
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
    sendICECandidate,

    // Event management
    addEventListener,
    removeEventListener,

    // Utility methods
    isUserOnline: (userId) => onlineUsers.has(userId)
  }
}

export default useSocket
