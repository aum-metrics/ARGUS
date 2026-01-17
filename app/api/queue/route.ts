/**
 * API: Async Job Queue
 * Endpoint: /api/queue
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, payload } = body;

        // Enqueue Job
        const { data, error } = await supabase
            .from('job_queue')
            .insert({
                user_id: user.id,
                type,
                payload,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) throw error;

        // In a real Serverless setup, we would trigger an Edge Function here to *start* processing background.
        // Or simply rely on a Cron/Worker to poll 'PENDING' jobs.
        // For V1.0 MVP on Vercel, we can try to fire-and-forget a fetch to a processing endpoint.
        // fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/queue/process`, { method: 'POST', body: JSON.stringify({ jobId: data.id }) });

        return NextResponse.json({ jobId: data.id, status: 'PENDING' });

    } catch (error: any) {
        console.error("Queue Enqueue Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('id');

        if (!user || !jobId) {
            return NextResponse.json({ error: 'Unauthorized or Missing ID' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('job_queue')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', user.id)
            .single();

        if (error) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
