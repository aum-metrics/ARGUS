/**
 * Author: Sambath Kumar Natarajan
 */
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    try {
        const { prompt, system } = await req.json();

        // Server-Side Key Management
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                error: 'Server Misconfiguration: OPENAI_API_KEY not found in environment variables.'
            }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: system || 'You are helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            model: 'gpt-4o',
        });

        return NextResponse.json({
            content: completion.choices[0].message.content,
            usage: completion.usage,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
