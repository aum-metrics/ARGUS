/**
 * Author: Sambath Kumar Natarajan
 */
import { ModelRole } from '@/orchestrator/constitution';

export interface ModelResponse {
    content: string;
    metadata?: Record<string, any>;
    usage?: {
        tokens: number;
        cost?: number;
    };
}

export interface ModelAdapter {
    role: ModelRole;
    generate(prompt: string, context?: any): Promise<ModelResponse>;
    validate(content: string, criteria: string[]): Promise<{ valid: boolean; issues: string[] }>;
}
