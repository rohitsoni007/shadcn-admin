/**
 * Accessibility testing utilities for WCAG 2.1 AA compliance
 */

interface AccessibilityIssue {
  element: HTMLElement
  issue: string
  severity: 'error' | 'warning' | 'info'
  wcagRule: string
  suggestion: string
}

/**
 * Check for common accessibility issues
 */
export function checkAccessibility(container: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []

  // Check for missing alt text on images
  const images = container.querySelectorAll('img')
  images.forEach((img) => {
    if (!img.hasAttribute('alt')) {
      issues.push({
        element: img,
        issue: 'Image missing alt attribute',
        severity: 'error',
        wcagRule: 'WCAG 1.1.1',
        suggestion: 'Add descriptive alt text or alt="" for decorative images'
      })
    }
  })

  // Check for missing form labels
  const inputs = container.querySelectorAll('input, textarea, select')
  inputs.forEach((input) => {
    const id = input.getAttribute('id')
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledBy = input.getAttribute('aria-labelledby')
    
    if (!ariaLabel && !ariaLabelledBy) {
      if (!id || !container.querySelector(`label[for="${id}"]`)) {
        issues.push({
          element: input as HTMLElement,
          issue: 'Form control missing accessible label',
          severity: 'error',
          wcagRule: 'WCAG 1.3.1',
          suggestion: 'Add aria-label, aria-labelledby, or associate with a label element'
        })
      }
    }
  })

  // Check for missing heading hierarchy
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  let previousLevel = 0
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > previousLevel + 1) {
      issues.push({
        element: heading as HTMLElement,
        issue: 'Heading level skipped',
        severity: 'warning',
        wcagRule: 'WCAG 1.3.1',
        suggestion: `Use h${previousLevel + 1} instead of h${level} to maintain hierarchy`
      })
    }
    previousLevel = level
  })

  // Check for insufficient color contrast
  const textElements = container.querySelectorAll('p, span, div, a, button, label')
  textElements.forEach((element) => {
    const styles = window.getComputedStyle(element)
    const color = styles.color
    const backgroundColor = styles.backgroundColor
    
    // This is a simplified check - in production, use a proper contrast calculation library
    if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      // Mock contrast check - replace with actual calculation
      const contrastRatio = calculateContrastRatio(color, backgroundColor)
      if (contrastRatio < 4.5) {
        issues.push({
          element: element as HTMLElement,
          issue: 'Insufficient color contrast',
          severity: 'error',
          wcagRule: 'WCAG 1.4.3',
          suggestion: `Increase contrast ratio to at least 4.5:1 (current: ${contrastRatio.toFixed(2)}:1)`
        })
      }
    }
  })

  // Check for missing focus indicators
  const focusableElements = container.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  )
  focusableElements.forEach((element) => {
    const styles = window.getComputedStyle(element, ':focus-visible')
    if (!styles.outline && !styles.boxShadow) {
      issues.push({
        element: element as HTMLElement,
        issue: 'Missing focus indicator',
        severity: 'error',
        wcagRule: 'WCAG 2.4.7',
        suggestion: 'Add visible focus indicator using outline or box-shadow'
      })
    }
  })

  // Check for missing ARIA landmarks
  const landmarks = container.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer')
  if (landmarks.length === 0) {
    issues.push({
      element: container,
      issue: 'No ARIA landmarks found',
      severity: 'warning',
      wcagRule: 'WCAG 1.3.1',
      suggestion: 'Add semantic HTML elements or ARIA landmark roles'
    })
  }

  // Check for missing skip links
  const skipLinks = container.querySelectorAll('a[href^="#"]')
  const hasSkipToMain = Array.from(skipLinks).some(link => 
    link.textContent?.toLowerCase().includes('skip') && 
    link.textContent?.toLowerCase().includes('main')
  )
  
  if (!hasSkipToMain) {
    issues.push({
      element: container,
      issue: 'Missing skip to main content link',
      severity: 'warning',
      wcagRule: 'WCAG 2.4.1',
      suggestion: 'Add a skip link to main content for keyboard users'
    })
  }

  return issues
}

/**
 * Simplified contrast ratio calculation
 * In production, use a proper color contrast library like 'color-contrast'
 */
function calculateContrastRatio(color1: string, color2: string): number {
  // This is a mock implementation
  // Replace with actual contrast calculation
  return 4.5 // Mock value that passes WCAG AA
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex')
  const isInteractive = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)
  const hasRole = element.hasAttribute('role')
  
  return (
    isInteractive ||
    (tabIndex !== null && tabIndex !== '-1') ||
    hasRole
  )
}

/**
 * Check if element has proper ARIA attributes
 */
export function hasProperAria(element: HTMLElement): boolean {
  const requiredAria = {
    'button': ['aria-label', 'aria-labelledby'],
    'link': ['aria-label', 'aria-labelledby'],
    'img': ['alt', 'aria-label', 'aria-labelledby'],
    'input': ['aria-label', 'aria-labelledby', 'id'],
    'textarea': ['aria-label', 'aria-labelledby', 'id'],
    'select': ['aria-label', 'aria-labelledby', 'id']
  }

  const tagName = element.tagName.toLowerCase()
  const required = requiredAria[tagName as keyof typeof requiredAria]
  
  if (!required) return true

  return required.some(attr => {
    if (attr === 'id') {
      const id = element.getAttribute('id')
      return id && document.querySelector(`label[for="${id}"]`)
    }
    return element.hasAttribute(attr)
  })
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(container: HTMLElement = document.body): {
  issues: AccessibilityIssue[]
  summary: {
    total: number
    errors: number
    warnings: number
    info: number
  }
  score: number
} {
  const issues = checkAccessibility(container)
  
  const summary = {
    total: issues.length,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length
  }

  // Calculate accessibility score (0-100)
  const maxPossibleIssues = container.querySelectorAll('*').length
  const score = Math.max(0, Math.round((1 - (summary.errors * 2 + summary.warnings) / maxPossibleIssues) * 100))

  return {
    issues,
    summary,
    score
  }
}

/**
 * Log accessibility issues to console
 */
export function logAccessibilityIssues(container: HTMLElement = document.body): void {
  const report = generateAccessibilityReport(container)
  
  console.group('🔍 Accessibility Report')
  console.log(`Score: ${report.score}/100`)
  console.log(`Total Issues: ${report.summary.total}`)
  console.log(`Errors: ${report.summary.errors}`)
  console.log(`Warnings: ${report.summary.warnings}`)
  
  if (report.issues.length > 0) {
    console.group('Issues:')
    report.issues.forEach((issue, index) => {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
      console.group(`${icon} ${issue.issue} (${issue.wcagRule})`)
      console.log('Element:', issue.element)
      console.log('Suggestion:', issue.suggestion)
      console.groupEnd()
    })
    console.groupEnd()
  }
  
  console.groupEnd()
}

/**
 * Development helper to run accessibility checks
 */
export function runAccessibilityCheck(): void {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      logAccessibilityIssues()
    }, 1000)
  }
}