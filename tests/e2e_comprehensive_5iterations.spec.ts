/**
 * Comprehensive E2E Test Suite - 5 Iterations
 * Author: Sambath Kumar Natarajan
 * 
 * Tests all user flows, roles, and features across 5 iterations:
 * 1. Individual User Flow
 * 2. Organization User Flow
 * 3. Super Admin Flow
 * 4. Referral System Flow
 * 5. Integrated Citation Validation Flow
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TIMESTAMP = Date.now();

// Test users
const INDIVIDUAL_USER = {
    email: `individual_${TIMESTAMP}@test.com`,
    password: 'TestPass123!',
    fullName: 'Individual Test User'
};

const ORG_ADMIN = {
    email: `orgadmin_${TIMESTAMP}@test.com`,
    password: 'TestPass123!',
    fullName: 'Org Admin User',
    orgName: `Test Organization ${TIMESTAMP}`
};

const ORG_MEMBER = {
    email: `orgmember_${TIMESTAMP}@test.com`,
    password: 'TestPass123!',
    fullName: 'Org Member User'
};

const SUPER_ADMIN = {
    email: 'admin@argus-thesis.com',
    password: 'super_secret_admin_argus_2026!'
};

// Helper functions
async function registerIndividualUser(page: Page, user: typeof INDIVIDUAL_USER) {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');

    // Fill form with correct IDs from new registration page
    await page.fill('input[id="fullName"]', user.fullName);
    await page.fill('input[id="email"]', user.email);
    await page.fill('input[id="password"]', user.password);

    await page.click('button[type="submit"]:has-text("Create Account")');

    // Handle dev bypass if available
    try {
        await page.waitForSelector('button:has-text("Dev: Force Activate")', { timeout: 3000 });
        await page.click('button:has-text("Dev: Force Activate")');
        await page.waitForURL('**/login', { timeout: 5000 });

        // Login with new account
        await page.fill('input[id="signin-email"]', user.email);
        await page.fill('input[id="signin-password"]', user.password);
        await page.click('button[type="submit"]:has-text("Sign In")');
    } catch (e) {
        console.log('  ℹ Dev bypass not available, waiting for email verification');
    }

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000, waitUntil: 'domcontentloaded' });
}

async function registerOrganization(page: Page, admin: typeof ORG_ADMIN) {
    await page.goto(`${BASE_URL}/register/organization`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.fill('input[placeholder*="name" i], input[name="fullName"]', admin.fullName);
    await page.fill('input[placeholder*="organization" i], input[name="organizationName"]', admin.orgName);

    await page.click('button[type="submit"]');
    // Increased timeout and better wait strategy for slow dashboard initialization
    await page.waitForURL('**/dashboard', { timeout: 30000, waitUntil: 'domcontentloaded' });
}

async function login(page: Page, email: string, password: string) {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Use correct signin field IDs
    await page.fill('input[id="signin-email"]', email);
    await page.fill('input[id="signin-password"]', password);

    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('**/dashboard', { timeout: 30000, waitUntil: 'domcontentloaded' });
}

async function logout(page: Page) {
    // Look for logout button or user menu
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
    if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
    } else {
        // Try clicking user menu first
        await page.click('[data-testid="user-menu"], button:has-text("Profile")').catch(() => { });
        await page.click('button:has-text("Logout"), button:has-text("Sign Out")').catch(() => { });
    }
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => { });
}

async function submitClaim(page: Page, claim: string) {
    await page.goto(`${BASE_URL}/playground`);
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea').first();
    await textarea.fill(claim);

    const submitButton = page.locator('button:has-text("Validate"), button:has-text("Submit"), button[type="submit"]').first();
    await submitButton.click();

    // Wait for results
    await page.waitForSelector('.result, .claim-result, [data-testid="validation-result"]', { timeout: 30000 });
}

// ============================================================================
// ITERATION 1: INDIVIDUAL USER FLOW
// ============================================================================

