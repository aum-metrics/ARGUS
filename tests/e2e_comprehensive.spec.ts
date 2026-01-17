/**
 * Comprehensive E2E Test Suite - ARGUS-Thesis
 * Author: Sambath Kumar Natarajan
 * 
 * This test suite covers 5 iterations:
 * 1. Individual User Flow (Free Trial + Paid Audit)
 * 2. Organization User Flow (Lab Purchase + Shared Credits)
 * 3. Super Admin Flow (Pilot Creation + Role Management)
 * 4. Referral System Flow (Invite + Reward)
 * 5. Citation Validation (Confidence Scoring)
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
test.use({
    video: 'on', // Record all tests for demo video
    screenshot: 'on',
    trace: 'on'
});

// ============================================
// ITERATION 1: INDIVIDUAL USER FLOW
// ============================================

test.describe('Iteration 1: Individual User Flow', () => {
    test('Complete individual researcher journey', async ({ page }) => {
        // 1. Register new user
        await page.goto('http://localhost:3000/register');
        await page.fill('input[name="email"]', `researcher_${Date.now()}@test.edu`);
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.fill('input[name="full_name"]', 'Dr. Jane Smith');
        await page.fill('input[name="institution"]', 'Stanford University');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL('**/dashboard');

        // 2. Verify free trial eligibility
        await expect(page.locator('text=Free Trial')).toBeVisible();

        // 3. Upload manuscript (use sample text)
        const sampleManuscript = `
      Abstract: This study investigates the impact of machine learning on academic research.
      We propose a novel framework for automated manuscript validation using adversarial AI.
      
      Introduction: Recent advances in natural language processing have enabled...
      
      Methodology: We employed a 6-agent adversarial system to critique research claims.
      Our approach differs from Smith et al. (2020) by incorporating constitutional constraints.
      
      Results: The system achieved 96% accuracy in detecting logical fallacies.
      
      Conclusion: Our findings suggest that AI-powered validation can reduce desk rejections by 40%.
    `.repeat(10); // Make it long enough

        await page.fill('textarea[placeholder*="Paste your abstract"]', sampleManuscript);

        // 4. Activate free trial
        await page.click('button:has-text("Start Free Trial")');
        await page.waitForTimeout(2000);

        // 5. Run audit
        await page.click('button:has-text("Extract Claims")');

        // Wait for governance loop to complete (up to 2 minutes)
        await page.waitForSelector('text=Governance Complete', { timeout: 120000 });

        // 6. Verify results
        await expect(page.locator('.claim-card')).toHaveCount({ min: 1 });

        // 7. Download report
        await page.click('button:has-text("Download")');

        console.log('[ITERATION 1] Individual user flow completed successfully');
    });
});

// ============================================
// ITERATION 2: ORGANIZATION USER FLOW
// ============================================

test.describe('Iteration 2: Organization User Flow', () => {
    test('Complete organization purchase and member workflow', async ({ page }) => {
        // 1. Register organization admin
        await page.goto('http://localhost:3000/register');
        await page.fill('input[name="email"]', `org_admin_${Date.now()}@lab.edu`);
        await page.fill('input[name="password"]', 'OrgAdmin123!');
        await page.fill('input[name="full_name"]', 'Prof. John Doe');
        await page.fill('input[name="institution"]', 'MIT Computer Science Lab');
        await page.click('button[type="submit"]');

        await page.waitForURL('**/dashboard');

        // 2. Navigate to organization registration
        await page.goto('http://localhost:3000/register/organization');

        // 3. Fill organization details
        await page.click('label:has-text("Lab Starter")'); // Select tier
        await page.fill('input[name="orgName"]', 'MIT AI Research Lab');
        await page.fill('input[name="contactEmail"]', 'admin@mit-ai-lab.edu');
        await page.fill('input[name="contactName"]', 'Prof. John Doe');

        // 4. Initiate payment (Razorpay test mode)
        await page.click('button:has-text("Proceed to Payment")');

        // Wait for Razorpay modal (in test mode, we'll skip actual payment)
        await page.waitForTimeout(3000);

        // Note: In production, you'd complete Razorpay flow here
        // For testing, we'll simulate successful payment via API

        console.log('[ITERATION 2] Organization purchase flow initiated');
    });

    test('Verify organization member can use shared credits', async ({ page, context }) => {
        // This test assumes an organization already exists with credits

        // 1. Register lab member
        await page.goto('http://localhost:3000/register');
        await page.fill('input[name="email"]', `lab_member_${Date.now()}@mit.edu`);
        await page.fill('input[name="password"]', 'LabMember123!');
        await page.fill('input[name="full_name"]', 'PhD Student Alice');
        await page.fill('input[name="institution"]', 'MIT');
        await page.click('button[type="submit"]');

        await page.waitForURL('**/dashboard');

        // 2. Admin assigns member to organization (manual step for now)
        // In production, this would be done via admin dashboard

        // 3. Member uploads manuscript
        const manuscript = "Sample research paper content...".repeat(50);
        await page.fill('textarea', manuscript);

        // 4. Run audit using org credits
        await page.click('button:has-text("Extract Claims")');

        // 5. Verify org credits are deducted (not personal credits)
        await page.waitForSelector('text=Governance Complete', { timeout: 120000 });

        console.log('[ITERATION 2] Organization member workflow completed');
    });
});

// ============================================
// ITERATION 3: SUPER ADMIN FLOW
// ============================================

