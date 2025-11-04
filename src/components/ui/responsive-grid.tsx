import React from 'react'
import { cn } from '@/lib/utils'
import { useResponsiveBreakpoint } from '@/hooks/use-mobile'

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  minItemWidth?: string
}

/**
 * Responsive grid component that adapts to different screen sizes
 */
export function ResponsiveGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
  minItemWidth = '280px'
}: ResponsiveGridProps) {
  const breakpoint = useResponsiveBreakpoint()

  const getGridCols = () => {
    switch (breakpoint) {
      case 'mobile':
        return cols.mobile || 1
      case 'tablet':
        return cols.tablet || 2
      case 'desktop':
        return cols.desktop || 3
      default:
        return cols.desktop || 3
    }
  }

  const getGap = () => {
    switch (breakpoint) {
      case 'mobile':
        return gap.mobile || '1rem'
      case 'tablet':
        return gap.tablet || '1.5rem'
      case 'desktop':
        return gap.desktop || '2rem'
      default:
        return gap.desktop || '2rem'
    }
  }

  return (
    <div
      className={cn(
        'grid w-full',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${getGridCols()}, minmax(${minItemWidth}, 1fr))`,
        gap: getGap()
      }}
    >
      {children}
    </div>
  )
}

/**
 * Responsive container component with proper padding and max-width
 */
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
}

export function ResponsiveContainer({ 
  children, 
  className,
  size = 'lg',
  padding = true
}: ResponsiveContainerProps) {
  const breakpoint = useResponsiveBreakpoint()

  const getMaxWidth = () => {
    switch (size) {
      case 'sm':
        return 'max-w-2xl'
      case 'md':
        return 'max-w-4xl'
      case 'lg':
        return 'max-w-6xl'
      case 'xl':
        return 'max-w-7xl'
      case 'full':
        return 'max-w-full'
      default:
        return 'max-w-6xl'
    }
  }

  const getPadding = () => {
    if (!padding) return ''
    
    switch (breakpoint) {
      case 'mobile':
        return 'px-4 py-4'
      case 'tablet':
        return 'px-6 py-6'
      case 'desktop':
        return 'px-8 py-8'
      default:
        return 'px-8 py-8'
    }
  }

  return (
    <div
      className={cn(
        'mx-auto w-full',
        getMaxWidth(),
        getPadding(),
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Responsive flex component that stacks on mobile
 */
interface ResponsiveFlexProps {
  children: React.ReactNode
  className?: string
  direction?: {
    mobile?: 'row' | 'col'
    tablet?: 'row' | 'col'
    desktop?: 'row' | 'col'
  }
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  gap?: number
  wrap?: boolean
}

export function ResponsiveFlex({ 
  children, 
  className,
  direction = { mobile: 'col', tablet: 'row', desktop: 'row' },
  align = 'start',
  justify = 'start',
  gap = 4,
  wrap = false
}: ResponsiveFlexProps) {
  const breakpoint = useResponsiveBreakpoint()

  const getFlexDirection = () => {
    switch (breakpoint) {
      case 'mobile':
        return direction.mobile === 'row' ? 'flex-row' : 'flex-col'
      case 'tablet':
        return direction.tablet === 'row' ? 'flex-row' : 'flex-col'
      case 'desktop':
        return direction.desktop === 'row' ? 'flex-row' : 'flex-col'
      default:
        return direction.desktop === 'row' ? 'flex-row' : 'flex-col'
    }
  }

  const getAlignItems = () => {
    switch (align) {
      case 'start':
        return 'items-start'
      case 'center':
        return 'items-center'
      case 'end':
        return 'items-end'
      case 'stretch':
        return 'items-stretch'
      default:
        return 'items-start'
    }
  }

  const getJustifyContent = () => {
    switch (justify) {
      case 'start':
        return 'justify-start'
      case 'center':
        return 'justify-center'
      case 'end':
        return 'justify-end'
      case 'between':
        return 'justify-between'
      case 'around':
        return 'justify-around'
      case 'evenly':
        return 'justify-evenly'
      default:
        return 'justify-start'
    }
  }

  return (
    <div
      className={cn(
        'flex',
        getFlexDirection(),
        getAlignItems(),
        getJustifyContent(),
        wrap && 'flex-wrap',
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Hook for responsive values
 */
export function useResponsiveValue<T>(values: {
  mobile?: T
  tablet?: T
  desktop?: T
  default: T
}): T {
  const breakpoint = useResponsiveBreakpoint()

  switch (breakpoint) {
    case 'mobile':
      return values.mobile ?? values.default
    case 'tablet':
      return values.tablet ?? values.default
    case 'desktop':
      return values.desktop ?? values.default
    default:
      return values.default
  }
}