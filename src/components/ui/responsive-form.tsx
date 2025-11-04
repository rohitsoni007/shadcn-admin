import React from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile, useResponsiveBreakpoint } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ResponsiveFormFieldProps {
  label: string
  description?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

/**
 * Responsive form field wrapper that adapts to mobile layouts
 */
export function ResponsiveFormField({
  label,
  description,
  required = false,
  error,
  children,
  className
}: ResponsiveFormFieldProps) {
  const isMobile = useIsMobile()
  const fieldId = React.useId()

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          isMobile && 'text-base' // Larger labels on mobile for better readability
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      
      {description && (
        <p className={cn(
          'text-sm text-muted-foreground',
          isMobile && 'text-base' // Larger description text on mobile
        )}>
          {description}
        </p>
      )}
      
      <div className="space-y-1">
        {React.cloneElement(children as React.ReactElement, { 
          id: fieldId,
          'aria-describedby': description ? `${fieldId}-description` : undefined,
          'aria-invalid': error ? 'true' : 'false',
          className: cn(
            (children as React.ReactElement).props.className,
            isMobile && 'text-base min-h-[44px]' // Larger touch targets on mobile
          )
        })}
        
        {error && (
          <p 
            id={`${fieldId}-error`}
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

interface ResponsiveFormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

/**
 * Form section component that groups related fields
 */
export function ResponsiveFormSection({
  title,
  description,
  children,
  className
}: ResponsiveFormSectionProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {title && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <Separator />
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

interface ResponsiveFormGridProps {
  children: React.ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  className?: string
}

/**
 * Responsive grid for form fields
 */
export function ResponsiveFormGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 2 },
  className
}: ResponsiveFormGridProps) {
  const breakpoint = useResponsiveBreakpoint()

  const getGridCols = () => {
    switch (breakpoint) {
      case 'mobile':
        return columns.mobile || 1
      case 'tablet':
        return columns.tablet || 2
      case 'desktop':
        return columns.desktop || 2
      default:
        return columns.desktop || 2
    }
  }

  return (
    <div
      className={cn('grid gap-4', className)}
      style={{
        gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`
      }}
    >
      {children}
    </div>
  )
}

interface ResponsiveFormActionsProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  stack?: boolean
  className?: string
}

/**
 * Form actions container that stacks buttons on mobile
 */
export function ResponsiveFormActions({
  children,
  align = 'right',
  stack = false,
  className
}: ResponsiveFormActionsProps) {
  const isMobile = useIsMobile()

  const getAlignment = () => {
    switch (align) {
      case 'left':
        return 'justify-start'
      case 'center':
        return 'justify-center'
      case 'right':
        return 'justify-end'
      default:
        return 'justify-end'
    }
  }

  return (
    <div
      className={cn(
        'flex gap-3',
        isMobile || stack ? 'flex-col' : 'flex-row',
        !isMobile && !stack && getAlignment(),
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child, {
            className: cn(
              child.props.className,
              (isMobile || stack) && 'w-full min-h-[44px]'
            )
          })
        }
        return child
      })}
    </div>
  )
}

/**
 * Mobile-optimized input component
 */
export const ResponsiveInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, type, ...props }, ref) => {
  const isMobile = useIsMobile()

  return (
    <Input
      ref={ref}
      type={type}
      className={cn(
        className,
        isMobile && [
          'text-base', // Prevent zoom on iOS
          'min-h-[44px]', // Minimum touch target
          type === 'search' && 'rounded-full' // Rounded search inputs on mobile
        ]
      )}
      {...props}
    />
  )
})
ResponsiveInput.displayName = 'ResponsiveInput'

/**
 * Mobile-optimized textarea component
 */
export const ResponsiveTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()

  return (
    <Textarea
      ref={ref}
      className={cn(
        className,
        isMobile && [
          'text-base', // Prevent zoom on iOS
          'min-h-[88px]' // Larger minimum height on mobile
        ]
      )}
      {...props}
    />
  )
})
ResponsiveTextarea.displayName = 'ResponsiveTextarea'

/**
 * Mobile-optimized select component
 */
export function ResponsiveSelect({
  children,
  ...props
}: React.ComponentProps<typeof Select>) {
  const isMobile = useIsMobile()

  return (
    <Select {...props}>
      <SelectTrigger 
        className={cn(
          isMobile && [
            'text-base', // Prevent zoom on iOS
            'min-h-[44px]' // Minimum touch target
          ]
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
}