// Helper utility functions for CollabSpace

import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns'
import { REGEX_PATTERNS, ERROR_CODES, DOCUMENT_TYPE_EXTENSIONS } from './constants'

/**
 * Date and Time Utilities
 */
export const dateUtils = {
  // Format date for display
  formatDate: (date, formatString = 'MMM d, yyyy') => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatString)
  },

  // Format time for display
  formatTime: (date, formatString = 'h:mm a') => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatString)
  },

  // Format datetime for display
  formatDateTime: (date, formatString = 'MMM d, yyyy 'at' h:mm a') => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatString)
  },

  // Relative time (e.g., "2 hours ago")
  formatRelative: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  },

  // Smart date formatting
  formatSmart: (date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? parseISO(date) : date

    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'h:mm a')}`
    } else if (isTomorrow(dateObj)) {
      return `Tomorrow at ${format(dateObj, 'h:mm a')}`
    } else if (isThisWeek(dateObj)) {
      return format(dateObj, 'EEEE 'at' h:mm a')
    } else {
      return format(dateObj, 'MMM d 'at' h:mm a')
    }
  },

  // Check if date is in the past
  isPast: (date) => {
    if (!date) return false
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return dateObj < new Date()
  },

  // Add minutes to date
  addMinutes: (date, minutes) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return new Date(dateObj.getTime() + minutes * 60000)
  }
}

/**
 * String Utilities
 */
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  // Title case
  titleCase: (str) => {
    if (!str) return ''
    return str.split(' ').map(word => stringUtils.capitalize(word)).join(' ')
  },

  // Truncate string
  truncate: (str, length = 50, suffix = '...') => {
    if (!str || str.length <= length) return str
    return str.substring(0, length) + suffix
  },

  // Generate slug from string
  slugify: (str) => {
    if (!str) return ''
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  // Extract initials
  getInitials: (name) => {
    if (!name) return ''
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  },

  // Generate random string
  randomString: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // Generate UUID
  generateUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  // Extract mentions from text
  extractMentions: (text) => {
    if (!text) return []
    const matches = text.match(REGEX_PATTERNS.MENTION) || []
    return matches.map(match => match.substring(1)) // Remove @ symbol
  },

  // Extract hashtags from text
  extractHashtags: (text) => {
    if (!text) return []
    const matches = text.match(REGEX_PATTERNS.HASHTAG) || []
    return matches.map(match => match.substring(1)) // Remove # symbol
  }
}

/**
 * Validation Utilities
 */
export const validationUtils = {
  // Email validation
  isValidEmail: (email) => {
    return REGEX_PATTERNS.EMAIL.test(email)
  },

  // Phone validation
  isValidPhone: (phone) => {
    return REGEX_PATTERNS.PHONE.test(phone)
  },

  // URL validation
  isValidUrl: (url) => {
    return REGEX_PATTERNS.URL.test(url)
  },

  // Password strength validation
  isStrongPassword: (password) => {
    return REGEX_PATTERNS.PASSWORD.test(password)
  },

  // Required field validation
  isRequired: (value) => {
    return value !== null && value !== undefined && value !== ''
  },

  // Minimum length validation
  minLength: (value, length) => {
    return value && value.length >= length
  },

  // Maximum length validation
  maxLength: (value, length) => {
    return !value || value.length <= length
  },

  // File type validation
  isValidFileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type)
  },

  // File size validation (in bytes)
  isValidFileSize: (file, maxSize) => {
    return file.size <= maxSize
  }
}

/**
 * Array Utilities
 */
export const arrayUtils = {
  // Remove duplicates
  unique: (array, key) => {
    if (!key) return [...new Set(array)]
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  },

  // Group by key
  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  },

  // Sort by key
  sortBy: (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
      let aVal = a[key]
      let bVal = b[key]

      // Handle dates
      if (aVal instanceof Date || typeof aVal === 'string' && !isNaN(Date.parse(aVal))) {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (direction === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      }
    })
  },

  // Paginate array
  paginate: (array, page = 1, pageSize = 20) => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return {
      items: array.slice(startIndex, endIndex),
      totalItems: array.length,
      currentPage: page,
      totalPages: Math.ceil(array.length / pageSize),
      pageSize,
      hasMore: endIndex < array.length
    }
  },

  // Shuffle array
  shuffle: (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

/**
 * Object Utilities
 */
export const objectUtils = {
  // Deep clone
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj))
  },

  // Pick properties
  pick: (obj, keys) => {
    const result = {}
    keys.forEach(key => {
      if (key in obj) result[key] = obj[key]
    })
    return result
  },

  // Omit properties
  omit: (obj, keys) => {
    const result = { ...obj }
    keys.forEach(key => delete result[key])
    return result
  },

  // Check if object is empty
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0
  },

  // Deep merge objects
  merge: (target, ...sources) => {
    if (!sources.length) return target
    const source = sources.shift()

    if (objectUtils.isObject(target) && objectUtils.isObject(source)) {
      for (const key in source) {
        if (objectUtils.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          objectUtils.merge(target[key], source[key])
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }

    return objectUtils.merge(target, ...sources)
  },

  // Check if value is object
  isObject: (item) => {
    return item && typeof item === 'object' && !Array.isArray(item)
  }
}

/**
 * File Utilities
 */
export const fileUtils = {
  // Format file size
  formatFileSize: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  },

  // Get file extension
  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase()
  },

  // Get document type from filename
  getDocumentType: (filename) => {
    const extension = fileUtils.getFileExtension(filename)
    for (const [type, ext] of Object.entries(DOCUMENT_TYPE_EXTENSIONS)) {
      if (ext.substring(1) === extension) {
        return type
      }
    }
    return 'DOCUMENT'
  },

  // Read file as text
  readFileAsText: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  },

  // Read file as data URL
  readFileAsDataURL: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
  },

  // Download file
  downloadFile: (data, filename, type = 'text/plain') => {
    const blob = new Blob([data], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

/**
 * Error Handling Utilities
 */
export const errorUtils = {
  // Get user-friendly error message
  getErrorMessage: (error) => {
    if (typeof error === 'string') return error
    if (error?.response?.data?.message) return error.response.data.message
    if (error?.message) return error.message
    return 'An unexpected error occurred'
  },

  // Get error code
  getErrorCode: (error) => {
    if (error?.response?.data?.code) return error.response.data.code
    if (error?.code) return error.code
    return ERROR_CODES.SERVER_ERROR
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response && error.request
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    const status = error?.response?.status
    return status === 401 || status === 403
  },

  // Log error with context
  logError: (error, context = {}) => {
    console.error('Error occurred:', {
      message: errorUtils.getErrorMessage(error),
      code: errorUtils.getErrorCode(error),
      context,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * URL Utilities
 */
export const urlUtils = {
  // Build query string
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value)
      }
    })
    return searchParams.toString()
  },

  // Parse query string
  parseQueryString: (queryString) => {
    const params = {}
    const searchParams = new URLSearchParams(queryString)
    for (const [key, value] of searchParams) {
      params[key] = value
    }
    return params
  },

  // Join URL paths
  joinPaths: (...paths) => {
    return paths
      .map((path, index) => {
        if (index === 0) {
          return path.replace(/\/$/, '')
        } else {
          return path.replace(/^\///, '').replace(/\/$/, '')
        }
      })
      .join('/')
  }
}

/**
 * Local Storage Utilities
 */
export const storageUtils = {
  // Set item with expiration
  setItem: (key, value, expirationMs) => {
    const item = {
      value,
      expiry: expirationMs ? Date.now() + expirationMs : null
    }
    localStorage.setItem(key, JSON.stringify(item))
  },

  // Get item with expiration check
  getItem: (key) => {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    try {
      const item = JSON.parse(itemStr)
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key)
        return null
      }
      return item.value
    } catch {
      return null
    }
  },

  // Remove item
  removeItem: (key) => {
    localStorage.removeItem(key)
  },

  // Clear all items
  clear: () => {
    localStorage.clear()
  },

  // Check if storage is available
  isAvailable: () => {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Performance Utilities
 */
export const performanceUtils = {
  // Debounce function
  debounce: (func, wait, immediate = false) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func(...args)
    }
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Measure execution time
  measureTime: (name, func) => {
    const start = performance.now()
    const result = func()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  },

  // Async measure execution time
  measureTimeAsync: async (name, func) => {
    const start = performance.now()
    const result = await func()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  }
}

// Export all utilities
export default {
  dateUtils,
  stringUtils,
  validationUtils,
  arrayUtils,
  objectUtils,
  fileUtils,
  errorUtils,
  urlUtils,
  storageUtils,
  performanceUtils
}
