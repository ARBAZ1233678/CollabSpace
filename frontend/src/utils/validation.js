// Form validation utilities for CollabSpace

import { REGEX_PATTERNS, UPLOAD_CONFIG } from './constants'

/**
 * Basic validation functions
 */
export const validators = {
  // Required field validator
  required: (value, message = 'This field is required') => {
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      return message
    }
    return null
  },

  // Email validator
  email: (value, message = 'Please enter a valid email address') => {
    if (!value) return null
    if (!REGEX_PATTERNS.EMAIL.test(value)) {
      return message
    }
    return null
  },

  // Phone validator
  phone: (value, message = 'Please enter a valid phone number') => {
    if (!value) return null
    if (!REGEX_PATTERNS.PHONE.test(value)) {
      return message
    }
    return null
  },

  // URL validator
  url: (value, message = 'Please enter a valid URL') => {
    if (!value) return null
    if (!REGEX_PATTERNS.URL.test(value)) {
      return message
    }
    return null
  },

  // Password validator
  password: (value, message = 'Password must be at least 8 characters with uppercase, lowercase, number and special character') => {
    if (!value) return null
    if (!REGEX_PATTERNS.PASSWORD.test(value)) {
      return message
    }
    return null
  },

  // Minimum length validator
  minLength: (min) => (value, message = `Must be at least ${min} characters`) => {
    if (!value) return null
    if (value.length < min) {
      return message
    }
    return null
  },

  // Maximum length validator
  maxLength: (max) => (value, message = `Must be no more than ${max} characters`) => {
    if (!value) return null
    if (value.length > max) {
      return message
    }
    return null
  },

  // Pattern validator
  pattern: (regex, message = 'Invalid format') => (value) => {
    if (!value) return null
    if (!regex.test(value)) {
      return message
    }
    return null
  },

  // Number validator
  number: (value, message = 'Must be a valid number') => {
    if (!value) return null
    if (isNaN(Number(value))) {
      return message
    }
    return null
  },

  // Integer validator
  integer: (value, message = 'Must be a whole number') => {
    if (!value) return null
    if (!Number.isInteger(Number(value))) {
      return message
    }
    return null
  },

  // Minimum value validator
  min: (minimum) => (value, message = `Must be at least ${minimum}`) => {
    if (!value) return null
    if (Number(value) < minimum) {
      return message
    }
    return null
  },

  // Maximum value validator
  max: (maximum) => (value, message = `Must be no more than ${maximum}`) => {
    if (!value) return null
    if (Number(value) > maximum) {
      return message
    }
    return null
  },

  // Date validator
  date: (value, message = 'Please enter a valid date') => {
    if (!value) return null
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return message
    }
    return null
  },

  // Future date validator
  futureDate: (value, message = 'Date must be in the future') => {
    if (!value) return null
    const date = new Date(value)
    if (date <= new Date()) {
      return message
    }
    return null
  },

  // Past date validator
  pastDate: (value, message = 'Date must be in the past') => {
    if (!value) return null
    const date = new Date(value)
    if (date >= new Date()) {
      return message
    }
    return null
  },

  // Confirmation validator (for password confirmation)
  confirmation: (originalValue) => (value, message = 'Values do not match') => {
    if (!value) return null
    if (value !== originalValue) {
      return message
    }
    return null
  },

  // File type validator
  fileType: (allowedTypes) => (file, message = 'File type not allowed') => {
    if (!file) return null
    if (!allowedTypes.includes(file.type)) {
      return message
    }
    return null
  },

  // File size validator
  fileSize: (maxSize) => (file, message = `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`) => {
    if (!file) return null
    if (file.size > maxSize) {
      return message
    }
    return null
  },

  // Custom validator
  custom: (validatorFn, message = 'Invalid value') => (value) => {
    if (!value) return null
    if (!validatorFn(value)) {
      return message
    }
    return null
  }
}

/**
 * Composite validation functions
 */
export const validate = {
  // Run multiple validators on a single field
  field: (value, validatorArray) => {
    for (const validator of validatorArray) {
      const error = validator(value)
      if (error) return error
    }
    return null
  },

  // Validate entire form
  form: (values, validationSchema) => {
    const errors = {}
    let hasErrors = false

    Object.keys(validationSchema).forEach(field => {
      const fieldValidators = validationSchema[field]
      const fieldValue = values[field]
      const error = validate.field(fieldValue, fieldValidators)

      if (error) {
        errors[field] = error
        hasErrors = true
      }
    })

    return {
      errors,
      isValid: !hasErrors
    }
  },

  // Async validation (for server-side validation)
  async: async (value, asyncValidator) => {
    try {
      const result = await asyncValidator(value)
      return result ? null : 'Validation failed'
    } catch (error) {
      return error.message || 'Validation error'
    }
  }
}