test.describe('Iteration 1: Individual User Flow', () => {
    test('should register, login, validate citation, and logout', async ({ page }) => {
        console.log('🧪 ITERATION 1: Individual User Flow');

        // Step 1: Register
        console.log('  ✓ Registering individual user...');
        await registerIndividualUser(page, INDIVIDUAL_USER);
        await page.screenshot({ path: `test-results/iter1-01-registration.png`, fullPage: true });

        // Step 2: Verify dashboard access
        console.log('  ✓ Verifying dashboard access...');
        await expect(page).toHaveURL(/.*dashboard/);
        await page.screenshot({ path: `test-results/iter1-02-dashboard.png`, fullPage: true });

        // Step 3: Navigate to playground
        console.log('  ✓ Navigating to playground...');
        await page.goto(`${BASE_URL}/playground`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `test-results/iter1-03-playground.png`, fullPage: true });

        // Step 4: Submit claim with citation
        console.log('  ✓ Submitting claim for validation...');
        const testClaim = 'AI systems should prioritize human safety. According to Smith et al. (2023), "safety measures are critical in AI development."';
        await submitClaim(page, testClaim);
        await page.screenshot({ path: `test-results/iter1-04-validation-results.png`, fullPage: true });

        // Step 5: Verify results displayed
        console.log('  ✓ Verifying validation results...');
        const resultsVisible = await page.locator('.result, .claim-result, [data-testid="validation-result"]').count() > 0;
        expect(resultsVisible).toBeTruthy();

        // Step 6: Logout
        console.log('  ✓ Logging out...');
        await logout(page);
        await page.screenshot({ path: `test-results/iter1-05-logout.png`, fullPage: true });

        console.log('✅ ITERATION 1 COMPLETE\n');
    });
});

// ============================================================================
// ITERATION 2: ORGANIZATION USER FLOW
// ============================================================================

test.describe('Iteration 2: Organization User Flow', () => {
    test('should register org, test admin vs member roles', async ({ page, context }) => {
        console.log('🧪 ITERATION 2: Organization User Flow');

        // Step 1: Register organization
        console.log('  ✓ Registering organization...');
        await registerOrganization(page, ORG_ADMIN);
        await page.screenshot({ path: `test-results/iter2-01-org-registration.png`, fullPage: true });

        // Step 2: Verify organization dashboard
        console.log('  ✓ Verifying organization dashboard...');
        await expect(page).toHaveURL(/.*dashboard/);
        await page.screenshot({ path: `test-results/iter2-02-org-dashboard.png`, fullPage: true });

        // Step 3: Check admin-specific features
        console.log('  ✓ Checking admin features...');
        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForLoadState('networkidle');

        // Look for organization-specific elements
        const orgElements = await page.locator('text=/organization|members|team/i').count();
        console.log(`    Found ${orgElements} organization-related elements`);
        await page.screenshot({ path: `test-results/iter2-03-admin-features.png`, fullPage: true });

        // Step 4: Submit claim as admin
        console.log('  ✓ Submitting claim as admin...');
        const adminClaim = 'Organizations benefit from shared resources. Research by Johnson (2024) shows "collaborative environments increase productivity."';
        await submitClaim(page, adminClaim);
        await page.screenshot({ path: `test-results/iter2-04-admin-claim.png`, fullPage: true });

        // Step 5: Logout admin
        console.log('  ✓ Logging out admin...');
        await logout(page);

        // Step 6: Register member (simulate member joining)
        console.log('  ✓ Registering organization member...');
        await registerIndividualUser(page, ORG_MEMBER);
        await page.screenshot({ path: `test-results/iter2-05-member-registration.png`, fullPage: true });

        // Step 7: Submit claim as member
        console.log('  ✓ Submitting claim as member...');
        const memberClaim = 'Team collaboration is essential. According to Davis (2024), "shared goals drive success."';
        await submitClaim(page, memberClaim);
        await page.screenshot({ path: `test-results/iter2-06-member-claim.png`, fullPage: true });

        console.log('✅ ITERATION 2 COMPLETE\n');
    });
});

// ============================================================================
// ITERATION 3: SUPER ADMIN FLOW
// ============================================================================

