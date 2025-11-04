import * as React from 'react'
import { useForm, type FieldValues, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type ZodSchema } from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { EnhancedFormField, type FormFieldConfig } from './enhanced-form-field'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Save,
  RotateCcw
} from 'lucide-react'

export interface WizardStep {
  id: string
  title: string
  description?: string
  fields: FormFieldConfig[]
  optional?: boolean
  validation?: ZodSchema<any>
}

export interface FormWizardProps<T extends FieldValues> {
  steps: WizardStep[]
  schema: ZodSchema<T>
  defaultValues?: DefaultValues<T>
  onSubmit: SubmitHandler<T>
  onStepChange?: (currentStep: number, direction: 'next' | 'previous') => void
  onStepValidation?: (stepId: string, isValid: boolean, errors: any) => void
  title?: string
  description?: string
  submitText?: string
  loading?: boolean
  disabled?: boolean
  className?: string
  allowStepNavigation?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  showProgress?: boolean
  showStepNumbers?: boolean
  validateOnStepChange?: boolean
}

export function FormWizard<T extends FieldValues>({
  steps,
  schema,
  defaultValues,
  onSubmit,
  onStepChange,
  onStepValidation,
  title,
  description,
  submitText = 'Submit',
  loading = false,
  disabled = false,
  className,
  allowStepNavigation = true,
  autoSave = true,
  autoSaveDelay = 1000,
  showProgress = true,
  showStepNumbers = true,
  validateOnStepChange = true,
}: FormWizardProps<T>) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [stepErrors, setStepErrors] = React.useState<Record<number, any>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle')
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>()

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const { control, handleSubmit, trigger, getValues, watch, formState: { errors, isDirty } } = form

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1
  const totalSteps = steps.length
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  // Watch form values for auto-save
  const watchedValues = watch()

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !isDirty) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    setAutoSaveStatus('saving')
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      const draftKey = `form-wizard-draft-${title || 'default'}`
      localStorage.setItem(draftKey, JSON.stringify({
        values: watchedValues,
        currentStep: currentStepIndex,
        completedSteps: Array.from(completedSteps),
        timestamp: Date.now(),
      }))
      setAutoSaveStatus('saved')
      
      setTimeout(() => {
        setAutoSaveStatus('idle')
      }, 2000)
    }, autoSaveDelay)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [watchedValues, currentStepIndex, completedSteps, autoSave, autoSaveDelay, isDirty, title])

  // Load draft on mount
  React.useEffect(() => {
    if (!autoSave) return

    const draftKey = `form-wizard-draft-${title || 'default'}`
    const savedDraft = localStorage.getItem(draftKey)
    
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        const draftAge = Date.now() - draft.timestamp
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        
        if (draftAge < maxAge) {
          // Restore form state
          form.reset(draft.values)
          setCurrentStepIndex(draft.currentStep || 0)
          setCompletedSteps(new Set(draft.completedSteps || []))
        } else {
          // Remove expired draft
          localStorage.removeItem(draftKey)
        }
      } catch (error) {
        console.error('Failed to load form draft:', error)
      }
    }
  }, [autoSave, title, form])

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!validateOnStepChange) return true

    const stepFields = currentStep.fields.map(field => field.name)
    const isValid = await trigger(stepFields as any)
    
    if (isValid) {
      setStepErrors(prev => ({ ...prev, [currentStepIndex]: null }))
      setCompletedSteps(prev => new Set([...prev, currentStepIndex]))
    } else {
      const currentErrors = stepFields.reduce((acc, fieldName) => {
        if (errors[fieldName]) {
          acc[fieldName] = errors[fieldName]
        }
        return acc
      }, {} as any)
      
      setStepErrors(prev => ({ ...prev, [currentStepIndex]: currentErrors }))
    }

    onStepValidation?.(currentStep.id, isValid, isValid ? null : errors)
    return isValid
  }

  // Navigate to next step
  const goToNextStep = async () => {
    if (isLastStep) return

    const isValid = await validateCurrentStep()
    if (!isValid && !currentStep.optional) return

    const nextStepIndex = currentStepIndex + 1
    setCurrentStepIndex(nextStepIndex)
    onStepChange?.(nextStepIndex, 'next')
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (isFirstStep) return

    const prevStepIndex = currentStepIndex - 1
    setCurrentStepIndex(prevStepIndex)
    onStepChange?.(prevStepIndex, 'previous')
  }

  // Navigate to specific step
  const goToStep = async (stepIndex: number) => {
    if (!allowStepNavigation || stepIndex === currentStepIndex) return

    // If going forward, validate all steps in between
    if (stepIndex > currentStepIndex) {
      for (let i = currentStepIndex; i < stepIndex; i++) {
        const step = steps[i]
        const stepFields = step.fields.map(field => field.name)
        const isValid = await trigger(stepFields as any)
        
        if (!isValid && !step.optional) {
          return // Stop if validation fails on a required step
        }
        
        if (isValid) {
          setCompletedSteps(prev => new Set([...prev, i]))
        }
      }
    }

    setCurrentStepIndex(stepIndex)
    onStepChange?.(stepIndex, stepIndex > currentStepIndex ? 'next' : 'previous')
  }

  // Handle form submission
  const handleFormSubmit = async (data: T) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      
      // Clear draft on successful submission
      if (autoSave) {
        const draftKey = `form-wizard-draft-${title || 'default'}`
        localStorage.removeItem(draftKey)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset wizard
  const resetWizard = () => {
    form.reset(defaultValues)
    setCurrentStepIndex(0)
    setCompletedSteps(new Set())
    setStepErrors({})
    setAutoSaveStatus('idle')
    
    if (autoSave) {
      const draftKey = `form-wizard-draft-${title || 'default'}`
      localStorage.removeItem(draftKey)
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex || completedSteps.has(stepIndex)) {
      return 'completed'
    } else if (stepIndex === currentStepIndex) {
      return 'current'
    } else {
      return 'pending'
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          
          {autoSave && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {autoSaveStatus === 'saving' && (
                <>
                  <LoadingSpinner className="h-3 w-3" />
                  <span>Saving draft...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <Save className="h-3 w-3 text-green-500" />
                  <span>Draft saved</span>
                </>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStepIndex + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {steps.map((step, index) => {
              const status = getStepStatus(index)
              const hasError = stepErrors[index]
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={!allowStepNavigation || disabled}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring',
                      status === 'current' && 'bg-primary text-primary-foreground',
                      status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
                      status === 'pending' && 'bg-muted text-muted-foreground',
                      hasError && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
                      (!allowStepNavigation || disabled) && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {showStepNumbers && (
                      <span className={cn(
                        'flex items-center justify-center w-6 h-6 rounded-full text-xs',
                        status === 'completed' && 'bg-green-500 text-white',
                        status === 'current' && 'bg-primary-foreground text-primary',
                        status === 'pending' && 'bg-muted-foreground text-muted',
                        hasError && 'bg-red-500 text-white'
                      )}>
                        {status === 'completed' ? (
                          <Check className="h-3 w-3" />
                        ) : hasError ? (
                          <AlertCircle className="h-3 w-3" />
                        ) : (
                          index + 1
                        )}
                      </span>
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                    {step.optional && (
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    )}
                  </button>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetWizard}
            disabled={disabled || isSubmitting}
            className="ml-4"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <Separator />

        {/* Current Step Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{currentStep.title}</h3>
            {currentStep.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentStep.description}
              </p>
            )}
            {currentStep.optional && (
              <Badge variant="outline" className="mt-2">
                Optional Step
              </Badge>
            )}
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {currentStep.fields.map((field) => (
              <EnhancedFormField
                key={field.name}
                {...field}
                name={field.name}
                control={control}
                disabled={disabled || isSubmitting}
              />
            ))}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={isFirstStep || disabled || isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    disabled={disabled || isSubmitting}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={disabled || isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting || loading ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Submitting...
                      </>
                    ) : (
                      submitText
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing wizard state
export function useFormWizard(steps: WizardStep[], options?: {
  autoSave?: boolean
  draftKey?: string
}) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [visitedSteps, setVisitedSteps] = React.useState<Set<number>>(new Set([0]))

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
      setVisitedSteps(prev => new Set([...prev, stepIndex]))
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }

  const completeStep = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]))
  }

  const resetWizard = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setVisitedSteps(new Set([0]))
    
    if (options?.autoSave && options?.draftKey) {
      localStorage.removeItem(`wizard-draft-${options.draftKey}`)
    }
  }

  const isStepCompleted = (stepIndex: number) => completedSteps.has(stepIndex)
  const isStepVisited = (stepIndex: number) => visitedSteps.has(stepIndex)
  const canGoToStep = (stepIndex: number) => isStepVisited(stepIndex) || stepIndex === currentStep + 1

  return {
    currentStep,
    completedSteps: Array.from(completedSteps),
    visitedSteps: Array.from(visitedSteps),
    goToStep,
    nextStep,
    previousStep,
    completeStep,
    resetWizard,
    isStepCompleted,
    isStepVisited,
    canGoToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    progress: ((currentStep + 1) / steps.length) * 100,
  }
}