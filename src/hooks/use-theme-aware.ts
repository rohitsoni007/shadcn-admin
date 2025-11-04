import { useTheme } from "@/components/theme-provider"
import { useMemo } from "react"

/**
 * Hook for theme-aware styling and logic
 * Provides utilities for conditional styling based on current theme
 */
export function useThemeAware() {
  const { theme, actualTheme } = useTheme()

  const themeClasses = useMemo(() => ({
    // Background variants
    cardBg: actualTheme === "dark" ? "bg-card/50" : "bg-card",
    surfaceBg: actualTheme === "dark" ? "bg-muted/30" : "bg-muted/50",
    
    // Border variants
    subtleBorder: actualTheme === "dark" ? "border-border/50" : "border-border/30",
    
    // Text variants
    mutedText: actualTheme === "dark" ? "text-muted-foreground/80" : "text-muted-foreground/70",
    
    // Interactive states
    hoverBg: actualTheme === "dark" ? "hover:bg-accent/50" : "hover:bg-accent/30",
    activeBg: actualTheme === "dark" ? "active:bg-accent/70" : "active:bg-accent/50",
  }), [actualTheme])

  const isDark = actualTheme === "dark"
  const isLight = actualTheme === "light"
  const isSystemTheme = theme === "system"

  return {
    theme,
    actualTheme,
    isDark,
    isLight,
    isSystemTheme,
    themeClasses,
  }
}