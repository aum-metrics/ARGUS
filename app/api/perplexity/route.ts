import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt, apiKey } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 401 });
        }

        // Perplexity uses an OpenAI-compatible interface usually, but we use raw fetch to be explicit.
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sonar-reasoning',
                messages: [
                    { role: 'system', content: 'You are an academic researcher.' },
                    { role: 'user', content: prompt }
                ],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Perplexity API Error: ${err}`);
        }

        const data = await response.json();

        return NextResponse.json({
            content: data.choices[0].message.content,
            usage: data.usage,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
