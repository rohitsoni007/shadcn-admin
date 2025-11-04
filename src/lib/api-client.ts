import { ApiError, ApiResponse, RequestConfig } from '@/types/api'

// Base API URL - in a real app this would come from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      signal,
    } = config

    const url = `${this.baseURL}${endpoint}`
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // Get auth token from localStorage (in a real app, this might be more secure)
    const token = localStorage.getItem('auth-token')
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      })

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')

      let data: any
      if (isJson) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        const error: ApiError = {
          code: data?.code || `HTTP_${response.status}`,
          message: data?.message || response.statusText || 'An error occurred',
          status: response.status,
          details: data?.details,
        }
        throw error
      }

      return data
    } catch (error) {
      // Handle network errors, timeouts, etc.
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            code: 'REQUEST_CANCELLED',
            message: 'Request was cancelled',
            status: 0,
          } as ApiError
        }

        throw {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
          status: 0,
        } as ApiError
      }

      // Re-throw API errors
      throw error
    }
  }

  // HTTP method helpers
  async get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', signal })
  }

  async post<T>(endpoint: string, body?: any, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, signal })
  }

  async put<T>(endpoint: string, body?: any, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, signal })
  }

  async patch<T>(endpoint: string, body?: any, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, signal })
  }

  async delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', signal })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for testing or multiple instances
export { ApiClient }