export type GovernanceRole =
    | 'THESIS_CONSTRUCTOR'
    | 'THESIS_DESTROYER'
    | 'METHODOLOGY_PROSECUTOR'
    | 'LITERATURE_ADVERSARY'
    | 'FORMALISM_AUDITOR'
    | 'JOURNAL_REVIEWER_SIMULATOR';

export interface GovernanceStep {
    role: GovernanceRole;
    status: 'PENDING' | 'PASSED' | 'FAILED' | 'SKIPPED';
    output: string; // The critique or approval text
    timestamp: string;
}

export interface Claim {
    id: string;
    statement: string;
    assumptions: string[];
    evidence: string[];
    status: 'PROPOSED' | 'ACCEPTED' | 'REVISION_NEEDED' | 'REJECTED' | 'STUCK_LOOP';
    noveltyClassification?: string[]; // e.g. ["Trivial extension"]
    revisionPath?: string; // "Potential Revision Path — Not Validated: ..."
    governanceLog: GovernanceStep[];
}

export interface GovernanceMatrix {
    claims: Claim[];
    globalStatus: 'ACTIVE' | 'TERMINATED_SUCCESS' | 'TERMINATED_FAILURE';
}
