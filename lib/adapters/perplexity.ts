import { ModelAdapter, ModelResponse } from './types';

export class PerplexityAdapter implements ModelAdapter {
    role = 'perplexity' as const;

    async generate(prompt: string, context?: any): Promise<ModelResponse> {
        const keys = JSON.parse(localStorage.getItem("model_keys") || "{}");
        const apiKey = keys.perplexity;

        if (!apiKey) {
            throw new Error("Missing Perplexity API Key. Please add it in Settings.");
        }

        const response = await fetch('/api/perplexity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, apiKey }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Perplexity API Request Failed");
        }

        const data = await response.json();
        return {
            content: data.content,
            usage: data.usage
        };
    }

    async validate(content: string, criteria: string[]): Promise<{ valid: boolean; issues: string[] }> {
        const validationPrompt = `
        Audit the following text for factual accuracy and citation validity.
        Criteria:
        ${criteria.map(c => `- ${c}`).join('\n')}
        
        Text:
        "${content}"
        
        Return ONLY valid JSON: { "valid": boolean, "issues": string[] }
        `;

        try {
            const res = await this.generate(validationPrompt);
            const jsonStr = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Perplexity Validation failed", e);
            return { valid: false, issues: ["Validation mechanism failed"] };
        }
    }
}
