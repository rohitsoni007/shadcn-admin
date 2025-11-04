/**
 * Accessibility utilities and helpers for WCAG 2.1 AA compliance
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Hook for managing focus trap within a component
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return containerRef
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestore() {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const saveFocus = () => {
    previousActiveElement.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    if (previousActiveElement.current) {
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }

  return { saveFocus, restoreFocus }
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  items: HTMLElement[],
  options: {
    loop?: boolean
    orientation?: 'horizontal' | 'vertical'
  } = {}
) {
  const { loop = true, orientation = 'vertical' } = options
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleKeyDown = (e: KeyboardEvent) => {
    const isVertical = orientation === 'vertical'
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

    switch (e.key) {
      case nextKey:
        e.preventDefault()
        setCurrentIndex(prev => {
          const next = prev + 1
          if (next >= items.length) {
            return loop ? 0 : prev
          }
          return next
        })
        break
      case prevKey:
        e.preventDefault()
        setCurrentIndex(prev => {
          const next = prev - 1
          if (next < 0) {
            return loop ? items.length - 1 : prev
          }
          return next
        })
        break
      case 'Home':
        e.preventDefault()
        setCurrentIndex(0)
        break
      case 'End':
        e.preventDefault()
        setCurrentIndex(items.length - 1)
        break
    }
  }

  useEffect(() => {
    items[currentIndex]?.focus()
  }, [currentIndex, items])

  return { currentIndex, setCurrentIndex, handleKeyDown }
}

/**
 * Hook for announcing content to screen readers
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('')

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('')
    setTimeout(() => {
      setAnnouncement(message)
    }, 100)
  }

  return { announcement, announce }
}

/**
 * Generate unique IDs for accessibility attributes
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if an element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.hasAttribute('aria-hidden') ||
    element.hasAttribute('hidden')
  )
}

/**
 * Get accessible name for an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy)
    if (labelElement) return labelElement.textContent || ''
  }

  // Check associated label
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    const id = element.getAttribute('id')
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`)
      if (label) return label.textContent || ''
    }
  }

  // Fall back to text content
  return element.textContent || ''
}

/**
 * Validate color contrast ratio
 */
export function validateColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): { isValid: boolean; ratio: number; required: number } {
  // This is a simplified implementation
  // In a real app, you'd use a proper color contrast library
  const requiredRatio = level === 'AAA' ? 7 : 4.5
  
  // Mock calculation - replace with actual contrast calculation
  const ratio = 4.5 // This should be calculated from actual colors
  
  return {
    isValid: ratio >= requiredRatio,
    ratio,
    required: requiredRatio
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Skip link component for keyboard navigation
 */
export interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}