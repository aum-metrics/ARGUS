import { CONSTITUTION, PhaseId } from './constitution';

export interface ModelOutput {
    model: 'chatgpt' | 'perplexity' | 'gemini';
    content: string;
    timestamp: string;
    verdict?: 'APPROVE' | 'REJECT';
    critique?: string;
}

export interface PhaseState {
    status: 'IDLE' | 'GENERATING' | 'AUDITING' | 'COMPLETED' | 'FAILED';
    outputs: ModelOutput[];
    iterationCount: number;
    auditResults?: {
        ictPassed: boolean; // Internal Completeness Test
        cmcPassed: boolean; // Cross-Model Challenge
        jccPassed: boolean; // Journal Conformity Check
        reasons?: string[];
    };
}

export interface ArfState {
    currentPhase: PhaseId;
    history: Record<PhaseId, PhaseState>;
    journalProfile?: {
        name: string;
        constraints: Record<string, any>;
    };
    context: {
        problemStatement: string;
        selectedFraming?: string;
        noveltyScore?: number;
        theoryFramework?: string;
        methodology?: string;
    };
}

export const INITIAL_STATE: ArfState = {
    currentPhase: 'PHASE_1',
    history: CONSTITUTION.executionPhases.reduce((acc, phase) => {
        acc[phase.id] = {
            status: 'IDLE',
            outputs: [],
            iterationCount: 0,
        };
        return acc;
    }, {} as Record<PhaseId, PhaseState>),
    context: {
        problemStatement: "",
    },
};
