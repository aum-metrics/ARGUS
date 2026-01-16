/**
 * Author: Sambath Kumar Natarajan
 */
import { PhaseId, CONSTITUTION } from './constitution';
import { ModelOutput } from './stateMachine';
import { ModelAdapter } from '@/lib/adapters/types';

/**
 * Internal Completeness Test (ICT)
 * Production implementation using LLM validation
 */
export async function runICT(
    phase: PhaseId,
    output: ModelOutput,
    adapter: ModelAdapter
): Promise<{ passed: boolean; issues: string[] }> {
    const criteria = [
        `Does the output satisfy the mandate of ${phase}?`,
        "Is the output theoretically self-consistent?",
        "Are all required sections present?",
    ];

    try {
        const result = await adapter.validate(output.content, criteria);

        if (!result.valid) {
            return { passed: false, issues: result.issues };
        }

        return { passed: true, issues: [] };
    } catch (error) {
        console.error('[ICT] Validation error:', error);
        return { passed: false, issues: ['Validation service unavailable'] };
    }
}

/**
 * Cross-Model Challenge (CMC)
 * Production implementation with structured critique parsing
 */
export async function runCMC(
    phase: PhaseId,
    primaryOutput: ModelOutput,
    challengerAdapter: ModelAdapter
): Promise<{ passed: boolean; critique: string }> {
    try {
        const prompt = `
You are the ${challengerAdapter.role} (${CONSTITUTION.roles[challengerAdapter.role].title}).
Critique the following output from ${primaryOutput.model} for Phase ${phase}:

${primaryOutput.content}

Audit for:
${CONSTITUTION.roles[challengerAdapter.role].responsibilities.join('
')}

Provide your critique in the following format:
VERDICT: [PASS/FAIL]
CRITIQUE: [Your detailed critique]
`;

        const response = await challengerAdapter.generate(prompt);

        // Parse structured response
        const verdictMatch = response.content.match(/VERDICT:\s*(PASS|FAIL)/i);
        const passed = verdictMatch ? verdictMatch[1].toUpperCase() === 'PASS' : false;

        return { passed, critique: response.content };
    } catch (error) {
        console.error('[CMC] Challenge error:', error);
        return { passed: false, critique: 'Challenge service unavailable' };
    }
}

/**
 * Journal Conformity Check (JCC)
 * Production implementation checking format, tone, citations
 */
export async function runJCC(
    output: ModelOutput,
    journalConstraints: Record<string, any>
): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
        // Check word count if specified
        if (journalConstraints.maxWords) {
            const wordCount = output.content.split(/\s+/).length;
            if (wordCount > journalConstraints.maxWords) {
                issues.push(`Exceeds word limit: ${wordCount}/${journalConstraints.maxWords}`);
            }
        }

        // Check citation density
        if (journalConstraints.minCitations) {
            const citationCount = (output.content.match(/\[\d+\]/g) || []).length;
            if (citationCount < journalConstraints.minCitations) {
                issues.push(`Insufficient citations: ${citationCount}/${journalConstraints.minCitations}`);
            }
        }

        // Check required sections
        if (journalConstraints.requiredSections) {
            for (const section of journalConstraints.requiredSections) {
                if (!output.content.toLowerCase().includes(section.toLowerCase())) {
                    issues.push(`Missing required section: ${section}`);
                }
            }
        }

        return { passed: issues.length === 0, issues };
    } catch (error) {
        console.error('[JCC] Conformity check error:', error);
        return { passed: false, issues: ['Conformity check service unavailable'] };
    }
}
