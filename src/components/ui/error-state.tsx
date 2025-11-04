import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/lib/error-utils'

interface ErrorStateProps {
  error: Error | unknown
  onRetry?: () => void
  className?: string
  title?: string
  showRetry?: boolean
}

export function ErrorState({ 
  error, 
  onRetry, 
  className,
  title = 'Something went wrong',
  showRetry = true
}: ErrorStateProps) {
  const errorMessage = getErrorMessage(error)

  return (
    <div className={cn('p-4', className)}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {errorMessage}
          {showRetry && onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Try again
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}

interface PageErrorProps {
  error: Error | unknown
  onRetry?: () => void
  title?: string
}

export function PageError({ 
  error, 
  onRetry,
  title = 'Failed to load page'
}: PageErrorProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ErrorState 
          error={error} 
          onRetry={onRetry}
          title={title}
          className="p-0"
        />
      </div>
    </div>
  )
}

interface InlineErrorProps {
  error: Error | unknown
  onRetry?: () => void
  size?: 'sm' | 'md'
}

export function InlineError({ error, onRetry, size = 'md' }: InlineErrorProps) {
  const errorMessage = getErrorMessage(error)
  
  return (
    <div className={cn(
      'flex items-center gap-2 text-destructive',
      size === 'sm' ? 'text-xs' : 'text-sm'
    )}>
      <AlertCircle className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      <span>{errorMessage}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-auto p-0 text-xs underline hover:no-underline"
        >
          Retry
        </Button>
      )}
    </div>
  )
}