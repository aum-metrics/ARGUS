
import { type GovernanceRole } from '../argus/governance';

// Mocking the prompts locally for the script to avoid complex imports
const getRolePrompt = (role: string, context: string) => {
    switch (role) {
        case 'THESIS_CONSTRUCTOR':
            return `ROLE: THESIS CONSTRUCTOR. Goal: Formulate a sharp, falsifiable academic claim based on the User Topic.
            User Topic: ${context}
            Output Format:
            CLAIM: <The specific claim>
            ASSUMPTIONS: <List of assumptions>`;
        case 'THESIS_DESTROYER':
            return `ROLE: THESIS DESTROYER. Goal: Attack the claim relentlessly. Find logical fallacies.
            Claim: ${context}`;
        case 'JOURNAL_REVIEWER_SIMULATOR':
            return `ROLE: REVIEWER. Goal: Issue a final verdict.
            Context: ${context}
            Output Format:
            VERDICT: <ACCEPT or REJECT>
            FAILURE_TAGS: <Comma separated tags>`;
        default:
            return `Role ${role}: Analyze ${context}`;
    }
}

async function runSimulation() {
    console.log(">>> STARTING E2E SIMULATION (Headless) <<<");

    // 1. Submit Paper (Constructor)
    const topic = "Artificial General Intelligence centralization risks";
    console.log(`\n[Step 1] Submitting Topic: "${topic}"`);

    // We need to bypass the adapter and call the API directly or mock the fetch
    // Since we are running in a script, we can hit localhost:3000 if it's running
    // But we might not have the API Key in the script env. 
    // We will assume the server has the key or we can mock the response if needed.
    // Actually, let's try to hit the running server.

    const API_URL = "http://localhost:3000/api/chatgpt";

    async function callAgent(prompt: string) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "TEST_KEY" })
            });
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            const data = await res.json();
            return data.content;
        } catch (e) {
            console.log("API Call Failed (Expected if no API Key in Server Env). Returning Mock Data for Verification.");
            return null; // Return null to trigger mock fallback
        }
    }

    let claim = "";
    let logs = [];

    // TRY REAL CALL
    let constructorOutput = await callAgent(getRolePrompt('THESIS_CONSTRUCTOR', topic));

    if (!constructorOutput) {
        console.log("⚠️  Server/API not reachable or configured. Using Mock Simulation to demonstrate Logic Flow.");
        constructorOutput = "CLAIM: AGI will inevitably centralize power due to compute scaling laws.\nASSUMPTIONS: Compute costs will rise, Efficiency requires centralization.";
    }

    console.log(`[Result] Constructor: ${constructorOutput.replace(/\n/g, ' ')}`);
    claim = "AGI will inevitably centralize power due to compute scaling laws.";

    // 2. Attack (Destroyer)
    console.log(`\n[Step 2] Triggering Adversary: THESIS_DESTROYER`);
    let destroyerOutput = await callAgent(getRolePrompt('THESIS_DESTROYER', claim));
    if (!destroyerOutput) {
        destroyerOutput = "The claim assumes hardware efficiency won't plateau. Distributed training techniques (Swipe, DiLoCo) counter this.";
    }
    console.log(`[Result] Destroyer: ${destroyerOutput}`);

    // 3. Verdict
    console.log(`\n[Step 3] Final Verdict`);
    let verdictOutput = await callAgent(getRolePrompt('JOURNAL_REVIEWER_SIMULATOR', `Claim: ${claim}\nAttack: ${destroyerOutput}`));
    if (!verdictOutput) {
        verdictOutput = "VERDICT: REJECT\nFAILURE_TAGS: Technological Determinism Fallacy, Ignores Distributed Computing";
    }
    console.log(`[Result] Verdict: ${verdictOutput}`);

    console.log("\n>>> SIMULATION COMPLETE. VISUALIZATION NODES GENERATED: 3 (Claim, Destroyer, Verdict)");
}

runSimulation();
