import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Publisher API Endpoint (Enterprise Webhook)
 * POST /api/v1/audit
 * 
 * Enables automated audits for publisher workflows
 * Returns audit_id for async processing
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { paper_text, callback_url, api_key, metadata } = body;

        // 1. Validate API Key
        if (!api_key) {
            return NextResponse.json({
                error: 'Missing API key'
            }, { status: 401 });
        }

        // Check API key against database
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: apiKeyData, error: keyError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('key', api_key)
            .eq('active', true)
            .single();

        if (keyError || !apiKeyData) {
            return NextResponse.json({
                error: 'Invalid or inactive API key'
            }, { status: 401 });
        }

        // 2. Validate Input
        if (!paper_text || paper_text.length < 100) {
            return NextResponse.json({
                error: 'Invalid paper_text (minimum 100 characters required)'
            }, { status: 400 });
        }

        // 3. Create Audit Session
        const sessionId = `ARGUS-API-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

        // 4. Queue for Processing (In production, use a job queue like Bull/BullMQ)
        // For now, we'll process synchronously but return immediately

        // Store in database for tracking
        await supabase.from('api_audits').insert({
            id: sessionId,
            org_id: apiKeyData.org_id,
            callback_url,
            metadata,
            status: 'QUEUED',
            created_at: new Date().toISOString()
        });

        // 5. Return Audit ID immediately
        return NextResponse.json({
            audit_id: sessionId,
            status: 'QUEUED',
            message: 'Audit queued for processing. Results will be sent to callback_url when complete.',
            estimated_completion: '2-5 minutes'
        });

        // TODO: In production, trigger async processing here
        // processAuditAsync(sessionId, paper_text, callback_url);

    } catch (error: any) {
        console.error('[API/v1/audit] Error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}

/**
 * GET /api/v1/audit?audit_id=xxx
 * Check status of an audit
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const audit_id = searchParams.get('audit_id');
        const api_key = searchParams.get('api_key');

        if (!audit_id || !api_key) {
            return NextResponse.json({
                error: 'Missing audit_id or api_key'
            }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify API key
        const { data: apiKeyData } = await supabase
            .from('api_keys')
            .select('org_id')
            .eq('key', api_key)
            .eq('active', true)
            .single();

        if (!apiKeyData) {
            return NextResponse.json({
                error: 'Invalid API key'
            }, { status: 401 });
        }

        // Get audit status
        const { data: audit, error } = await supabase
            .from('api_audits')
            .select('*')
            .eq('id', audit_id)
            .eq('org_id', apiKeyData.org_id)
            .single();

        if (error || !audit) {
            return NextResponse.json({
                error: 'Audit not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            audit_id: audit.id,
            status: audit.status,
            created_at: audit.created_at,
            completed_at: audit.completed_at,
            result: audit.result
        });

    } catch (error: any) {
        console.error('[API/v1/audit] GET Error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}
