/**
 * Citation Validator Agent
 * Author: Sambath Kumar Natarajan
 * 
 * Purpose: Validate AI critiques against real academic literature
 * Strategy: Use Semantic Scholar API to verify cited papers exist and match claims
 */

interface CitationCheck {
    citedPaper: string;
    exists: boolean;
    relevanceScore: number; // 0-100
    abstractSnippet?: string;
}

interface ValidationResult {
    confidenceScore: number; // 0-100
    checks: CitationCheck[];
    warnings: string[];
}

/**
 * Extract potential citations from critique text
 * Looks for patterns like "Smith et al. (2020)" or "Nature 2019"
 */
function extractCitations(text: string): string[] {
    const patterns = [
        /([A-Z][a-z]+\s+et\s+al\.\s*\(\d{4}\))/g, // "Smith et al. (2020)"
        /([A-Z][a-z]+\s+and\s+[A-Z][a-z]+\s*\(\d{4}\))/g, // "Smith and Jones (2020)"
        /([A-Z][a-z]+\s*\(\d{4}\))/g, // "Smith (2020)"
    ];

    const citations: string[] = [];
    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) citations.push(...matches);
    });

    return [...new Set(citations)]; // Remove duplicates
}

/**
 * Query Semantic Scholar API to verify paper exists
 * Free tier: 100 requests/5 minutes (reasonable for our use case)
 */
async function verifyPaperExists(citation: string): Promise<CitationCheck> {
    try {
        // Clean citation for search
        const query = encodeURIComponent(citation.replace(/[()]/g, ''));

        const response = await fetch(
            `https://api.semanticscholar.org/graph/v1/paper/search?query=${query}&limit=1&fields=title,abstract,year`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return {
                citedPaper: citation,
                exists: false,
                relevanceScore: 0
            };
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const paper = data.data[0];

            // Simple relevance check: does citation year match paper year?
            const citationYear = citation.match(/\d{4}/)?.[0];
            const yearMatch = citationYear === paper.year?.toString();

            return {
                citedPaper: citation,
                exists: true,
                relevanceScore: yearMatch ? 90 : 60, // High if year matches, medium otherwise
                abstractSnippet: paper.abstract?.substring(0, 200)
            };
        }

        return {
            citedPaper: citation,
            exists: false,
            relevanceScore: 0
        };

    } catch (error) {
        console.error('Semantic Scholar API error:', error);
        return {
            citedPaper: citation,
            exists: false,
            relevanceScore: 0
        };
    }
}

/**
 * Main validation function
 * Returns confidence score (0-100) based on citation verification
 */
export async function validateCritique(critiqueText: string): Promise<ValidationResult> {
    const citations = extractCitations(critiqueText);

    // If no citations found, assume it's a general critique (not necessarily bad)
    if (citations.length === 0) {
        return {
            confidenceScore: 85, // Neutral confidence for citation-free critiques
            checks: [],
            warnings: ['No specific citations found in critique']
        };
    }

    // Verify each citation
    const checks = await Promise.all(
        citations.map(citation => verifyPaperExists(citation))
    );

    // Calculate confidence score
    const verifiedCount = checks.filter(c => c.exists).length;
    const avgRelevance = checks.reduce((sum, c) => sum + c.relevanceScore, 0) / checks.length;

    // Confidence formula: 
    // - 100% if all citations verified and highly relevant
    // - Decreases proportionally with unverified citations
    const verificationRate = verifiedCount / citations.length;
    const confidenceScore = Math.round(verificationRate * avgRelevance);

    // Generate warnings
    const warnings: string[] = [];
    const unverified = checks.filter(c => !c.exists);

    if (unverified.length > 0) {
        warnings.push(
            `${unverified.length} citation(s) could not be verified: ${unverified.map(c => c.citedPaper).join(', ')}`
        );
    }

    if (confidenceScore < 70) {
        warnings.push('Low confidence score - critique may contain fabricated references');
    }

    return {
        confidenceScore,
        checks,
        warnings
    };
}

/**
 * Batch validation for multiple critiques
 * Useful for validating all critiques in a governance loop
 */
export async function validateMultipleCritiques(
    critiques: Array<{ id: string; text: string }>
): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    // Process sequentially to avoid rate limiting
    for (const critique of critiques) {
        const result = await validateCritique(critique.text);
        results.set(critique.id, result);

        // Small delay to respect API rate limits (100 req/5min = ~1 req/3sec)
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return results;
}
