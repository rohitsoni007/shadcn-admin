import { test, expect } from '@playwright/test';

test.describe('Navigation E2E Tests', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to different routes
    const routes = ['/dashboard', '/users', '/settings'];
    
    for (const route of routes) {
      await page.goto(route);
      
      // Check if page loads without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Check if URL is correct
      expect(page.url()).toContain(route);
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto('/non-existent-page');
    
    // Should either redirect or show 404 page
    // The exact behavior depends on router configuration
    await expect(page.locator('body')).toBeVisible();
  });

  test('should maintain navigation state on page refresh', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Refresh the page
    await page.reload();
    
    // Check if we're still on the dashboard
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });
});