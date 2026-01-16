/**
 * Author: Sambath Kumar Natarajan
 */
import { createClient } from '@/lib/supabase/client';

interface MetadataLog {
    field: string;
    failure_mode?: string;
    score: number;
    verdict: 'PUBLISHABLE' | 'REVISE_MAJOR' | 'REJECT';
    org_id?: string;
}

/**
 * Log aggregated metadata for research quality trends
 * NO PII - only scores, fields, and failure modes
 * This builds the "Pulse of Science" data asset
 */
export async function logMetadata(metadata: MetadataLog) {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('metadata_logs')
            .insert({
                field: metadata.field,
                failure_mode: metadata.failure_mode,
                score: metadata.score,
                verdict: metadata.verdict,
                org_id: metadata.org_id || null
            });

        if (error) {
            console.error('[METADATA] Logging failed:', error);
        } else {
            console.log('[METADATA] Logged:', metadata.field, metadata.score);
        }
    } catch (err) {
        console.error('[METADATA] Exception:', err);
        // Non-blocking - don't fail the main flow
    }
}

/**
 * Extract field from context or infer from content
 */
export function inferField(context: any): string {
    // Try to get from context first
    if (context?.field) return context.field;
    if (context?.targetJournal) {
        // Map common journals to fields
        const journalMap: Record<string, string> = {
            'Nature': 'Multidisciplinary Science',
            'Science': 'Multidisciplinary Science',
            'Cell': 'Biology',
            'NEJM': 'Medicine',
            'Lancet': 'Medicine',
            'JAMA': 'Medicine',
            'ICLR': 'Computer Science',
            'NeurIPS': 'Computer Science',
            'ICML': 'Computer Science',
            'CVPR': 'Computer Science',
        };
        return journalMap[context.targetJournal] || 'General';
    }
    return 'General';
}

/**
 * Extract primary failure mode from action items
 */
export function extractFailureMode(actionItems: any[]): string | undefined {
    if (!actionItems || actionItems.length === 0) return undefined;

    // Get the highest priority item's layer
    const highPriorityItem = actionItems.find(item => item.priority === 'HIGH');
    return highPriorityItem?.layer || actionItems[0]?.layer;
}
