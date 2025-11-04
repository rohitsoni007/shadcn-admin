import React from 'react'

interface ScreenReaderAnnouncementProps {
  message: string
  priority?: 'polite' | 'assertive'
  className?: string
}

export function ScreenReaderAnnouncement({ 
  message, 
  priority = 'polite',
  className 
}: ScreenReaderAnnouncementProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className || ''}`}
      role="status"
    >
      {message}
    </div>
  )
}

/**
 * Hook for managing screen reader announcements
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = React.useState('')
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite')

  const announce = React.useCallback((
    message: string, 
    announcementPriority: 'polite' | 'assertive' = 'polite'
  ) => {
    // Clear previous announcement
    setAnnouncement('')
    setPriority(announcementPriority)
    
    // Set new announcement after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      setAnnouncement(message)
    }, 100)
  }, [])

  const clear = React.useCallback(() => {
    setAnnouncement('')
  }, [])

  return { 
    announcement, 
    priority, 
    announce, 
    clear,
    AnnouncementComponent: () => (
      <ScreenReaderAnnouncement message={announcement} priority={priority} />
    )
  }
}