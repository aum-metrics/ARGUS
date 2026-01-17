
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODELS = {
    VISION: 'gemini-2.0-flash-exp',
    REASONING: 'gemini-2.0-flash-exp',
    FAST: 'gemini-2.0-flash-exp'
};

export interface GenerateOptions {
    prompt: string;
    role?: string;
    images?: string[]; // Base64 strings
    responseMimeType?: string;
}

export async function generateText(prompt: string, options: Partial<GenerateOptions> = {}): Promise<string> {
    const { role = 'DEFAULT', images = [], responseMimeType = "text/plain" } = options;

    // Dynamic Read for Test Runner Compatibility
    const API_KEY = process.env.GEMINI_API_KEY || "";

    if (!API_KEY) {
        throw new Error("Configuration Error: No GEMINI_API_KEY found.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Model Routing Strategy
    let selectedModel = MODELS.FAST;
    const hasImages = Array.isArray(images) && images.length > 0;

    if (hasImages) {
        selectedModel = MODELS.VISION;
    } else {
        const ROLE_TO_MODEL: Record<string, string> = {
            'THESIS_CONSTRUCTOR': MODELS.VISION,
            'THESIS_DESTROYER': MODELS.REASONING,
            'JOURNAL_REVIEWER_SIMULATOR': MODELS.REASONING,
            'SUPPORT_AGENT': MODELS.FAST,
            'DEFAULT': MODELS.FAST
        };
        selectedModel = ROLE_TO_MODEL[role] || MODELS.FAST;
    }

    const model = genAI.getGenerativeModel({
        model: selectedModel,
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        generationConfig: {
            responseMimeType: responseMimeType === "application/json" ? "application/json" : "text/plain"
        }
    });

    const parts: any[] = [{ text: prompt }];

    if (hasImages) {
        images.forEach((base64Image) => {
            // Basic Base64 cleanup
            let data = base64Image;
            let mimeType = "image/png";
            const matches = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
            if (matches && matches.length > 1) {
                mimeType = matches[1];
                data = base64Image.replace(matches[0], "");
            }
            parts.push({ inlineData: { mimeType, data } });
        });
    }

    try {
        const result = await model.generateContent(parts);
        const response = await result.response;
        return response.text();
    } catch (e: any) {
        console.warn("Gemini Generation Error:", e.message);
        throw e;
    }
}
