
import { test, expect } from '@playwright/test';

test('UAT-Admin: Security & Access Control', async ({ page }) => {
    // 1. NEGATIVE TEST: Access as Anonymous
    await page.goto('http://localhost:3000/admin');
    await expect(page).toHaveURL(/login/); // Should redirect

    // 2. POSITIVE TEST: Access as Super Admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@argus-thesis.com');
    await page.fill('input[type="password"]', 'super_secret_admin_argus_2026!');
    await page.click('button:has-text("Sign in")');

    // Wait for navigation
    await page.waitForTimeout(3000); // Give it a moment

    if (page.url().includes('login')) {
        const errorText = await page.locator('.text-red-900').textContent();
        console.log(`❌ Login Failed. Error on page: ${errorText}`);
    }

    // Wait for dashboard redirect, then go to admin
    await expect(page).toHaveURL(/dashboard/);
    await page.goto('http://localhost:3000/admin');

    // 3. Verify Dashboard Elements
    await expect(page.locator('text=System command Center')).toBeVisible(); // Typo in UI "System Command" mixed case? Checking file.. 
    // Code said: "System Command" (Title Case)
    await expect(page.locator('text=System Command')).toBeVisible();

    // Verify Tabs exist
    await expect(page.locator('text=Global Pulse')).toBeVisible();
    await expect(page.locator('text=Organizations')).toBeVisible();

    console.log("✅ UAT-Admin Passed: Security Redirects & Admin Access Verified");
});