/**
 * Pre-built validation schemas for common forms
 */
export const validationSchemas = {
  // User login form
  login: {
    email: [validators.required, validators.email],
    password: [validators.required]
  },

  // User registration form
  register: {
    name: [validators.required, validators.minLength(2), validators.maxLength(50)],
    email: [validators.required, validators.email],
    password: [validators.required, validators.password],
    confirmPassword: [], // Will be set dynamically with confirmation validator
    acceptTerms: [validators.required]
  },

  // User profile form
  profile: {
    name: [validators.required, validators.minLength(2), validators.maxLength(50)],
    email: [validators.required, validators.email],
    phone: [validators.phone],
    location: [validators.maxLength(100)],
    company: [validators.maxLength(100)],
    bio: [validators.maxLength(500)]
  },

  // Document creation form
  document: {
    title: [validators.required, validators.minLength(1), validators.maxLength(255)],
    type: [validators.required],
    description: [validators.maxLength(1000)]
  },

  // Meeting creation form
  meeting: {
    title: [validators.required, validators.minLength(3), validators.maxLength(255)],
    description: [validators.maxLength(1000)],
    startTime: [validators.required, validators.date, validators.futureDate],
    duration: [validators.required, validators.number, validators.min(15), validators.max(480)]
  },

  // Team creation form
  team: {
    name: [validators.required, validators.minLength(2), validators.maxLength(100)],
    description: [validators.maxLength(500)]
  },

  // Comment form
  comment: {
    content: [validators.required, validators.minLength(1), validators.maxLength(1000)]
  },

  // File upload validation
  fileUpload: {
    file: [
      validators.required,
      validators.fileType(UPLOAD_CONFIG.ALLOWED_TYPES),
      validators.fileSize(UPLOAD_CONFIG.MAX_FILE_SIZE)
    ]
  },

  // Password change form
  changePassword: {
    currentPassword: [validators.required],
    newPassword: [validators.required, validators.password],
    confirmNewPassword: [] // Will be set dynamically with confirmation validator
  },

  // Team invitation form
  teamInvitation: {
    email: [validators.required, validators.email],
    role: [validators.required],
    message: [validators.maxLength(500)]
  },

  // Settings form
  settings: {
    emailNotifications: [],
    pushNotifications: [],
    meetingReminders: [],
    theme: [],
    language: [],
    timezone: []
  }
}

/**
 * Real-time validation hook
 */
export const useValidation = (initialValues = {}, schema = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate single field
  const validateField = useCallback((name, value) => {
    if (!schema[name]) return null

    // Handle confirmation fields dynamically
    let validators = schema[name]
    if (name === 'confirmPassword' || name === 'confirmNewPassword') {
      const originalField = name === 'confirmPassword' ? 'password' : 'newPassword'
      validators = [validators.confirmation(values[originalField])]
    }

    return validate.field(value, validators)
  }, [schema, values])

  // Handle input change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))

    // Validate if field has been touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateField, touched])

  // Handle input blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [validateField, values])

  // Validate entire form
  const validateForm = useCallback(() => {
    const result = validate.form(values, schema)
    setErrors(result.errors)
    return result
  }, [values, schema])

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true)

    // Mark all fields as touched
    const touchedFields = {}
    Object.keys(schema).forEach(field => {
      touchedFields[field] = true
    })
    setTouched(touchedFields)

    // Validate form
    const result = validateForm()

    if (result.isValid) {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }

    setIsSubmitting(false)
    return result.isValid
  }, [values, schema, validateForm])

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0
  }
}

/**
 * Form validation utilities
 */
export const formUtils = {
  // Get field props for form libraries
  getFieldProps: (name, formik) => ({
    name,
    value: formik.values[name] || '',
    onChange: (e) => formik.setFieldValue(name, e.target.value),
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name]
  }),

  // Check if form has errors
  hasErrors: (errors) => {
    return Object.values(errors).some(error => error !== null && error !== undefined && error !== '')
  },

  // Get first error message
  getFirstError: (errors) => {
    const errorValues = Object.values(errors).filter(error => error)
    return errorValues.length > 0 ? errorValues[0] : null
  },

  // Format error for display
  formatError: (error) => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    return 'Validation error'
  }
}

export default {
  validators,
  validate,
  validationSchemas,
  useValidation,
  formUtils
}