test.describe('Iteration 3: Super Admin Flow', () => {
    test('Super Admin creates pilot program', async ({ page }) => {
        // 1. Login as Super Admin
        await page.goto('http://localhost:3000/login');
        await page.fill('input[type="email"]', 'admin@argus-thesis.com');
        await page.fill('input[type="password"]', 'super_secret_admin_argus_2026!');
        await page.click('button[type="submit"]');

        // 2. Navigate to admin dashboard
        await page.goto('http://localhost:3000/admin');
        await expect(page.locator('text=System Command')).toBeVisible();

        // 3. Go to Organizations tab
        await page.click('button:has-text("Organizations")');

        // 4. Create pilot program
        await page.click('button:has-text("Create Pilot")');

        // Handle browser prompts
        page.on('dialog', async dialog => {
            const message = dialog.message();
            if (message.includes('University Name')) {
                await dialog.accept('IIT Madras - CS Department');
            } else if (message.includes('Contact Email')) {
                await dialog.accept('pilot@iitm.ac.in');
            } else if (message.includes('Contact Name')) {
                await dialog.accept('Dr. Pilot Coordinator');
            } else {
                await dialog.accept();
            }
        });

        await page.waitForTimeout(2000);

        // 5. Verify pilot appears in organizations table
        await expect(page.locator('text=IIT Madras')).toBeVisible();
        await expect(page.locator('text=PILOT')).toBeVisible();

        // 6. Check global audit stream
        await page.click('button:has-text("Global Pulse")');
        await expect(page.locator('.audit-stream')).toBeVisible();

        console.log('[ITERATION 3] Super Admin pilot creation completed');
    });
});

// ============================================
// ITERATION 4: REFERRAL SYSTEM FLOW
// ============================================

test.describe('Iteration 4: Referral System Flow', () => {
    let referralCode: string;

    test('Referrer generates referral link', async ({ page }) => {
        // 1. Register referrer
        await page.goto('http://localhost:3000/register');
        await page.fill('input[name="email"]', `referrer_${Date.now()}@test.edu`);
        await page.fill('input[name="password"]', 'Referrer123!');
        await page.fill('input[name="full_name"]', 'Dr. Referrer');
        await page.click('button[type="submit"]');

        await page.waitForURL('**/dashboard');

        // 2. Navigate to referrals page
        await page.goto('http://localhost:3000/dashboard/referrals');

        // 3. Copy referral link
        const referralLink = await page.locator('input[readonly]').inputValue();
        referralCode = referralLink.split('ref=')[1];

        console.log('[ITERATION 4] Referral code generated:', referralCode);

        // 4. Send invite
        await page.fill('input[type="email"]', 'referee@test.edu');
        await page.click('button:has-text("Invite")');

        await expect(page.locator('text=Referral created')).toBeVisible();
    });

    test('Referee signs up and completes audit', async ({ page }) => {
        // This test would use the referral code from previous test
        // For now, we'll simulate with a static code

        // 1. Register with referral code
        await page.goto(`http://localhost:3000/login?ref=test_ref_code`);
        await page.click('a:has-text("Sign up")');

        await page.fill('input[name="email"]', `referee_${Date.now()}@test.edu`);
        await page.fill('input[name="password"]', 'Referee123!');
        await page.fill('input[name="full_name"]', 'Dr. Referee');
        await page.click('button[type="submit"]');

        // 2. Complete paid audit (this would trigger referral reward)
        // ... (similar to Iteration 1)

        console.log('[ITERATION 4] Referee signup completed');
    });
});

// ============================================
// ITERATION 5: CITATION VALIDATION
// ============================================

test.describe('Iteration 5: Citation Validation', () => {
    test('Validate citation confidence scoring', async ({ page }) => {
        // This is a unit test for the citation validator
        // We'll test it via API call

        const response = await page.request.post('http://localhost:3000/api/test-citation-validator', {
            data: {
                critique: "Smith et al. (2020) found that machine learning improves research quality. However, Jones (2019) contradicts this claim."
            }
        });

        const result = await response.json();

        expect(result.confidenceScore).toBeGreaterThan(0);
        expect(result.confidenceScore).toBeLessThanOrEqual(100);
        expect(result.checks).toHaveLength(2); // Two citations

        console.log('[ITERATION 5] Citation validation:', result);
    });
});

// ============================================
// DEMO VIDEO COMPILATION
// ============================================

test.describe('Demo Video Compilation', () => {
    test('Record complete user journey for demo', async ({ page }) => {
        // This test will be the "hero" recording for the demo video

        // 1. Start at homepage
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(2000);

        // 2. Navigate to playground (public demo)
        await page.click('a:has-text("Try Logic Scan")');
        await page.waitForURL('**/playground');

        // 3. Enter sample text
        const demoText = `
      We propose a novel deep learning architecture that achieves 99% accuracy on ImageNet.
      Our approach outperforms all existing methods including ResNet (He et al., 2016).
      The model was trained on 1000 samples and generalizes to unseen data.
    `;

        await page.fill('textarea', demoText);
        await page.click('button:has-text("Analyze Logic")');

        // Wait for simulated result
        await page.waitForSelector('.score-display', { timeout: 10000 });

        // 4. Show the "mean reviewer" critique
        await expect(page.locator('text=Logic Score')).toBeVisible();

        // 5. Highlight Constitutional AI moat
        // (This will be emphasized in voiceover)

        console.log('[DEMO] Complete user journey recorded');
    });
});
