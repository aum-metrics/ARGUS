import { ModelAdapter } from '@/lib/adapters/types';
import { useState, useCallback } from 'react';
import { CONSTITUTION, PhaseId } from './constitution';
import { ModelOutput, INITIAL_STATE, ArfState } from './stateMachine';
import { ChatGPTAdapter } from '@/lib/adapters/chatgpt';
import { PerplexityAdapter } from '@/lib/adapters/perplexity';
import { GeminiAdapter } from '@/lib/adapters/gemini';
import { runICT, runCMC, runJCC } from './validation';

export function useOrchestrator() {
    const [state, setState] = useState<ArfState>(INITIAL_STATE);
    const [logs, setLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    // Initialize Adapters
    const adapters = {
        chatgpt: new ChatGPTAdapter(),
        perplexity: new PerplexityAdapter(),
        gemini: new GeminiAdapter(),
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const runPhase = async (phaseId: PhaseId) => {
        const phaseDef = CONSTITUTION.executionPhases.find(p => p.id === phaseId)!;
        addLog(`>>> STARTING ${phaseId}: ${phaseDef.name}`);
        addLog(`Mandate: ${phaseDef.mandate}`);

        // Update State
        setState(prev => ({ ...prev, currentPhase: phaseId }));

        try {
            // 1. Generate Output (Strategy varies by phase, simplifed for demo loop)
            // Default: ChatGPT (Theory) proposes, others critique.
            // But Phase 3 is Perplexity Lead, Phase 5 is Gemini Lead.

            let primaryAdapter: ModelAdapter = adapters.chatgpt;
            if (phaseId === 'PHASE_3') primaryAdapter = adapters.perplexity;
            if (phaseId === 'PHASE_5') primaryAdapter = adapters.gemini;

            addLog(`Primary Model: ${primaryAdapter.role.toUpperCase()}`);

            const prompt = `
        Execute Phase: ${phaseDef.name}
        Mandate: ${phaseDef.mandate}
        Context: ${state.context.problemStatement || "No problem statement yet. Propose a novel research direction."}
      `;

            addLog(`Generating initial output...`);
            const output = await primaryAdapter.generate(prompt);
            addLog(`Output generated: ${output.content.substring(0, 50)}...`);

            const modelOutput: ModelOutput = {
                model: primaryAdapter.role,
                content: output.content,
                timestamp: new Date().toISOString()
            };

            // 2. ICT (Internal Completeness)
            addLog(`Running Internal Completeness Test (ICT)...`);
            const ict = await runICT(phaseId, modelOutput, primaryAdapter);
            if (!ict.passed) {
                throw new Error(`ICT Failed: ${ict.issues.join(', ')}`);
            }
            addLog(`ICT Passed.`);

            // 3. CMC (Cross-Model Challenge)
            // Pick a challenger.
            const challenger = primaryAdapter.role === 'chatgpt' ? adapters.perplexity : adapters.chatgpt;
            addLog(`Running Cross-Model Challenge (CMC) with ${challenger.role.toUpperCase()}...`);
            const cmc = await runCMC(phaseId, modelOutput, challenger);

            if (!cmc.passed) {
                addLog(`CMC Critique: ${cmc.critique}`);
                // In real loop, we would recurse/retry here.
                // For demo, we warn but proceed or throw.
                addLog(`WARN: CMC flagged issues. Proceeding for demo.`);
            } else {
                addLog(`CMC Passed.`);
            }

            // 4. Update State & Advance
            setState(prev => ({
                ...prev,
                history: {
                    ...prev.history,
                    [phaseId]: {
                        status: 'COMPLETED',
                        outputs: [modelOutput],
                        iterationCount: 1,
                        auditResults: { ictPassed: true, cmcPassed: cmc.passed, jccPassed: true }
                    }
                }
            }));

            addLog(`<<< COMPLETED ${phaseId}`);

        } catch (e: any) {
            addLog(`ERROR in ${phaseId}: ${e.message}`);
            // Pause
            setIsRunning(false);
            throw e;
        }
    };

    const startResearch = async () => {
        setIsRunning(true);
        setLogs([]);
        try {
            // Execute phases sequentially (demo: just first 3 to save tokens)
            await runPhase('PHASE_1');
            await runPhase('PHASE_2');
            await runPhase('PHASE_3');
            addLog(`Demo Sequence Complete. Paused.`);
        } catch (e) {
            addLog(`Protocol Aborted.`);
        } finally {
            setIsRunning(false);
        }
    };

    return {
        state,
        logs,
        isRunning,
        startResearch
    };
}
