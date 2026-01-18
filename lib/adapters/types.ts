/**
 * Author: Sambath Kumar Natarajan
 */

export type ModelRole = 'chatgpt' | 'perplexity' | 'gemini';

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
