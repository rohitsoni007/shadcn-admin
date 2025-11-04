import * as React from 'react'
import { type FieldValues, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

export interface FormSubmissionOptions<T extends FieldValues> {
  onSuccess?: (data: T, response?: any) => void | Promise<void>
  onError?: (error: Error, data: T) => void | Promise<void>
  successMessage?: string | ((data: T) => string)
  errorMessage?: string | ((error: Error) => string)
  resetOnSuccess?: boolean
  showToast?: boolean
  retryAttempts?: number
  retryDelay?: number
  analytics?: {
    trackSubmission?: boolean
    trackSuccess?: boolean
    trackError?: boolean
    eventName?: string
  }
}

export interface FormSubmissionState {
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  error: Error | null
  submitCount: number
  lastSubmitTime: Date | null
  retryCount: number
}

export function useFormSubmission<T extends FieldValues>(
  form: UseFormReturn<T>,
  submitHandler: (data: T) => Promise<any>,
  options: FormSubmissionOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    successMessage = 'Form submitted successfully!',
    errorMessage = 'An error occurred while submitting the form.',
    resetOnSuccess = false,
    showToast = true,
    retryAttempts = 0,
    retryDelay = 1000,
    analytics = {},
  } = options

  const [state, setState] = React.useState<FormSubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    error: null,
    submitCount: 0,
    lastSubmitTime: null,
    retryCount: 0,
  })

  const retryTimeoutRef = React.useRef<NodeJS.Timeout>()

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  const trackEvent = (eventType: 'submission' | 'success' | 'error', data?: any) => {
    if (!analytics.trackSubmission && eventType === 'submission') return
    if (!analytics.trackSuccess && eventType === 'success') return
    if (!analytics.trackError && eventType === 'error') return

    // Basic analytics tracking - can be extended with actual analytics service
    const event = {
      type: eventType,
      formName: analytics.eventName || 'form_submission',
      timestamp: new Date().toISOString(),
      data: eventType === 'error' ? { error: data?.message } : undefined,
    }

    console.log('Form Analytics:', event)
    
    // Here you would integrate with your analytics service
    // Example: analytics.track(event.type, event)
  }

  const resetState = () => {
    setState({
      isSubmitting: false,
      isSuccess: false,
      isError: false,
      error: null,
      submitCount: 0,
      lastSubmitTime: null,
      retryCount: 0,
    })
  }

  const handleSubmit = async (data: T, retryCount = 0): Promise<void> => {
    setState(prev => ({
      ...prev,
      isSubmitting: true,
      isError: false,
      error: null,
      retryCount,
    }))

    try {
      // Track submission attempt
      trackEvent('submission', data)

      const response = await submitHandler(data)

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true,
        submitCount: prev.submitCount + 1,
        lastSubmitTime: new Date(),
        retryCount: 0,
      }))

      // Handle success
      await onSuccess?.(data, response)

      // Show success message
      if (showToast) {
        const message = typeof successMessage === 'function' 
          ? successMessage(data) 
          : successMessage
        toast.success(message)
      }

      // Reset form if requested
      if (resetOnSuccess) {
        form.reset()
      }

      // Track success
      trackEvent('success', { response })

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred')

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isError: true,
        error: err,
        submitCount: prev.submitCount + 1,
        lastSubmitTime: new Date(),
      }))

      // Handle retry logic
      if (retryCount < retryAttempts) {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }

        retryTimeoutRef.current = setTimeout(() => {
          handleSubmit(data, retryCount + 1)
        }, retryDelay * Math.pow(2, retryCount)) // Exponential backoff

        return
      }

      // Handle error
      await onError?.(err, data)

      // Show error message
      if (showToast) {
        const message = typeof errorMessage === 'function' 
          ? errorMessage(err) 
          : errorMessage
        toast.error(message)
      }

      // Track error
      trackEvent('error', err)
    }
  }

  const submit = form.handleSubmit((data: T) => handleSubmit(data))

  const retry = () => {
    if (state.error) {
      const formData = form.getValues()
      handleSubmit(formData)
    }
  }

  return {
    ...state,
    submit,
    retry,
    resetState,
  }
}

