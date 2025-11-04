import React from 'react'
import { cn } from '@/lib/utils'
import { useTouchDevice } from '@/hooks/use-mobile'

interface TouchOptimizedProps {
  children: React.ReactNode
  className?: string
  minTouchTarget?: boolean
  hapticFeedback?: boolean
}

/**
 * Wrapper component that optimizes child elements for touch interactions
 */
export function TouchOptimized({ 
  children, 
  className, 
  minTouchTarget = true,
  hapticFeedback = false 
}: TouchOptimizedProps) {
  const isTouchDevice = useTouchDevice()

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (hapticFeedback && 'vibrate' in navigator) {
      // Provide subtle haptic feedback
      navigator.vibrate(10)
    }
  }, [hapticFeedback])

  if (!isTouchDevice) {
    return <>{children}</>
  }

  return (
    <div
      className={cn(
        // Ensure minimum touch target size (44px x 44px)
        minTouchTarget && 'min-h-[44px] min-w-[44px]',
        // Add touch-specific styles
        'touch-manipulation',
        // Prevent text selection on touch
        'select-none',
        className
      )}
      onTouchStart={handleTouchStart}
      style={{
        // Disable iOS touch callouts
        WebkitTouchCallout: 'none',
        // Disable iOS text selection
        WebkitUserSelect: 'none',
        // Disable Android text selection
        userSelect: 'none',
        // Improve touch responsiveness
        touchAction: 'manipulation'
      }}
    >
      {children}
    </div>
  )
}

/**
 * Hook for handling swipe gestures
 */
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) {
  const touchStart = React.useRef<{ x: number; y: number } | null>(null)
  const touchEnd = React.useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }, [])

  const handleTouchEnd = React.useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    // Determine if horizontal or vertical swipe is more significant
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft()
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight()
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp()
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown()
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}

/**
 * Hook for handling long press gestures
 */
export function useLongPress(
  onLongPress: () => void,
  delay: number = 500
) {
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  const isLongPress = React.useRef(false)

  const start = React.useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false
    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true
      onLongPress()
    }, delay)
  }, [onLongPress, delay])

  const clear = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    if (isLongPress.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    onClick: handleClick
  }
}

/**
 * Component for pull-to-refresh functionality
 */
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  className?: string
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  className 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const startY = React.useRef(0)
  const currentY = React.useRef(0)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isPulling) return

    currentY.current = e.touches[0].clientY
    const distance = Math.max(0, currentY.current - startY.current)
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }, [isPulling, threshold])

  const handleTouchEnd = React.useCallback(async () => {
    if (!isPulling) return

    setIsPulling(false)
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
  }, [isPulling, pullDistance, threshold, onRefresh, isRefreshing])

  const pullProgress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-background/90 backdrop-blur transition-all duration-200"
          style={{ 
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(-${Math.max(pullDistance, isRefreshing ? 60 : 0)}px)`
          }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isRefreshing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Refreshing...</span>
              </>
            ) : (
              <span>
                {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}