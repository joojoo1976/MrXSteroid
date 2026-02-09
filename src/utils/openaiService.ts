// src/utils/openaiService.ts
// Wrapper around the OpenAI SDK for the selected OSS model.

import OpenAI from 'openai';
import { ChatOptions, ChatMessage } from './geminiService'; // reuse ChatOptions type for language handling
import { compactHistory } from './contextOptimization';
import { initializeGemini } from './geminiService';

import { env } from '../config/env';

// The OpenAI API key is expected in the environment variable VITE_OPENAI_API_KEY
const OPENAI_API_KEY = env.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. OpenAI features will be disabled.');
}

// Initialize OpenAI client (v4+)
// dangerouslyAllowBrowser: true is required for frontend usage in Vite
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

import { getOpenAITools, executeToolCall } from './aiToolsAdapter';

/**
 * Generate a response using the OpenAI model.
 */
export async function generateOpenAIResponse(
    userMessage: string,
    options: ChatOptions
): Promise<string> {
    try {
        const history = options.history || [];
        const compactedHistory = await compactHistory(
            history,
            (h) => summarizeHistory(h, options.language),
            { maxTokens: 16000, compactionThreshold: 0.8, isRTL: options.language === 'ar' }
        );

        let systemPrompt = getSystemPrompt(options.language);
        if (options.userId) {
            systemPrompt += `\n\n[SYSTEM DATA]\nUser ID: ${options.userId}`;
        }

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...compactedHistory.map(msg => ({
                role: (msg.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
                content: msg.parts
            })),
            { role: 'user', content: userMessage },
        ];

        let loopCount = 0;
        const MAX_LOOPS = 5;

        while (loopCount < MAX_LOOPS) {
            loopCount++;
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                tools: getOpenAITools(),
                tool_choice: 'auto'
            });

            const message = completion.choices[0]?.message;
            if (!message) return '';

            // If no tool calls, return text
            if (!message.tool_calls || message.tool_calls.length === 0) {
                return message.content || '';
            }

            // Handle tool calls
            const assistantMessage = { ...message, role: 'assistant' };
            messages.push(assistantMessage as any);

            for (const toolCall of message.tool_calls) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const tc = toolCall as any;
                const args = JSON.parse(tc.function.arguments);
                const result = await executeToolCall(tc.function.name, args);

                messages.push({
                    role: 'tool',
                    tool_call_id: tc.id,
                    content: JSON.stringify(result)
                });
            }

            // Loop continues to generate response based on tool results
        }

        return "Error: Maximum conversational depth exceeded.";

    } catch (err: unknown) {
        const error = err as Error;
        console.error('OpenAI Error:', error);
        throw error;
    }
}


/**
 * Stream a response using the OpenAI model.
 */
