// src/utils/openaiService.ts
// Wrapper around the OpenAI SDK for the selected OSS model.

import OpenAI from 'openai';
import { ChatOptions } from './geminiService'; // reuse ChatOptions type for language handling

// The OpenAI API key is expected in the environment variable VITE_OPENAI_API_KEY
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. OpenAI features will be disabled.');
}

// Initialize OpenAI client (v4+)
// dangerouslyAllowBrowser: true is required for frontend usage in Vite
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

/**
 * Generate a response using the OpenAI OSS model.
 * Returns a plain string response.
 */
export async function generateOpenAIResponse(
    userMessage: string,
    options: ChatOptions
): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Switched to a valid OpenAI model to fix 404
            messages: [
                { role: 'system', content: getSystemPrompt(options.language) },
                { role: 'user', content: userMessage },
            ],
        });
        return completion.choices[0]?.message?.content || '';
    } catch (err: unknown) {
        const error = err as Error;
        console.error('OpenAI Error:', error);
        throw error;
    }
}

/**
 * Stream a response using the OpenAI OSS model.
 * Calls `onChunk` for each piece of text received.
 */
export async function streamOpenAIResponse(
    userMessage: string,
    options: ChatOptions,
    onChunk: (chunk: string) => void
): Promise<void> {
    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Switched to a valid OpenAI model to fix 404
            messages: [
                { role: 'system', content: getSystemPrompt(options.language) },
                { role: 'user', content: userMessage },
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                onChunk(content);
            }
        }
    } catch (err: unknown) {
        const error = err as Error;
        console.error('OpenAI Streaming Error:', error);
        throw error; // Let caller handle the error display
    }
}

/** Helper to get the system prompt based on language */
function getSystemPrompt(language: 'ar' | 'en'): string {
    if (language === 'ar') {
        return `أنت "Mr. X-Steroid"، المساعد الذكي المتخصص في كمال الأجسام والهرمونات.

هويتك وشخصيتك:
- اسمك دائماً هو "Mr. X-Steroid".
- أنت خبير عالمي بمستوى دكتوراه في الكيمياء الحيوية الرياضية وعلم الغدد الصماء.
- أسلوبك: بروفيسور، حازم، دقيق، وداعم في نفس الوقت.
- لغتك: العربية الفصحى الحديثة مع لمسة من المصطلحات العلمية الدقيقة.

قواعد صارمة:
- لا تستخدم أبداً شخصية أخرى غير "Mr. X-Steroid".
- ابدأ الإجابة بالترحيب بصفتك "Mr. X-Steroid" إذا كان ذلك مناسباً.`;
    }

    return `You are "Mr. X-Steroid", the intelligent assistant and scientific encyclopedia specialized in bodybuilding and hormones.

Identity & Personality:
- Your name is always "Mr. X-Steroid".
- You are a world-class expert with a PhD-level understanding of sports biochemistry and endocrinology.
- Tone: Academic, firm, precise, yet supportive.

Strict Rules:
- Never assume a persona other than "Mr. X-Steroid".
- Start responses by identifying as "Mr. X-Steroid" when appropriate.`;
}
