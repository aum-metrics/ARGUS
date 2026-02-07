
const testCases = [
    {
        name: "Standard Markdown",
        input: "```json\n[{\"id\":1}]\n```"
    },
    {
        name: "Plain JSON",
        input: "[{\"id\":1}]"
    },
    {
        name: "Intro Text",
        input: "Here is the output: [{\"id\":1}]"
    },
    {
        name: "Uppercase JSON",
        input: "```JSON\n[{\"id\":1}]\n```"
    },
    {
        name: "Brackets in Preamble",
        input: "Based on the [input], here is the result: [{\"id\":1}]"
    },
    {
        name: "Trailing Text",
        input: "[{\"id\":1}] I hope this helps."
    },
    {
        name: "Multiple Arrays",
        input: "Examples: [1,2], Result: [{\"id\":1}]"
    },
    {
        name: "Unescaped Newlines",
        input: "[{\"id\":1, \"statement\": \"Line 1\nLine 2\"}]"
    },
    {
        name: "Unescaped Quotes (THE KILLER)",
        input: `[ { "id": "C1", "statement": "CLAIM: "The Earth is round"", "evidenceIndices": [] } ]`
    }
];

function smartParse(text: string) {
    console.log(`\n--- Test: ${text.substring(0, 50).replace(/\n/g, "\\n")}... ---`);

    // 1. Tidy Markdown
    let cleanText = text;
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/i;
    const match = text.match(codeBlockRegex);
    if (match) {
        cleanText = match[1];
    }

    let claims: any[] = [];

    // 2. Smart JSON Extraction (Bracket Aware)
    let startIndex = cleanText.indexOf('[');
    if (startIndex !== -1) {
        let cursor = startIndex;
        let attempts = 0;

        while (cursor !== -1 && attempts < 5 && claims.length === 0) {
            let balance = 0;
            let endIndex = -1;
            let insideString = false;
            let escape = false;

            for (let i = cursor; i < cleanText.length; i++) {
                const char = cleanText[i];

                if (escape) {
                    escape = false;
                    continue;
                }
                if (char === '\\') {
                    escape = true;
                    continue;
                }
                if (char === '"') {
                    insideString = !insideString;
                    continue;
                }

                if (!insideString) {
                    if (char === '[') balance++;
                    if (char === ']') {
                        balance--;
                        if (balance === 0) {
                            endIndex = i;
                            break;
                        }
                    }
                }
            }

            if (endIndex !== -1) {
                const candidate = cleanText.substring(cursor, endIndex + 1);
                try {
                    const parsed = JSON.parse(candidate);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        claims = parsed;
                        console.log("SUCCESS (Bracket):", JSON.stringify(claims));
                        return;
                    }
                } catch (e) {
                    try {
                        const fixed = candidate.replace(/\n/g, "\\n");
                        const parsedFixed = JSON.parse(fixed);
                        if (Array.isArray(parsedFixed) && parsedFixed.length > 0) {
                            claims = parsedFixed;
                            console.log("SUCCESS (Bracket+Newline):", JSON.stringify(claims));
                            return;
                        }
                    } catch (e2) { }
                }
            }

            if (claims.length === 0) {
                cursor = cleanText.indexOf('[', cursor + 1);
                attempts++;
            }
        }
    }

    // 3. Regex Fallback (The Savior for Bad Quotes)
    if (claims.length === 0) {
        console.log("Trying Regex Fallback...");
        // Match objects: { "id": "...", "statement": "...", "evidenceIndices": [...] }
        // We assume "id" is first, "statement" is second, "evidenceIndices" is third.
        // But order might vary.
        // Let's try capturing the content of statement carefully.
        // Look for: "statement": " <CAPTURE> ", "evidenceIndices"
        // This relies on the key "evidenceIndices" following statement.

        const regex = /"id"\s*:\s*"([^"]+)"[\s\S]*?"statement"\s*:\s*"([\s\S]*?)"\s*,\s*"evidenceIndices"\s*:\s*\[(.*?)\]/g;
        let match;

        while ((match = regex.exec(cleanText)) !== null) {
            const id = match[1];
            let statement = match[2];
            const evidenceRaw = match[3]; // e.g. "1, 2" or ""

            // Cleanup statement: if it has unescaped quotes, we just leave them?
            // Actually, the regex capture might stop early if it sees `", "evidenceIndices"`.
            // If the model outputs `... "statement": "He said "foo"", "evidenceIndices": ...`
            // The regex `"([\s\S]*?)"\s*,\s*"evidenceIndices"`
            // uses non-greedy `*?`. It will stop at the FIRST `", "evidenceIndices"`.
            // So if `statement` contains that exact string, we fail. But unlikely.
            // If `statement` contains `"`, it's fine because we match UNTIL `", "evidenceIndices"`.

            // Parse evidence indices
            let evidenceIndices: number[] = [];
            if (evidenceRaw.trim()) {
                evidenceIndices = evidenceRaw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            }

            claims.push({ id, statement, evidenceIndices });
        }

        if (claims.length > 0) {
            console.log("SUCCESS (Regex):", JSON.stringify(claims));
            return;
        }
    }

    console.log("FAILED: Could not parse.");
}

testCases.forEach(tc => {
    console.log(`\n[${tc.name}]`);
    smartParse(tc.input);
});
