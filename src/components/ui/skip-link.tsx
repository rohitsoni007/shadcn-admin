import React from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Position off-screen by default
        'absolute left-[-10000px] top-auto w-1 h-1 overflow-hidden',
        // Show when focused
        'focus:left-4 focus:top-4 focus:w-auto focus:h-auto focus:overflow-visible',
        // Styling when visible
        'focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring',
        'focus:transition-none',
        className
      )}
      onFocus={(e) => {
        // Ensure the link is visible when focused
        e.currentTarget.style.position = 'fixed'
      }}
      onBlur={(e) => {
        // Hide the link when focus is lost
        e.currentTarget.style.position = 'absolute'
      }}
    >
      {children}
    </a>
  )
}