// Hook for managing form drafts with automatic saving
export function useFormDrafts<T extends FieldValues>(
  form: UseFormReturn<T>,
  draftKey: string,
  options: {
    autoSave?: boolean
    saveDelay?: number
    maxDrafts?: number
    onDraftSaved?: (draft: T) => void
    onDraftLoaded?: (draft: T) => void
  } = {}
) {
  const {
    autoSave = true,
    saveDelay = 1000,
    maxDrafts = 5,
    onDraftSaved,
    onDraftLoaded,
  } = options

  const [draftStatus, setDraftStatus] = React.useState<'idle' | 'saving' | 'saved' | 'loading'>('idle')
  const [availableDrafts, setAvailableDrafts] = React.useState<Array<{
    id: string
    timestamp: Date
    data: T
  }>>([])

  const saveTimeoutRef = React.useRef<NodeJS.Timeout>()
  const { watch } = form

  // Watch form changes for auto-save
  const formData = watch()

  React.useEffect(() => {
    if (!autoSave) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setDraftStatus('saving')

    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(formData)
    }, saveDelay)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, autoSave, saveDelay])

  // Load available drafts on mount
  React.useEffect(() => {
    loadAvailableDrafts()
  }, [draftKey])

  const saveDraft = (data: T) => {
    try {
      const draft = {
        id: `${draftKey}-${Date.now()}`,
        timestamp: new Date(),
        data,
      }

      // Get existing drafts
      const existingDrafts = getStoredDrafts()
      
      // Add new draft and limit to maxDrafts
      const updatedDrafts = [draft, ...existingDrafts].slice(0, maxDrafts)
      
      localStorage.setItem(`form-drafts-${draftKey}`, JSON.stringify(updatedDrafts))
      
      setAvailableDrafts(updatedDrafts)
      setDraftStatus('saved')
      
      onDraftSaved?.(data)

      // Reset status after delay
      setTimeout(() => {
        setDraftStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('Failed to save draft:', error)
      setDraftStatus('idle')
    }
  }

  const loadDraft = (draftId: string) => {
    try {
      setDraftStatus('loading')
      
      const draft = availableDrafts.find(d => d.id === draftId)
      if (draft) {
        form.reset(draft.data)
        onDraftLoaded?.(draft.data)
      }
      
      setDraftStatus('idle')
    } catch (error) {
      console.error('Failed to load draft:', error)
      setDraftStatus('idle')
    }
  }

  const deleteDraft = (draftId: string) => {
    try {
      const updatedDrafts = availableDrafts.filter(d => d.id !== draftId)
      localStorage.setItem(`form-drafts-${draftKey}`, JSON.stringify(updatedDrafts))
      setAvailableDrafts(updatedDrafts)
    } catch (error) {
      console.error('Failed to delete draft:', error)
    }
  }

  const clearAllDrafts = () => {
    try {
      localStorage.removeItem(`form-drafts-${draftKey}`)
      setAvailableDrafts([])
    } catch (error) {
      console.error('Failed to clear drafts:', error)
    }
  }

  const getStoredDrafts = () => {
    try {
      const stored = localStorage.getItem(`form-drafts-${draftKey}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get stored drafts:', error)
      return []
    }
  }

  const loadAvailableDrafts = () => {
    const drafts = getStoredDrafts()
    setAvailableDrafts(drafts)
  }

  const manualSave = () => {
    const currentData = form.getValues()
    saveDraft(currentData)
  }

  return {
    draftStatus,
    availableDrafts,
    saveDraft: manualSave,
    loadDraft,
    deleteDraft,
    clearAllDrafts,
  }
}

// Hook for form analytics and tracking
export function useFormAnalytics(formName: string) {
  const [analytics, setAnalytics] = React.useState({
    startTime: new Date(),
    fieldInteractions: {} as Record<string, number>,
    validationErrors: {} as Record<string, number>,
    submitAttempts: 0,
    completionTime: null as Date | null,
  })

  const trackFieldInteraction = (fieldName: string) => {
    setAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: (prev.fieldInteractions[fieldName] || 0) + 1,
      },
    }))
  }

  const trackValidationError = (fieldName: string) => {
    setAnalytics(prev => ({
      ...prev,
      validationErrors: {
        ...prev.validationErrors,
        [fieldName]: (prev.validationErrors[fieldName] || 0) + 1,
      },
    }))
  }

  const trackSubmitAttempt = () => {
    setAnalytics(prev => ({
      ...prev,
      submitAttempts: prev.submitAttempts + 1,
    }))
  }

  const trackCompletion = () => {
    setAnalytics(prev => ({
      ...prev,
      completionTime: new Date(),
    }))
  }

  const getFormMetrics = () => {
    const timeSpent = analytics.completionTime 
      ? analytics.completionTime.getTime() - analytics.startTime.getTime()
      : Date.now() - analytics.startTime.getTime()

    return {
      formName,
      timeSpent: Math.round(timeSpent / 1000), // in seconds
      fieldInteractions: analytics.fieldInteractions,
      validationErrors: analytics.validationErrors,
      submitAttempts: analytics.submitAttempts,
      completed: !!analytics.completionTime,
      abandonmentRate: analytics.submitAttempts === 0 ? 1 : 0,
    }
  }

  return {
    trackFieldInteraction,
    trackValidationError,
    trackSubmitAttempt,
    trackCompletion,
    getFormMetrics,
    analytics,
  }
}