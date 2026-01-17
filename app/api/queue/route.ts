import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// FREE TIER LIMITS
const MAX_CONCURRENT_USERS = 5; // Very conservative to ensure speed
const SLOT_TIMEOUT_SECONDS = 300; // 5 Minutes auto-expiry

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, ticketId, userId } = body;

        // Admin Client for System Operations
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. CLEANUP ZOMBIES (Lazy Collection)
        // Delete any tickets older than 10 mins (Safety net)
        await supabase
            .from('system_semaphores')
            .delete()
            .lt('updated_at', new Date(Date.now() - (SLOT_TIMEOUT_SECONDS * 1000)).toISOString());


        if (action === 'RESERVE') {
            // Check count
            const { count } = await supabase
                .from('system_semaphores')
                .select('*', { count: 'exact', head: true });

            const currentLoad = count || 0;

            if (currentLoad >= MAX_CONCURRENT_USERS) {
                return NextResponse.json({
                    status: 'BUSY',
                    message: `System at capacity (${currentLoad}/${MAX_CONCURRENT_USERS}). Please retrying...`,
                    queuePosition: currentLoad - MAX_CONCURRENT_USERS + 1
                }, { status: 429 });
            }

            // Grant Ticket
            const newTicketId = crypto.randomUUID();
            const { error } = await supabase.from('system_semaphores').insert({
                key: newTicketId, // Using key column as Ticket ID for this generic table
                current_count: 1, // Dummy value
                max_count: 1, // Dummy value
                updated_at: new Date().toISOString()
            });

            if (error) throw error;

            return NextResponse.json({ status: 'GRANTED', ticketId: newTicketId });
        }

        if (action === 'RELEASE' && ticketId) {
            await supabase.from('system_semaphores').delete().eq('key', ticketId);
            return NextResponse.json({ status: 'RELEASED' });
        }

        if (action === 'HEARTBEAT' && ticketId) {
            await supabase
                .from('system_semaphores')
                .update({ updated_at: new Date().toISOString() })
                .eq('key', ticketId);
            return NextResponse.json({ status: 'ALIVE' });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (error: any) {
        console.error("Queue Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