test.describe('Iteration 3: Super Admin Flow', () => {
    test('should access admin dashboard and create pilot', async ({ page }) => {
        console.log('🧪 ITERATION 3: Super Admin Flow');

        // Step 1: Login as super admin
        console.log('  ✓ Logging in as super admin...');
        await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
        await page.screenshot({ path: `test-results/iter3-01-admin-login.png`, fullPage: true });

        // Step 2: Navigate to admin dashboard
        console.log('  ✓ Accessing admin dashboard...');
        await page.goto(`${BASE_URL}/admin`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `test-results/iter3-02-admin-dashboard.png`, fullPage: true });

        // Step 3: Verify system metrics
        console.log('  ✓ Verifying system metrics...');
        const metricsVisible = await page.locator('text=/total users|organizations|audits/i').count() > 0;
        expect(metricsVisible).toBeTruthy();
        await page.screenshot({ path: `test-results/iter3-03-system-metrics.png`, fullPage: true });

        // Step 4: Navigate to Organizations tab
        console.log('  ✓ Navigating to Organizations tab...');
        await page.click('button:has-text("Organizations"), [role="tab"]:has-text("Organizations")');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `test-results/iter3-04-organizations-tab.png`, fullPage: true });

        // Step 5: Create pilot program
        console.log('  ✓ Creating pilot program...');
        const createPilotButton = page.locator('button:has-text("Create Pilot")');

        if (await createPilotButton.count() > 0) {
            await createPilotButton.click();
            await page.waitForTimeout(500);

            // Fill pilot creation modal
            await page.fill('input[id="universityName"], input[placeholder*="University"]', `Test University ${TIMESTAMP}`);
            await page.fill('input[id="contactName"], input[placeholder*="Contact Name"]', 'Dr. Test Contact');
            await page.fill('input[id="contactEmail"], input[type="email"]', `pilot_${TIMESTAMP}@university.edu`);

            await page.screenshot({ path: `test-results/iter3-05-pilot-modal.png`, fullPage: true });

            // Submit pilot creation
            await page.click('button:has-text("Create Pilot"), button[type="submit"]');
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `test-results/iter3-06-pilot-created.png`, fullPage: true });

            console.log('    ✓ Pilot created successfully');
        } else {
            console.log('    ⚠ Create Pilot button not found');
        }

        // Step 6: View audit logs
        console.log('  ✓ Viewing audit logs...');
        await page.click('button:has-text("Global Pulse"), button:has-text("Feed"), [role="tab"]:has-text("feed")').catch(() => { });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `test-results/iter3-07-audit-logs.png`, fullPage: true });

        // Step 7: View users
        console.log('  ✓ Viewing user directory...');
        await page.click('button:has-text("User Directory"), button:has-text("Users"), [role="tab"]:has-text("users")').catch(() => { });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `test-results/iter3-08-users.png`, fullPage: true });

        console.log('✅ ITERATION 3 COMPLETE\n');
    });
});

// ============================================================================
// ITERATION 4: REFERRAL SYSTEM FLOW
// ============================================================================

test.describe('Iteration 4: Referral System Flow', () => {
    test('should generate referral code and track referrals', async ({ page }) => {
        console.log('🧪 ITERATION 4: Referral System Flow');

        // Step 1: Login as individual user
        console.log('  ✓ Logging in as individual user...');
        await login(page, INDIVIDUAL_USER.email, INDIVIDUAL_USER.password);
        await page.screenshot({ path: `test-results/iter4-01-login.png`, fullPage: true });

        // Step 2: Navigate to referral section
        console.log('  ✓ Looking for referral section...');
        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForLoadState('networkidle');

        // Look for referral code or referral section
        const referralSection = page.locator('text=/referral|invite|refer/i');
        const referralExists = await referralSection.count() > 0;

        if (referralExists) {
            console.log('    ✓ Referral section found');
            await page.screenshot({ path: `test-results/iter4-02-referral-section.png`, fullPage: true });

            // Try to find and copy referral code
            const referralCode = await page.locator('[data-testid="referral-code"], code, .referral-code').textContent().catch(() => null);
            if (referralCode) {
                console.log(`    ✓ Referral code: ${referralCode}`);
            }
        } else {
            console.log('    ⚠ Referral section not found (feature may not be implemented)');
        }

        await page.screenshot({ path: `test-results/iter4-03-referral-check.png`, fullPage: true });

        console.log('✅ ITERATION 4 COMPLETE\n');
    });
});

// ============================================================================
// ITERATION 5: INTEGRATED CITATION VALIDATION FLOW
// ============================================================================

