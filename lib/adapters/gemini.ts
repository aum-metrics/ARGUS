/**
 * Author: Sambath Kumar Natarajan
 */
import { ModelAdapter, ModelResponse } from './types';

export class GeminiAdapter implements ModelAdapter {
    role = 'gemini' as const;

    async generate(prompt: string, context?: any): Promise<ModelResponse> {
        // Client does not need to know the Key. Authentication is handled by Session/Env on server.
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Gemini API Request Failed");
        }

        const data = await response.json();
        return {
            content: data.content,
        };
    }

    async validate(content: string, criteria: string[]): Promise<{ valid: boolean; issues: string[] }> {
        const validationPrompt = `
        As the Formal Adjudicator, check the following content against these rules:
        ${criteria.map(c => `- ${c}`).join('
')}
        
        Content:
        "${content}"
        
        Return ONLY valid JSON: { "valid": boolean, "issues": string[] }
        `;
        try {
            const res = await this.generate(validationPrompt);
            const jsonStr = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Gemini Validation failed", e);
            return { valid: false, issues: ["Validation mechanism failed"] };
        }
    }
}
