/**
 * Author: Sambath Kumar Natarajan
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Public Stats API - Powers Live Ticker
 * Returns anonymized audit events from metadata_logs
 * NO authentication required (public data)
 */
export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch last 20 audits from metadata_logs
        const { data, error } = await supabase
            .from('metadata_logs')
            .select('field, failure_mode, score, verdict')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('[API/public-stats] Query error:', error);
            return NextResponse.json({ events: [] });
        }

        // Transform to ticker format
        const events = (data || []).map(log => ({
            type: log.verdict === 'PUBLISHABLE' ? 'ACCEPTED' : 'REJECTED',
            field: log.field.toUpperCase(),
            reason: log.failure_mode || 'Verified Robust',
            score: log.score
        }));

        return NextResponse.json({ events });

    } catch (error: any) {
        console.error('[API/public-stats] Error:', error);
        return NextResponse.json({ events: [] });
    }
}