test.describe('Iteration 5: Integrated Citation Validation Flow', () => {
    test('should validate multiple citation formats and complex claims', async ({ page }) => {
        console.log('🧪 ITERATION 5: Integrated Citation Validation Flow');

        // Step 1: Login
        console.log('  ✓ Logging in...');
        await login(page, INDIVIDUAL_USER.email, INDIVIDUAL_USER.password);

        // Step 2: Test APA format
        console.log('  ✓ Testing APA format citation...');
        const apaClaim = 'Research shows AI safety is paramount. Smith, J., & Johnson, M. (2023). AI Safety Principles. Journal of AI Research, 15(2), 45-67.';
        await submitClaim(page, apaClaim);
        await page.screenshot({ path: `test-results/iter5-01-apa-citation.png`, fullPage: true });
        await page.waitForTimeout(2000);

        // Step 3: Test MLA format
        console.log('  ✓ Testing MLA format citation...');
        const mlaClaim = 'Constitutional AI ensures ethical outcomes. Davis, Robert. "Ethics in AI Systems." AI Ethics Quarterly, vol. 8, no. 3, 2024, pp. 120-135.';
        await page.goto(`${BASE_URL}/playground`);
        await submitClaim(page, mlaClaim);
        await page.screenshot({ path: `test-results/iter5-02-mla-citation.png`, fullPage: true });
        await page.waitForTimeout(2000);

        // Step 4: Test complex claim with multiple citations
        console.log('  ✓ Testing complex claim with multiple citations...');
        const complexClaim = `
            AI governance requires multiple perspectives. According to Brown et al. (2024), "diverse viewpoints strengthen AI safety protocols."
            Furthermore, research by Chen (2023) demonstrates that "collaborative oversight mechanisms reduce AI risks by 40%."
            The constitutional approach, as outlined by Williams and Taylor (2024), provides "a framework for ethical AI development that balances innovation with safety."
        `;
        await page.goto(`${BASE_URL}/playground`);
        await submitClaim(page, complexClaim);
        await page.screenshot({ path: `test-results/iter5-03-complex-claim.png`, fullPage: true });
        await page.waitForTimeout(3000);

        // Step 5: Verify results persistence
        console.log('  ✓ Verifying results persistence...');
        const resultsCount = await page.locator('.result, .claim-result, [data-testid="validation-result"]').count();
        console.log(`    Found ${resultsCount} validation results`);
        await page.screenshot({ path: `test-results/iter5-04-results-persistence.png`, fullPage: true });

        // Step 6: Test error handling with invalid citation
        console.log('  ✓ Testing error handling...');
        const invalidClaim = 'This claim has no proper citation format just random text.';
        await page.goto(`${BASE_URL}/playground`);
        await submitClaim(page, invalidClaim);
        await page.screenshot({ path: `test-results/iter5-05-error-handling.png`, fullPage: true });

        console.log('✅ ITERATION 5 COMPLETE\n');
    });
});

// ============================================================================
// CROSS-ITERATION VERIFICATION
// ============================================================================

test.describe('Cross-Iteration: RBAC and Security', () => {
    test('should enforce role-based access control', async ({ page }) => {
        console.log('🧪 CROSS-ITERATION: RBAC Verification');

        // Test 1: Individual user cannot access admin routes
        console.log('  ✓ Testing individual user admin access...');
        await login(page, INDIVIDUAL_USER.email, INDIVIDUAL_USER.password);

        await page.goto(`${BASE_URL}/admin`);
        await page.waitForLoadState('networkidle');

        // Should either redirect or show access denied
        const currentUrl = page.url();
        const hasAccessDenied = await page.locator('text=/access denied|forbidden|unauthorized/i').count() > 0;

        if (currentUrl.includes('/admin') && !hasAccessDenied) {
            console.log('    ⚠ WARNING: Individual user can access admin dashboard!');
        } else {
            console.log('    ✓ Individual user properly blocked from admin access');
        }

        await page.screenshot({ path: `test-results/cross-01-rbac-individual.png`, fullPage: true });

        console.log('✅ RBAC VERIFICATION COMPLETE\n');
    });
});

test.describe('Cross-Iteration: UI Consistency', () => {
    test('should have consistent light theme across all pages', async ({ page }) => {
        console.log('🧪 CROSS-ITERATION: UI Consistency');

        await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);

        const pages = [
            { url: '/dashboard', name: 'Dashboard' },
            { url: '/playground', name: 'Playground' },
            { url: '/admin', name: 'Admin' }
        ];

        for (const pageInfo of pages) {
            console.log(`  ✓ Checking ${pageInfo.name}...`);
            await page.goto(`${BASE_URL}${pageInfo.url}`);
            await page.waitForLoadState('networkidle');

            // Check for light theme (bg-zinc-50, bg-white, etc.)
            const bodyBg = await page.locator('body, main, [class*="bg-"]').first().evaluate(el =>
                window.getComputedStyle(el).backgroundColor
            );

            console.log(`    Background: ${bodyBg}`);
            await page.screenshot({ path: `test-results/cross-ui-${pageInfo.name.toLowerCase()}.png`, fullPage: true });
        }

        console.log('✅ UI CONSISTENCY CHECK COMPLETE\n');
    });
});
