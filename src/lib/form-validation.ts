import { z } from 'zod'

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
}

// Common validation schemas
export const CommonValidations = {
  // String validations
  requiredString: (message = 'This field is required') =>
    z.string().min(1, message),

  email: (message = 'Please enter a valid email address') =>
    z.string().email(message),

  phone: (message = 'Please enter a valid phone number') =>
    z.string().regex(ValidationPatterns.phone, message),

  url: (message = 'Please enter a valid URL') =>
    z.string().url(message),

  strongPassword: (minLength = 8, message = 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character') =>
    z.string()
      .min(minLength, `Password must be at least ${minLength} characters`)
      .regex(ValidationPatterns.strongPassword, message),

  slug: (message = 'Only lowercase letters, numbers and hyphens allowed') =>
    z.string().regex(ValidationPatterns.slug, message),

  // Number validations
  positiveNumber: (message = 'Must be a positive number') =>
    z.number().positive(message),

  nonNegativeNumber: (message = 'Must be zero or positive') =>
    z.number().nonnegative(message),

  integerInRange: (min: number, max: number, message?: string) =>
    z.number().int().min(min).max(max, message || `Must be between ${min} and ${max}`),

  // Date validations
  futureDate: (message = 'Date must be in the future') =>
    z.date().refine(date => date > new Date(), { message }),

  pastDate: (message = 'Date must be in the past') =>
    z.date().refine(date => date < new Date(), { message }),

  dateInRange: (startDate: Date, endDate: Date, message?: string) =>
    z.date().refine(
      date => date >= startDate && date <= endDate,
      { message: message || `Date must be between ${startDate.toDateString()} and ${endDate.toDateString()}` }
    ),

  // File validations
  fileSize: (maxSizeInMB: number, message?: string) =>
    z.instanceof(File).refine(
      file => file.size <= maxSizeInMB * 1024 * 1024,
      { message: message || `File size must be less than ${maxSizeInMB}MB` }
    ),

  fileType: (allowedTypes: string[], message?: string) =>
    z.instanceof(File).refine(
      file => allowedTypes.includes(file.type),
      { message: message || `File type must be one of: ${allowedTypes.join(', ')}` }
    ),

  imageFile: (maxSizeInMB = 5, message?: string) =>
    z.instanceof(File)
      .refine(file => file.size <= maxSizeInMB * 1024 * 1024, {
        message: `Image size must be less than ${maxSizeInMB}MB`
      })
      .refine(file => file.type.startsWith('image/'), {
        message: message || 'File must be an image'
      }),

  // Array validations
  nonEmptyArray: <T>(message = 'At least one item is required') =>
    z.array(z.any()).min(1, message) as z.ZodArray<z.ZodType<T>>,

  uniqueArray: <T>(message = 'Duplicate items are not allowed') =>
    z.array(z.any()).refine(
      arr => new Set(arr).size === arr.length,
      { message }
    ) as z.ZodArray<z.ZodType<T>>,
}

// Conditional validation helpers
export const ConditionalValidations = {
  // Require field when another field has specific value
  requiredWhen: <T>(
    condition: (data: T) => boolean,
    schema: z.ZodTypeAny,
    message = 'This field is required'
  ) =>
    z.any().superRefine((val, ctx) => {
      const data = ctx.path.length > 0 ? ctx.root : val
      if (condition(data as T) && (!val || val === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
        })
      }
    }),

  // Validate field only when another field has specific value
  validateWhen: <T>(
    condition: (data: T) => boolean,
    schema: z.ZodTypeAny
  ) =>
    z.any().superRefine((val, ctx) => {
      const data = ctx.path.length > 0 ? ctx.root : val
      if (condition(data as T)) {
        const result = schema.safeParse(val)
        if (!result.success) {
          result.error.issues.forEach(issue => {
            ctx.addIssue(issue)
          })
        }
      }
    }),

  // Password confirmation validation
  confirmPassword: (passwordField = 'password', message = 'Passwords do not match') =>
    z.string().superRefine((val, ctx) => {
      const data = ctx.root as any
      if (data[passwordField] !== val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
        })
      }
    }),
}

// Form schema builders
export const FormSchemaBuilders = {
  // User registration form
  userRegistration: () =>
    z.object({
      firstName: CommonValidations.requiredString('First name is required'),
      lastName: CommonValidations.requiredString('Last name is required'),
      email: CommonValidations.email(),
      password: CommonValidations.strongPassword(),
      confirmPassword: ConditionalValidations.confirmPassword(),
      phone: CommonValidations.phone().optional(),
      dateOfBirth: CommonValidations.pastDate().optional(),
      agreeToTerms: z.boolean().refine(val => val === true, {
        message: 'You must agree to the terms and conditions'
      }),
    }),

  // Contact form
  contactForm: () =>
    z.object({
      name: CommonValidations.requiredString('Name is required'),
      email: CommonValidations.email(),
      subject: CommonValidations.requiredString('Subject is required'),
      message: z.string().min(10, 'Message must be at least 10 characters'),
      attachments: z.array(CommonValidations.fileSize(10)).optional(),
    }),

  // Profile update form
  profileUpdate: () =>
    z.object({
      firstName: CommonValidations.requiredString('First name is required'),
      lastName: CommonValidations.requiredString('Last name is required'),
      email: CommonValidations.email(),
      phone: CommonValidations.phone().optional(),
      bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
      website: CommonValidations.url().optional(),
      avatar: CommonValidations.imageFile(2).optional(),
      notifications: z.object({
        email: z.boolean(),
        sms: z.boolean(),
        push: z.boolean(),
      }),
    }),

  // Settings form
  settingsForm: () =>
    z.object({
      theme: z.enum(['light', 'dark', 'system']),
      language: z.string(),
      timezone: z.string(),
      emailNotifications: z.boolean(),
      pushNotifications: z.boolean(),
      twoFactorAuth: z.boolean(),
    }),
}

// Validation error helpers
export const ValidationHelpers = {
  // Get first error message for a field
  getFieldError: (errors: any, fieldName: string): string | undefined => {
    const error = errors[fieldName]
    return error?.message || error?.[0]?.message
  },

  // Check if field has error
  hasFieldError: (errors: any, fieldName: string): boolean => {
    return !!errors[fieldName]
  },

  // Get all error messages as array
  getAllErrors: (errors: any): string[] => {
    const messages: string[] = []
    
    const extractErrors = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const error = obj[key]
        const fieldName = prefix ? `${prefix}.${key}` : key
        
        if (error?.message) {
          messages.push(`${fieldName}: ${error.message}`)
        } else if (typeof error === 'object' && error !== null) {
          extractErrors(error, fieldName)
        }
      })
    }
    
    extractErrors(errors)
    return messages
  },

  // Format validation errors for display
  formatErrors: (errors: any): Record<string, string> => {
    const formatted: Record<string, string> = {}
    
    const extractErrors = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const error = obj[key]
        const fieldName = prefix ? `${prefix}.${key}` : key
        
        if (error?.message) {
          formatted[fieldName] = error.message
        } else if (typeof error === 'object' && error !== null) {
          extractErrors(error, fieldName)
        }
      })
    }
    
    extractErrors(errors)
    return formatted
  },
}

// Real-time validation debouncer
export function createValidationDebouncer(delay = 300) {
  let timeoutId: NodeJS.Timeout | null = null
  
  return function debounce<T extends any[]>(
    func: (...args: T) => void,
    ...args: T
  ) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}