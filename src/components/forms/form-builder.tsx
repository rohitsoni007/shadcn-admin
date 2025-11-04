import * as React from 'react'
import { useForm, type FieldValues, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type ZodSchema } from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EnhancedFormField, type EnhancedFormFieldProps, type SelectOption, type RadioOption } from './enhanced-form-field'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export interface FormSection {
  id: string
  title?: string
  description?: string
  fields: FormFieldConfig[]
}

export interface FormFieldConfig extends Omit<EnhancedFormFieldProps<any, any>, 'name' | 'control'> {
  name: string
  section?: string
  dependencies?: {
    field: string
    value: any
    condition?: 'equals' | 'not-equals' | 'includes' | 'not-includes'
  }[]
}

export interface FormBuilderProps<T extends FieldValues> {
  schema: ZodSchema<T>
  defaultValues?: DefaultValues<T>
  sections?: FormSection[]
  fields?: FormFieldConfig[]
  onSubmit: SubmitHandler<T>
  onReset?: () => void
  onFieldChange?: (name: string, value: any) => void
  title?: string
  description?: string
  submitText?: string
  resetText?: string
  loading?: boolean
  disabled?: boolean
  className?: string
  showResetButton?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  successMessage?: string
  errorMessage?: string
}

export function FormBuilder<T extends FieldValues>({
  schema,
  defaultValues,
  sections = [],
  fields = [],
  onSubmit,
  onReset,
  onFieldChange,
  title,
  description,
  submitText = 'Submit',
  resetText = 'Reset',
  loading = false,
  disabled = false,
  className,
  showResetButton = false,
  autoSave = false,
  autoSaveDelay = 1000,
  successMessage,
  errorMessage,
}: FormBuilderProps<T>) {
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle')
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>()

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const { control, handleSubmit, reset, watch, formState: { errors, isDirty, isValid } } = form

  // Watch all form values for auto-save and dependencies
  const watchedValues = watch()

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !isDirty || !isValid) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    setAutoSaveStatus('saving')
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Here you would typically save to localStorage or send to server
      localStorage.setItem('form-draft', JSON.stringify(watchedValues))
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
  }, [watchedValues, autoSave, autoSaveDelay, isDirty, isValid])

  // Handle field changes
  React.useEffect(() => {
    if (onFieldChange) {
      const subscription = watch((value, { name }) => {
        if (name) {
          onFieldChange(name, value[name])
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [watch, onFieldChange])

  const handleFormSubmit = async (data: T) => {
    try {
      setSubmitStatus('idle')
      await onSubmit(data)
      setSubmitStatus('success')
      
      // Clear auto-save draft on successful submit
      if (autoSave) {
        localStorage.removeItem('form-draft')
      }
      
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 3000)
    } catch (error) {
      setSubmitStatus('error')
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    }
  }

  const handleReset = () => {
    reset()
    setSubmitStatus('idle')
    setAutoSaveStatus('idle')
    if (autoSave) {
      localStorage.removeItem('form-draft')
    }
    onReset?.()
  }

  // Check field dependencies
  const isFieldVisible = (field: FormFieldConfig): boolean => {
    if (!field.dependencies || field.dependencies.length === 0) return true

    return field.dependencies.every(dep => {
      const fieldValue = watchedValues[dep.field]
      const condition = dep.condition || 'equals'

      switch (condition) {
        case 'equals':
          return fieldValue === dep.value
        case 'not-equals':
          return fieldValue !== dep.value
        case 'includes':
          return Array.isArray(fieldValue) && fieldValue.includes(dep.value)
        case 'not-includes':
          return Array.isArray(fieldValue) && !fieldValue.includes(dep.value)
        default:
          return true
      }
    })
  }

  // Organize fields by sections
  const organizedFields = React.useMemo(() => {
    if (sections.length > 0) {
      return sections.map(section => ({
        ...section,
        fields: section.fields.filter(field => isFieldVisible(field))
      }))
    }

    // If no sections defined, create a default section
    const visibleFields = fields.filter(field => isFieldVisible(field))
    return [{
      id: 'default',
      fields: visibleFields
    }]
  }, [sections, fields, watchedValues])

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
                  <span>Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>Draft saved</span>
                </>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {organizedFields.map((section, sectionIndex) => (
            <div key={section.id}>
              {section.title && (
                <div className="space-y-2 mb-4">
                  <h3 className="text-lg font-medium">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  )}
                </div>
              )}

              <div className="grid gap-4">
                {section.fields.map((field) => (
                  <EnhancedFormField
                    key={field.name}
                    {...field}
                    name={field.name}
                    control={control}
                  />
                ))}
              </div>

              {sectionIndex < organizedFields.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}

          {/* Status Messages */}
          {submitStatus === 'success' && successMessage && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">{successMessage}</span>
            </div>
          )}

          {submitStatus === 'error' && errorMessage && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{errorMessage}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              {showResetButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={loading || disabled || !isDirty}
                >
                  {resetText}
                </Button>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || disabled || !isValid}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Submitting...
                </>
              ) : (
                submitText
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Hook for managing form drafts
export function useFormDraft<T extends FieldValues>(key: string) {
  const [draft, setDraft] = React.useState<T | null>(null)

  React.useEffect(() => {
    const savedDraft = localStorage.getItem(`form-draft-${key}`)
    if (savedDraft) {
      try {
        setDraft(JSON.parse(savedDraft))
      } catch (error) {
        console.error('Failed to parse form draft:', error)
      }
    }
  }, [key])

  const saveDraft = React.useCallback((data: T) => {
    localStorage.setItem(`form-draft-${key}`, JSON.stringify(data))
    setDraft(data)
  }, [key])

  const clearDraft = React.useCallback(() => {
    localStorage.removeItem(`form-draft-${key}`)
    setDraft(null)
  }, [key])

  return { draft, saveDraft, clearDraft }
}