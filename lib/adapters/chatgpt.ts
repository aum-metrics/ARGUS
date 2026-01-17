/**
 * Author: Sambath Kumar Natarajan
 */
import { ModelAdapter, ModelResponse } from './types';

export class ChatGPTAdapter implements ModelAdapter {
    role = 'chatgpt' as const;

    async generate(prompt: string, context?: any): Promise<ModelResponse> {
        // Client does not need to know the Key. Authentication is handled by Session/Env on server.
        const response = await fetch('/api/chatgpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "ChatGPT API Validation Failed");
        }

        const data = await response.json();
        return {
            content: data.content,
            usage: data.usage
        };
    }

    async validate(content: string, criteria: string[]): Promise<{ valid: boolean; issues: string[] }> {
        const validationPrompt = `
        Validate the following content against these criteria:
        ${criteria.map(c => `- ${c}`).join('\n')}
        
        Content:
        "${content}"
        
        Return ONLY valid JSON in this format: { "valid": boolean, "issues": string[] }
        `;

        try {
            const res = await this.generate(validationPrompt);
            const jsonStr = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Validation failed", e);
            return { valid: false, issues: ["Validation process failed due to model error."] };
        }
    }
}
