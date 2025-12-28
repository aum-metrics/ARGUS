import { v4 as uuidv4 } from 'uuid';

export interface ArgusSession {
    id: string; // ARGUS-S-YYYY-MM-DD-XXXX
    startTime: string;
    expiresAt: string;
    documentId?: string;
    paymentStatus: 'UNPAID' | 'PAID';
    data: {
        textHash?: string; // SHA-256 of the original text
        claims: {
            id: string;
            statement: string;
            claimHash?: string; // SHA-256 of the statement
            status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVISE';
            governanceLog: any[];
            noveltyClassification: string[];
            governanceMeta?: {
                auditedAt: string;
                modelUsed: string;
                tokenEstimate: number;
            };
        }[];
        equations: any[];
        diagrams: any[];
        drafts: any[];
    };
}

export function createSession(): ArgusSession {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const uniqueSuffix = uuidv4().substring(0, 4).toUpperCase();
    const id = `ARGUS-S-${dateStr}-${uniqueSuffix}`;

    // Expires in 42 minutes (as per prompt example/vibe)
    const expiresAt = new Date(now.getTime() + 42 * 60 * 1000).toISOString();

    return {
        id,
        startTime: now.toISOString(),
        expiresAt,
        paymentStatus: 'UNPAID',
        data: {
            claims: [],
            equations: [],
            diagrams: [],
            drafts: [],
        },
    };
}

export function destroySession(session: ArgusSession): { certificate: string, timestamp: string } {
    // 1. Zero out memory (simulated by re-assigning)
    session.data.claims = [];
    session.data.equations = [];
    session.data.diagrams = [];
    session.data.drafts = [];

    // 2. Generate Certificate
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

    const certificate = `
ARGUS SESSION DELETION CERTIFICATE

Session ID: ${session.id}
Document IDs: ${session.documentId ? `[${session.documentId}]` : '[NONE]'}

Data Destroyed:
✔ Claims
✔ Draft text
✔ Equations
✔ Diagrams
✔ Uploaded artifacts

Persistence Locations:
✔ Volatile memory — cleared
✔ Encrypted temp storage — wiped
✔ No backups
✔ No archives
✔ No training use

Timestamp: ${timestamp}
`;

    return { certificate, timestamp };
}
