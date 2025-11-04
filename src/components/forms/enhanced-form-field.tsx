import * as React from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Upload, X, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface EnhancedFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  description?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'date' | 'file'
  options?: SelectOption[] | RadioOption[]
  multiple?: boolean
  accept?: string // for file inputs
  maxFiles?: number // for file inputs
  disabled?: boolean
  required?: boolean
  className?: string
  inputClassName?: string
  showPasswordToggle?: boolean
  min?: number
  max?: number
  step?: number
  rows?: number // for textarea
  realTimeValidation?: boolean
}

export function EnhancedFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  placeholder,
  description,
  type = 'text',
  options = [],
  multiple = false,
  accept,
  maxFiles = 1,
  disabled = false,
  required = false,
  className,
  inputClassName,
  showPasswordToggle = false,
  min,
  max,
  step,
  rows = 3,
  realTimeValidation = true,
}: EnhancedFormFieldProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  
  const {
    field,
    fieldState: { error, isDirty, isTouched },
  } = useController({
    name,
    control,
  })

  const hasError = !!error
  const showError = hasError && (realTimeValidation ? isDirty : isTouched)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const limitedFiles = files.slice(0, maxFiles)
    setSelectedFiles(limitedFiles)
    
    if (multiple) {
      field.onChange(limitedFiles)
    } else {
      field.onChange(limitedFiles[0] || null)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    
    if (multiple) {
      field.onChange(newFiles)
    } else {
      field.onChange(null)
    }
  }

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
              showError && 'border-destructive focus-visible:ring-destructive',
              inputClassName
            )}
          />
        )

      case 'select':
        return (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                showError && 'border-destructive focus-visible:ring-destructive',
                inputClassName
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {(options as SelectOption[]).map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(
                showError && 'border-destructive data-[state=checked]:bg-destructive'
              )}
            />
            {label && (
              <Label
                htmlFor={name}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  showError && 'text-destructive'
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
          </div>
        )

      case 'radio':
        return (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
            className="flex flex-col space-y-2"
          >
            {(options as RadioOption[]).map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  disabled={option.disabled}
                />
                <Label
                  htmlFor={`${name}-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            {label && (
              <Label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
          </div>
        )

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !field.value && 'text-muted-foreground',
                  showError && 'border-destructive',
                  inputClassName
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? format(field.value, 'PPP') : placeholder || 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor={name}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors',
                  showError && 'border-destructive',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
                  </p>
                  {maxFiles > 1 && (
                    <p className="text-xs text-muted-foreground">
                      Maximum {maxFiles} files
                    </p>
                  )}
                </div>
                <input
                  id={name}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={accept}
                  multiple={multiple && maxFiles > 1}
                  disabled={disabled}
                />
              </label>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'password':
        return (
          <div className="relative">
            <Input
              {...field}
              type={showPasswordToggle && showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                showError && 'border-destructive focus-visible:ring-destructive',
                showPasswordToggle && 'pr-10',
                inputClassName
              )}
            />
            {showPasswordToggle && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )

      default:
        return (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(
              showError && 'border-destructive focus-visible:ring-destructive',
              inputClassName
            )}
          />
        )
    }
  }

  // For checkbox and switch, we don't show the label separately
  const showLabel = label && !['checkbox', 'switch'].includes(type)

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <Label
          htmlFor={name}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            showError && 'text-destructive'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {renderInput()}
      
      {description && !showError && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {showError && (
        <p className="text-sm font-medium text-destructive">
          {error?.message}
        </p>
      )}
    </div>
  )
}