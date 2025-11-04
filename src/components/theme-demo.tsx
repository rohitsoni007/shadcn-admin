import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./theme-toggle"
import { ThemeToggleSimple } from "./theme-toggle-simple"
import { useTheme } from "./theme-provider"
import { useThemeAware } from "@/hooks/use-theme-aware"

export function ThemeDemo() {
  const { theme, actualTheme } = useTheme()
  const { themeClasses, isDark, isSystemTheme } = useThemeAware()

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Theme System Demo
            <div className="flex gap-2">
              <ThemeToggleSimple />
              <ThemeToggle />
            </div>
          </CardTitle>
          <CardDescription>
            Testing the theme system with proper contrast ratios and smooth transitions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">
              Current Theme: {theme}
            </Badge>
            <Badge variant={isDark ? "default" : "secondary"}>
              Actual Theme: {actualTheme}
            </Badge>
            {isSystemTheme && (
              <Badge variant="outline">
                Following System Preference
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={themeClasses.cardBg}>
              <CardHeader>
                <CardTitle className="text-sm">Theme-Aware Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={themeClasses.mutedText}>
                  This card uses theme-aware styling for optimal contrast.
                </p>
              </CardContent>
            </Card>
            
            <Card className={`${themeClasses.surfaceBg} ${themeClasses.subtleBorder}`}>
              <CardHeader>
                <CardTitle className="text-sm">Surface Variant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  Different surface treatment with proper accessibility.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Accessibility Features:</h4>
            <ul className={`text-sm ${themeClasses.mutedText} space-y-1`}>
              <li>• WCAG 2.1 AA compliant contrast ratios</li>
              <li>• Smooth theme transitions (0.3s ease)</li>
              <li>• System theme preference detection</li>
              <li>• Persistent theme storage</li>
              <li>• Keyboard navigation support</li>
              <li>• Screen reader friendly labels</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}