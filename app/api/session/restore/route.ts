/**
 * API: Restore Audit Session
 * Endpoint: /api/session/restore
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = process.env.SESSION_ENCRYPTION_KEY || '00000000000000000000000000000000';
const ALGORITHM = 'aes-256-gcm';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { sessionId } = body;

        // 1. Fetch Encrypted Blob
        const { data: session, error } = await supabase
            .from('audit_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (error || !session) {
            return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
        }

        // 2. Decrypt
        // Blob format: "encryptedData:authTag"
        const [encryptedData, authTagHex] = session.encrypted_blob.split(':');

        const decipher = createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY),
            Buffer.from(session.encryption_iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // 3. Return State
        return NextResponse.json({
            state: JSON.parse(decrypted),
            metadata: {
                fileName: session.file_name,
                createdAt: session.created_at
            }
        });

    } catch (error: any) {
        console.error("Session Restore Error:", error);
        return NextResponse.json({ error: "Failed to restore session. Data integrity check failed." }, { status: 500 });
    }
}