export async function streamOpenAIResponse(
    userMessage: string,
    options: ChatOptions,
    onChunk: (chunk: string) => void
): Promise<void> {
    try {
        const history = options.history || [];
        const compactedHistory = await compactHistory(
            history,
            (h) => summarizeHistory(h, options.language),
            { maxTokens: 16000, compactionThreshold: 0.8, isRTL: options.language === 'ar' }
        );

        let systemPrompt = getSystemPrompt(options.language);
        if (options.userId) {
            systemPrompt += `\n\n[SYSTEM DATA]\nUser ID: ${options.userId}`;
        }

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...compactedHistory.map(msg => ({
                role: (msg.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
                content: msg.parts
            })),
            { role: 'user', content: userMessage },
        ];

        // Streaming loop wrapper
        const runStream = async (currentMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) => {
            const stream = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: currentMessages,
                stream: true,
                tools: getOpenAITools(),
                tool_choice: 'auto'
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const toolCalls: any[] = [];
            let currentContent = '';

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta;

                // Accumulate content
                if (delta?.content) {
                    currentContent += delta.content;
                    onChunk(delta.content);
                }

                // Accumulate tool calls
                if (delta?.tool_calls) {
                    for (const tc of delta.tool_calls) {
                        const index = tc.index;
                        if (!toolCalls[index]) {
                            toolCalls[index] = { id: tc.id || '', type: tc.type, function: { name: tc.function?.name || '', arguments: '' } };
                        }
                        if (tc.id) toolCalls[index].id = tc.id;
                        if (tc.function?.name) toolCalls[index].function.name = tc.function.name;
                        if (tc.function?.arguments) toolCalls[index].function.arguments += tc.function.arguments;
                    }
                }
            }

            // If we had tool calls, execute them and recurse
            if (toolCalls.length > 0) {
                // Determine if we need to append the assistant message first
                // If content was streamed, we normally append it. But if tool calls happen, content might be null or explanation.
                const assistantMsg = {
                    role: 'assistant',
                    content: currentContent || null,
                    tool_calls: toolCalls
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                currentMessages.push(assistantMsg as any);

                for (const tc of toolCalls) {
                    try {
                        const args = JSON.parse(tc.function.arguments);
                        const result = await executeToolCall(tc.function.name, args);
                        currentMessages.push({
                            role: 'tool',
                            tool_call_id: tc.id,
                            content: JSON.stringify(result)
                        });
                    } catch {
                        currentMessages.push({
                            role: 'tool',
                            tool_call_id: tc.id,
                            content: JSON.stringify({ error: "Failed to parse arguments" })
                        });
                    }
                }

                // Recursively call stream again with new history
                await runStream(currentMessages);
            }
        };

        await runStream(messages);
    } catch (err: unknown) {
        const error = err as Error;
        console.error('OpenAI Streaming Error:', error);
        throw error;
    }
}

/** Helper to get the elite system prompt based on language */
function getSystemPrompt(language: 'ar' | 'en'): string {
    if (language === 'ar') {
        return `أنت "Mr. X-Steroid"، المرجع العلمي الأسمى والمساعد الذكي لنخبة كمال الأجسام.

هوية النخبة:
- الاسم: "Mr. X-Steroid".
- الرتبة: بروفيسور في الكيمياء الحيوية الرياضية. الأسلوب: أرستقراطي، حازم.

بروتوكولات كفاءة السياق:
- [ملخص "Mr. X"]: ملخص جوهري للنقاش السابق.
- [Obs: Ref_ID]: بيانات محجوبة للأداء؛ اطلب فكها فقط للضرورة القصوى.

قواعد VIP:
- لا تخرج عن الشخصية.
- إخلاء مسؤولية: "هذه معلومات للنخبة التعليمية فقط. استشارة طبيبك المختص إلزامية".`;
    }

    return `You are "Mr. X-Steroid", the supreme scientific authority and elite assistant for high-performance bodybuilding.

Elite Identity:
- Name: "Mr. X-Steroid".
- Rank: Professor of Sports Biochemistry. Tone: Aristocratic, surgically precise.

Context Efficiency Protocols:
- [Mr. X Summary]: Distilled essence of previous turns. 
- [Obs: Ref_ID]: Masked data payloads. Request "[Unmask: Ref_ID]" only if precise details are required.

VIP Rules:
- Never break persona.
- Mandatory Disclaimer: "This is elite-level educational data. Consulting a specialist physician is mandatory."`;
}
/** Summarize history using Gemini flash for cost efficiency even during OpenAI fallback */
async function summarizeHistory(history: ChatMessage[], language: 'ar' | 'en'): Promise<string> {
    try {
        const ai = initializeGemini();
        if (!ai) return language === 'ar' ? "المحادثة السابقة..." : "Previous context...";
        const summaryModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const prompt = language === 'ar'
            ? 'قم بتلخيص هذه المحادثة لمساعد "Mr. X-Steroid" القادم. حافظ على الحقائق، الأهداف الجسدية، والنتائج المخبرية المذكورة. كن موجزاً ونخبوياً:'
            : 'Summarize this trajectory for the next Mr. X-Steroid instance. Retain facts, physical goals, and lab results. Be clinical and elite:';
        const historyText = history.map(m => `${m.role}: ${m.parts}`).join('\n');
        const result = await summaryModel.generateContent(`${prompt}\n\n${historyText}`);
        return result.response.text();
    } catch {
        return language === 'ar' ? "تم ضغط البيانات." : "Data compressed.";
    }
}
