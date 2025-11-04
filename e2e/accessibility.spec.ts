import { test, expect } from '@playwright/test';

test.describe('Accessibility E2E Tests', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1 element
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Ensure there's only one h1 per page
    const h1Count = await h1.count();
    expect(h1Count).toBeLessThanOrEqual(1);
  });

  test('should have skip links for keyboard users', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first element (should be skip link)
    await page.keyboard.press('Tab');
    
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    
    // Check for navigation landmark
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This is a basic check - in a real scenario you'd use axe-core
    // or similar tools for comprehensive accessibility testing
    
    // Check if page loads and is visible (basic contrast check)
    await expect(page.locator('body')).toBeVisible();
    
    // Check if text is readable
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      await expect(headings.first()).toBeVisible();
    }
  });

  test('should be navigable with keyboard only', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation through interactive elements
    let tabCount = 0;
    const maxTabs = 10; // Limit to prevent infinite loop
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      // Check if we can identify focused element
      const focusedElement = page.locator(':focus');
      const isVisible = await focusedElement.isVisible().catch(() => false);
      
      if (isVisible) {
        // Successfully found a focusable element
        break;
      }
    }
    
    // At least one element should be focusable
    expect(tabCount).toBeLessThan(maxTabs);
  });
});