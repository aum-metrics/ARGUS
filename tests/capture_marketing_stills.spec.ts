
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Marketing Asset Generation', () => {


    test.use({
        viewport: { width: 1440, height: 900 }, // Desktop High Res
        deviceScaleFactor: 2, // Retina quality
    });

    test.beforeEach(async ({ page }) => {
        // Mock Public Stats API for Ticker
        await page.route('/api/public-stats', async route => {
            const json = {
                events: [
                    { type: 'ACCEPTED', field: 'Methodology', reason: 'Robust rigorous logic', score: 92 },
                    { type: 'REJECTED', field: 'Novelty', reason: 'Derivative of 2023 work', score: 45 },
                    { type: 'ACCEPTED', field: 'Formalism', reason: 'Proofs check out', score: 88 }
                ]
            };
            await route.fulfill({ json });
        });

        // [NEW] Mock Supabase Auth User to allow Dashboard Access
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                json: {
                    id: 'mock-user-id',
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: 'help@argus-thesis.com',
                    app_metadata: { provider: 'email' },
                    user_metadata: {},
                    created_at: new Date().toISOString()
                }
            });
        });
    });

    test('01. Hero Shot - Landing Page', async ({ page }) => {
        await page.goto('/');

        // Wait for Ticker to load (now mocked)
        // It's inside .active-scroll container or similar
        await expect(page.getByText('Live Audit Feed')).toBeVisible();
        await page.waitForTimeout(1000); // Allow animation to settle

        await page.addStyleTag({ content: 'body::-webkit-scrollbar { display: none; }' });
        await page.screenshot({ path: 'marketing_assets/01_Hero_Landing.png', fullPage: true });
    });

    test('02. Dashboard - Action State (Simulated)', async ({ page }) => {
        const highScoringSession = {
            id: "marketing-demo-id",
            created_at: new Date().toISOString(),
            paymentStatus: "PAID",
            data: {
                report: {
                    readinessScore: 92,
                    verdict: "PUBLISHABLE",
                    sixAdversaryScore: {
                        thesisClarity: 95,
                        argumentRobustness: 88,
                        methodologyRigor: 90,
                        noveltyPositioning: 96,
                        formalismPrecision: 92,
                        overall: 92
                    },
                    executiveSummary: "This manuscript represents a significant contribution to the field of Distributed Ledger Technology.",
                    truthStatement: "A technically sound and novel consensus mechanism with verified security properties.",
                    actionItems: [],
                    analysisDuration: 5.2
                },
                claims: [
                    { id: "CLM-001", statement: "The proposed 'Argus-BFT' achieves sub-second finality.", status: "ACCEPTED", governanceLog: [] }
                ],
                context: { candidateName: "Dr. Demo", degree: "PhD" }
            },
            expiresAt: new Date(Date.now() + 86400000).toISOString()
        };

        await page.goto('/dashboard');

        // Inject State
        // We write to localStorage 'argus_session'
        await page.evaluate((session) => {
            localStorage.setItem('argus_session', JSON.stringify(session));
        }, highScoringSession);

        await page.reload();
        // Wait for hydration
        await expect(page.getByText('Decision Matrix')).toBeVisible({ timeout: 15000 });

        await page.addStyleTag({ content: 'body::-webkit-scrollbar { display: none; }' });
        await page.screenshot({ path: 'marketing_assets/02_Dashboard_High_Score.png', fullPage: true });

        // Take specific screenshot of Scoreboard
        // We can find the container with "Decision Matrix"
        // And screenshot that element + margin
        // For now full page is simpler for the kit.
    });

    test('03. Certificate - Success State', async ({ page }) => {
        const highScoringSession = {
            id: "marketing-demo-id",
            created_at: new Date().toISOString(),
            paymentStatus: "PAID",
            data: {
                report: {
                    readinessScore: 92,
                    verdict: "PUBLISHABLE",
                    sixAdversaryScore: { overall: 92 },
                    truthStatement: "Excellent work."
                },
                claims: [{ id: "CLM-001", statement: "Valid", status: "ACCEPTED" }],
                context: { candidateName: "Demo User" }
            },
            expiresAt: new Date(Date.now() + 86400000).toISOString()
        };

        await page.goto('/dashboard');
        await page.evaluate((session) => {
            localStorage.setItem('argus_session', JSON.stringify(session));
        }, highScoringSession);
        await page.reload();

        // Wait for button
        const certBtn = page.getByRole('button', { name: /Verified Certificate/i }); // Regex loose match
        await expect(certBtn).toBeVisible({ timeout: 15000 });

        // Highlight the button for the screenshot? 
        // Or just capture the dashboard footer area
        await page.screenshot({ path: 'marketing_assets/03_Certificate_CallToAction.png', fullPage: true });
    });

    test('04. Mobile View - Responsive', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await expect(page.getByText('Live Audit Feed')).toBeVisible();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'marketing_assets/04_Mobile_Landing.png', fullPage: true });
    });

    test('05. Flyer - The Fear (Red)', async ({ page }) => {
        await page.goto('/marketing/flyers');
        await page.waitForLoadState('networkidle');
        const flyer = page.locator('#flyer-fear');
        await expect(flyer).toBeVisible();
        await flyer.screenshot({ path: 'marketing_assets/Flyer_01_Fear.png' });
    });

    test('06. Flyer - The Solution (White)', async ({ page }) => {
        await page.goto('/marketing/flyers');
        await page.waitForLoadState('networkidle');
        const flyer = page.locator('#flyer-solution');
        await expect(flyer).toBeVisible();
        await flyer.screenshot({ path: 'marketing_assets/Flyer_02_Solution.png' });
    });

    test('07. Flyer - The Institution (Blue)', async ({ page }) => {
        await page.goto('/marketing/flyers');
        await page.waitForLoadState('networkidle');
        const flyer = page.locator('#flyer-institution');
        await expect(flyer).toBeVisible();
        await flyer.screenshot({ path: 'marketing_assets/Flyer_03_Enterprise.png' });
    });

    test('08. Playground - Hero', async ({ page }) => {
        await page.goto('/playground');
        await page.setViewportSize({ width: 1440, height: 1080 });
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Public Research Playground')).toBeVisible();
        await page.screenshot({ path: 'marketing_assets/Playground_Hero.png' });

        // Simulate Input
        await page.getByPlaceholder('Paste your abstract here').fill('This thesis argues that AI will replace all developers.');
        await page.getByRole('button', { name: /Run Logic Scan/ }).click();

        // Wait for Result
        await expect(page.getByText('Defensibility Assessment:')).toBeVisible({ timeout: 10000 });
        await page.screenshot({ path: 'marketing_assets/Playground_Result.png' });
    });

});
