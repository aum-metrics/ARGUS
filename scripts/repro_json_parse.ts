
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
        name: "Brackets in Preamble (THE SUSPECT)",
        input: "Based on the [input], here is the result: [{\"id\":1}]"
    },
    {
        name: "Trailing Text",
        input: "[{\"id\":1}] I hope this helps."
    },
    {
        name: "Multiple Arrays (Should take last largest or first largest?)",
        // Ideally we want the one that looks like a claim list.
        // But for now, let's just try to find *valid* JSON.
        input: "Examples: [1,2], Result: [{\"id\":1}]"
    },
    {
        name: "Unescaped Newlines (Common Gemini Issue)",
        input: "[{\"id\":1, \"text\": \"Line 1\nLine 2\"}]"
    }
];

function smartParse(text: string) {
    console.log(`\n--- Test: ${text.substring(0, 50).replace(/\n/g, "\\n")}... ---`);

    // 1. Tidy Markdown (Preserve existing logic roughly)
    // Strip code blocks fully if present
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/i;
    const match = text.match(codeBlockRegex);
    if (match) {
        text = match[1];
        console.log("Markdown Strip:", text.substring(0, 50));
    }

    // 2. Find JSON Array candidate
    // Strategy: Look for substrings starting with '[' and ending with ']'
    // But doing this for nested arrays is hard with regex.
    // Simple robust approach: 
    // Find first '['. 
    // Track balance of brackets to find corresponding closing ']'.

    let startIndex = text.indexOf('[');
    if (startIndex === -1) {
        console.log("FAILED: No '[' found");
        return;
    }

    // We might have multiple arrays. Let's try to parse from the FIRST '['.
    // If that fails (e.g. it's just "[note]"), we continue to the next '['.

    let attempts = 0;
    let cursor = startIndex;

    while (cursor !== -1 && attempts < 5) {
        console.log(`Attempt ${attempts + 1} at index ${cursor}`);

        // Find matching closing bracket with balance check
        let balance = 0;
        let endIndex = -1;
        let insideString = false;
        let escape = false;

        for (let i = cursor; i < text.length; i++) {
            const char = text[i];

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
            const candidate = text.substring(cursor, endIndex + 1);
            try {
                // Try parsing
                const result = JSON.parse(candidate);
                console.log("SUCCESS:", JSON.stringify(result));
                return; // Found it!
            } catch (e) {
                console.log("Parse failed for candidate starting at", cursor, ":", candidate.substring(0, 20), "Error:", (e as any).message);

                // Special handling for newlines?
                try {
                    const fixed = candidate.replace(/\n/g, "\\n");
                    const result = JSON.parse(fixed);
                    console.log("SUCCESS (with newline fix):", JSON.stringify(result));
                    return;
                } catch (e2) { }
            }
        }

        // Find next '['
        cursor = text.indexOf('[', cursor + 1);
        attempts++;
    }

    console.log("FAILED: Could not find valid JSON array");
}

testCases.forEach(tc => {
    console.log(`\n[${tc.name}]`);
    smartParse(tc.input);
});
