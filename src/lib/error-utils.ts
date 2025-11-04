import { ApiError } from '@/types/api'

// Error message mapping
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  REQUEST_CANCELLED: 'Request was cancelled.',
  HTTP_400: 'Bad request. Please check your input.',
  HTTP_401: 'Authentication required. Please log in.',
  HTTP_403: 'Access denied. You do not have permission to perform this action.',
  HTTP_404: 'Resource not found.',
  HTTP_409: 'Conflict. The resource already exists or has been modified.',
  HTTP_422: 'Validation error. Please check your input.',
  HTTP_429: 'Too many requests. Please try again later.',
  HTTP_500: 'Server error. Please try again later.',
  HTTP_502: 'Service unavailable. Please try again later.',
  HTTP_503: 'Service temporarily unavailable. Please try again later.',
}

// Get user-friendly error message
export function getErrorMessage(error: ApiError | Error | unknown): string {
  if (!error) return 'An unknown error occurred'

  // Handle ApiError
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const apiError = error as ApiError
    
    // Return custom message if available
    if (apiError.message) {
      return apiError.message
    }

    // Return mapped message based on error code
    if (apiError.code && ERROR_MESSAGES[apiError.code]) {
      return ERROR_MESSAGES[apiError.code]
    }

    // Return generic message for HTTP errors
    if (apiError.status) {
      return ERROR_MESSAGES[`HTTP_${apiError.status}`] || `HTTP Error ${apiError.status}`
    }
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  return 'An unknown error occurred'
}

// Check if error is authentication related
export function isAuthError(error: ApiError | Error | unknown): boolean {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const apiError = error as ApiError
    return apiError.status === 401 || apiError.status === 403
  }
  return false
}

// Check if error is a network error
export function isNetworkError(error: ApiError | Error | unknown): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const apiError = error as ApiError
    return apiError.code === 'NETWORK_ERROR' || apiError.status === 0
  }
  return false
}

// Check if error is retryable
export function isRetryableError(error: ApiError | Error | unknown): boolean {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const apiError = error as ApiError
    // Don't retry client errors (4xx) except for 408 (timeout) and 429 (rate limit)
    if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
      return apiError.status === 408 || apiError.status === 429
    }
    // Retry server errors (5xx) and network errors
    return apiError.status === 0 || (apiError.status && apiError.status >= 500)
  }
  return false
}