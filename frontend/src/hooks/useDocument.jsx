import { useState, useEffect, useCallback, useRef } from 'react'
import { apiService } from '@services/api'
import { useSocket } from '@services/socketService'
import { useAuth } from '@hooks/useAuth'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'

export const useDocument = (documentId, options = {}) => {
  const { user } = useAuth()
  const { 
    joinDocument, 
    leaveDocument, 
    sendDocumentOperation, 
    updateCursor,
    startTyping,
    stopTyping,
    connected 
  } = useSocket()

  const {
    autoSave = true,
    autoSaveDelay = 2000,
    onError,
    onSave,
    onLoad,
    onCollaboratorJoin,
    onCollaboratorLeave
  } = options

  // State
  const [document, setDocument] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [error, setError] = useState(null)
  const [collaborators, setCollaborators] = useState([])
  const [cursors, setCursors] = useState({})
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [version, setVersion] = useState(1)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockedBy, setLockedBy] = useState(null)

  // Refs
  const isTypingRef = useRef(false)
  const lastContentRef = useRef('')
  const operationQueueRef = useRef([])

  // Load document
  const loadDocument = useCallback(async () => {
    if (!documentId) return

    setLoading(true)
    setError(null)

    try {
      const doc = await apiService.getDocument(documentId)
      setDocument(doc)
      setContent(doc.content || '')
      setVersion(doc.version || 1)
      setIsLocked(doc.isLocked || false)
      setLockedBy(doc.lockedBy || null)
      lastContentRef.current = doc.content || ''

      if (onLoad) {
        onLoad(doc)
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to load document'
      setError(errorMsg)
      if (onError) {
        onError(err)
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }, [documentId, onLoad, onError])

  // Save document
  const saveDocument = useCallback(async (contentToSave = content) => {
    if (!document || !hasUnsavedChanges) return

    setSaving(true)
    try {
      const updatedDoc = await apiService.updateDocument(document.id, {
        content: contentToSave,
        version: version + 1
      })

      setVersion(updatedDoc.version)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      lastContentRef.current = contentToSave

      if (onSave) {
        onSave(updatedDoc)
      }

      toast.success('Document saved')
    } catch (err) {
      const errorMsg = err.message || 'Failed to save document'
      setError(errorMsg)
      if (onError) {
        onError(err)
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setSaving(false)
    }
  }, [document, content, version, hasUnsavedChanges, onSave, onError])

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce((contentToSave) => {
      if (autoSave) {
        saveDocument(contentToSave)
      }
    }, autoSaveDelay),
    [saveDocument, autoSave, autoSaveDelay]
  )

  // Debounced stop typing
  const debouncedStopTyping = useCallback(
    debounce(() => {
      if (isTypingRef.current && documentId) {
        stopTyping(documentId)
        isTypingRef.current = false
      }
    }, 1000),
    [documentId, stopTyping]
  )

  // Update content
  const updateContent = useCallback((newContent, options = {}) => {
    const { 
      sendOperation = true, 
      updateCursorPos = true, 
      cursorPosition = 0,
      source = 'user' 
    } = options

    setContent(newContent)

    // Check for changes
    const hasChanges = newContent !== lastContentRef.current
    setHasUnsavedChanges(hasChanges)

    if (source === 'user' && sendOperation && connected && documentId) {
      // Create operation for other collaborators
      const operation = {
        type: 'content_change',
        content: newContent,
        user: user.id,
        userName: user.name,
        timestamp: Date.now(),
        cursorPosition
      }

      sendDocumentOperation(documentId, operation, version + 1)
      setVersion(prev => prev + 1)

      // Update cursor position
      if (updateCursorPos) {
        updateCursor(documentId, { 
          position: cursorPosition, 
          user: user.id,
          userName: user.name 
        })
      }

      // Handle typing indicators
      if (!isTypingRef.current) {
        startTyping(documentId)
        isTypingRef.current = true
      }
      debouncedStopTyping()

      // Auto-save
      if (hasChanges) {
        debouncedSave(newContent)
      }
    }
  }, [
    connected, 
    documentId, 
    user, 
    version, 
    sendDocumentOperation, 
    updateCursor, 
    startTyping, 
    debouncedStopTyping, 
    debouncedSave
  ])

  // Lock/unlock document
  const lockDocument = useCallback(async () => {
    if (!document) return

    try {
      await apiService.lockDocument(document.id)
      setIsLocked(true)
      setLockedBy(user.id)
      toast.success('Document locked for editing')
    } catch (err) {
      toast.error('Failed to lock document')
    }
  }, [document, user])

  const unlockDocument = useCallback(async () => {
    if (!document) return

    try {
      await apiService.unlockDocument(document.id)
      setIsLocked(false)
      setLockedBy(null)
      toast.success('Document unlocked')
    } catch (err) {
      toast.error('Failed to unlock document')
    }
  }, [document])

  // Apply operation from collaborator
  const applyOperation = useCallback((operation) => {
    if (operation.user === user.id) return // Skip own operations

    switch (operation.type) {
      case 'content_change':
        setContent(operation.content)
        setVersion(operation.version || version + 1)
        break

      case 'cursor_update':
        setCursors(prev => ({
          ...prev,
          [operation.user]: operation.cursor
        }))
        break

      case 'typing_start':
        setTypingUsers(prev => new Set([...prev, operation.userName]))
        break

      case 'typing_stop':
        setTypingUsers(prev => {
          const next = new Set(prev)
          next.delete(operation.userName)
          return next
        })
        break

      default:
        console.warn('Unknown operation type:', operation.type)
    }
  }, [user.id, version])

  // Join/leave document collaboration
  useEffect(() => {
    if (!documentId || !connected || !document) return

    joinDocument(documentId, document.teamId)

    return () => {
      leaveDocument(documentId)
    }
  }, [documentId, connected, document, joinDocument, leaveDocument])

  // Load document on mount
  useEffect(() => {
    if (documentId) {
      loadDocument()
    }
  }, [documentId, loadDocument])

  // Handle socket events
  useEffect(() => {
    // These would typically be handled by the socket service
    // and passed down through context or callbacks
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Save any unsaved changes before unmounting
      if (hasUnsavedChanges && content !== lastContentRef.current) {
        saveDocument(content)
      }
    }
  }, [hasUnsavedChanges, content, saveDocument])

  return {
    // Document state
    document,
    content,
    loading,
    saving,
    error,
    lastSaved,
    version,
    hasUnsavedChanges,
    isLocked,
    lockedBy,

    // Collaboration state
    collaborators,
    cursors,
    typingUsers,

    // Actions
    updateContent,
    saveDocument,
    loadDocument,
    lockDocument,
    unlockDocument,
    applyOperation,

    // Computed properties
    canEdit: !isLocked || lockedBy === user.id,
    isOwner: document?.createdBy === user.id,
    lastModified: document?.updatedAt ? new Date(document.updatedAt) : null
  }
}

export default useDocument
