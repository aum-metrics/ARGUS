/**
 * API: Save Audit Session (Encrypted Persistence)
 * Endpoint: /api/session/save
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.SESSION_ENCRYPTION_KEY || '00000000000000000000000000000000'; // Must be 32 chars
const ALGORITHM = 'aes-256-gcm';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { sessionId, state, metadata } = body;

        // 1. Serialize State
        const jsonState = JSON.stringify(state);

        // 2. Encrypt (Server-Side)
        // Ideally, we'd use a per-user key, but for V1.0 a master key valid for 24h is acceptable.
        const iv = randomBytes(16);
        const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

        let encrypted = cipher.update(jsonState, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        // 3. Store in Supabase
        const { error } = await supabase
            .from('audit_sessions')
            .upsert({
                session_id: sessionId,
                user_id: user.id,
                encrypted_blob: `${encrypted}:${authTag}`, // Store tag with blob
                encryption_iv: iv.toString('hex'),
                file_name: metadata?.fileName || 'Unknown.pdf',
                claim_count: metadata?.claimCount || 0,
                status: 'IN_PROGRESS',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // +24h
            });

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Session Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
