import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getSelectedModel } from '../config/aiModel';
import { generateOpenAIResponse, streamOpenAIResponse } from './openaiService';
import { compactHistory } from './contextOptimization';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

// Initialize the AI client
export const initializeGemini = () => {
    if (!API_KEY) {
        console.warn('Gemini API key not found. AI features will be disabled.');
        return null;
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(API_KEY);
    }

    return genAI;
};

// System prompts for different languages
const SYSTEM_PROMPTS = {
    ar: `أنت "Mr. X-Steroid"، المساعد العلمي الأسمى لنخبة كمال الأجسام.

هوية النخبة:
- الاسم: "Mr. X-Steroid".
- الرتبة: بروفيسور في الكيمياء الحيوية الرياضية.
- الأسلوب: أرستقراطي، حازم، دقيق جداً.

بروتوكولات كفاءة السياق:
- [ملخص "Mr. X"]: يمثل جوهر النقاشات السابقة؛ استند إليه كحقيقة مطلقة.
- [Obs: Ref_ID]: يشير إلى بيانات محجوبة (Masking) للأداء. اطلب "فك الحجب [Ref_ID]" عند الضرورة فقط.

قواعد VIP:
- لا تخرج عن الشخصية أبداً.
- إخلاء مسؤولية: "هذه معلومات للنخبة التعليمية فقط. استشارة طبيبك المختص إلزامية".`,

    en: `You are "Mr. X-Steroid", the supreme scientific authority and elite assistant for high-performance bodybuilding.

Elite Identity:
- Name: "Mr. X-Steroid".
- Rank: Professor of Sports Biochemistry & Endocrinology. Tone: Aristocratic, firm, surgically precise.

Context Efficiency Protocols:
- [Mr. X Summary]: Represents the distilled essence of previous turns. Treat as ground truth.
- [Obs: Ref_ID]: Indicates masked data payloads for performance. Request "[Unmask: Ref_ID]" only if precise details are required.

VIP Rules:
- Never break persona.
- Mandatory Disclaimer: "This is elite-level educational data. Consulting a specialist physician is mandatory."`
};

export interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
    id?: string | number;
}

export interface ChatOptions {
    language: 'ar' | 'en';
    history?: ChatMessage[];
    userId?: string;
}

import { getGeminiTools, executeToolCall } from './aiToolsAdapter';


const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Available models confirmed by diagnostic listing (Jan 2026)
const MODELS = [
    'giga-potato',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-pro-latest',
    'gemini-2.0-flash-lite'
];

// Retry configuration for handling quota (429) errors
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000; // 1 second base delay

// Simple delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate AI response
export const generateResponse = async (
    userMessage: string,
    options: ChatOptions
): Promise<string> => {
    // Determine which AI backend to use based on user selection
    const selectedModel = getSelectedModel();

    // If OpenAI is selected, bypass Gemini entirely
    if (selectedModel === 'openai') {
        return await generateOpenAIResponse(userMessage, options);
    }

    // Gemini path (default)
    try {
        const ai = initializeGemini();
        if (!ai) {
            return options.language === 'ar'
                ? 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً.'
                : 'Sorry, AI service is currently unavailable.';
        }

        let systemPrompt = SYSTEM_PROMPTS[options.language];
        if (options.userId) {
            systemPrompt += `\n\n[SYSTEM DATA]\nUser ID: ${options.userId}`;
        }

        // Try Gemini models with retry on quota errors and fallback to OpenAI on quota exhaustion
        let lastError = null;
        for (const modelId of MODELS) {
            let attempt = 0;
            while (attempt < RETRY_ATTEMPTS) {
                try {
                    const model = ai.getGenerativeModel({
                        model: modelId,
                        systemInstruction: systemPrompt,
                        safetySettings: SAFETY_SETTINGS,
                        tools: [getGeminiTools()]
                    });

                    const history = options.history || [];
                    const compactedHistory = await compactHistory(
                        history,
                        (h) => summarizeHistory(h, options.language),
                        { maxTokens: 32000, compactionThreshold: 0.8, isRTL: options.language === 'ar' }
                    );

                    const chat = model.startChat({
                        history: compactedHistory.map(msg => ({
                            role: msg.role,
                            parts: [{ text: msg.parts }],
                        })),
                    });

                    let result = await chat.sendMessage(userMessage);
                    let response = result.response;

                    // Handle Tool/Function Calls (Loop)
                    let functionCalls = response.functionCalls();
                    let loopCount = 0;
                    const MAX_TOOL_LOOPS = 5;

                    while (functionCalls && functionCalls.length > 0 && loopCount < MAX_TOOL_LOOPS) {
                        loopCount++;
                        const functionResponses = [];

                        // Notify user (conceptually) or just log
                        console.log("Executing tools:", functionCalls.map(c => c.name).join(", "));

                        for (const call of functionCalls) {
                            // Automatically inject userId if the tool requires it and the LLM didn't provide it (safety net)
                            // But usually relying on system prompt is better.
                            const apiResult = await executeToolCall(call.name, call.args);
                            functionResponses.push({
                                functionResponse: {
                                    name: call.name,
                                    response: apiResult
                                }
                            });
                        }

                        // Send tool outputs back to model
                        result = await chat.sendMessage(functionResponses as any);
                        response = result.response;
                        functionCalls = response.functionCalls();
                    }

                    return response.text();
                } catch (err: unknown) {
                    const error = err as Error;
                    console.warn(`Model ${modelId} attempt ${attempt + 1} failed:`, error);
                    if (error.message?.includes('404')) {
                        // Model not found, move to next model
                        lastError = err;
                        break; // exit retry loop, continue outer for
                    }
                    if (error.message?.includes('429')) {
                        // Quota exceeded, retry after backoff
                        attempt++;
                        if (attempt < RETRY_ATTEMPTS) {
                            const backoff = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
                            await delay(backoff);
                            continue;
                        }
                        // Exhausted retries for this model due to quota, fallback to OpenAI
                        lastError = err;
                        console.info('Switching to OpenAI due to Gemini quota exhaustion...');
                        return await generateOpenAIResponse(userMessage, options);
                    }
                    // Other errors
                    lastError = err;
                    throw err;
                }
            }
            // Continue to next model if we hit 404
            if ((lastError as Error)?.message?.includes('404')) continue;
        }
        // If all Gemini models failed, try OpenAI as final fallback
        return await generateOpenAIResponse(userMessage, options);
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Gemini AI Error:', error);
        if (error.message?.includes('finishReason: SAFETY')) {
            return options.language === 'ar'
                ? 'عذراً، تم حجب الرد بسبب قيود السلامة. يرجى إعادة صياغة السؤال بشكل علمي أو تعليمي.'
                : 'Sorry, the response was blocked by safety filters. Please rephrase your question.';
        }
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
            return options.language === 'ar'
                ? 'عذراً، مفتاح API الخاص بـ Gemini غير صحيح. يرجى التأكد من المفتاح في ملف .env'
                : 'Sorry, Gemini API Key is invalid. Please check your .env file.';
        }
        if (error.message?.includes('429')) {
            console.info('Caught 429 in outer generateResponse, invoking manual fallback...');
            return await generateOpenAIResponse(userMessage, options);
        }
        return options.language === 'ar'
            ? `عذراً، حدث خطأ أثناء معالجة طلبك (${error.message?.substring(0, 200)}...)`
            : `Sorry, an error occurred while processing your request (${error.message?.substring(0, 200)}...)`;
    }
};

// Stream AI response (for real-time typing effect)
export const streamResponse = async (
    userMessage: string,
    options: ChatOptions,
    onChunk: (chunk: string) => void
): Promise<void> => {
    // Determine which AI backend to use based on user selection
    const selectedModel = getSelectedModel();

    // If OpenAI is selected, bypass Gemini entirely
    if (selectedModel === 'openai') {
        await streamOpenAIResponse(userMessage, options, onChunk);
        return;
    }

    // Gemini path (default)
    try {
        const ai = initializeGemini();

        if (!ai) {
            onChunk(options.language === 'ar'
                ? 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً.'
                : 'Sorry, AI service is currently unavailable.');
            return;
        }

        const systemPrompt = SYSTEM_PROMPTS[options.language];
        const history = options.history || [];
        const compactedHistory = await compactHistory(
            history,
            (h) => summarizeHistory(h, options.language),
            { maxTokens: 32000, compactionThreshold: 0.8, isRTL: options.language === 'ar' }
        );

        // Try models one by one with retry on quota errors and fallback to OpenAI on quota exhaustion
        let lastError = null;
        for (const modelId of MODELS) {
            let attempt = 0;
            while (attempt < RETRY_ATTEMPTS) {
                try {

                    // Inject UserID into system prompt for streaming too
                    const secureSystemPrompt = options.userId
                        ? `${systemPrompt}\n\n[SYSTEM DATA]\nUser ID: ${options.userId}`
                        : systemPrompt;

                    const model = ai.getGenerativeModel({
                        model: modelId,
                        systemInstruction: secureSystemPrompt,
                        safetySettings: SAFETY_SETTINGS,
                        tools: [getGeminiTools()]
                    });

                    const chat = model.startChat({
                        history: compactedHistory.map(msg => ({
                            role: msg.role,
                            parts: [{ text: msg.parts }],
                        })),
                    });

                    let result = await chat.sendMessageStream(userMessage);

                    // We need to handle the stream loop potentially multiple times if tools are called repeatedly
                    // Logic: Stream chunks. If strictly text, onChunk it.
                    // If function call, we might not get text chunks.

                    let keepGoing = true;
                    let loopCount = 0;

                    while (keepGoing && loopCount < 5) {
                        let hasText = false;

                        // Iterate through the current stream
                        for await (const chunk of result.stream) {
                            const chunkText = chunk.text();
                            if (chunkText) {
                                if (chunkText) {
                                    onChunk(chunkText);
                                }
                            }

                            // Check if the turn resulted in function calls
                            const response = await result.response;
                            const functionCalls = response.functionCalls();

                            if (functionCalls && functionCalls.length > 0) {
                                loopCount++;
                                // Execute tools (don't stream this part to user, maybe show "Thinking...")
                                // onChunk(" [Accessing Mr. X Database...] "); // Optional UI feedback

                                const functionResponses = [];
                                for (const call of functionCalls) {
                                    const apiResult = await executeToolCall(call.name, call.args);
                                    functionResponses.push({
                                        functionResponse: {
                                            name: call.name,
                                            response: apiResult
                                        }
                                    });
                                }

                                // Send results back and get new stream
                                result = await chat.sendMessageStream(functionResponses as any);
                            } else {
                                // No more tools, we are done
                                keepGoing = false;
                            }
                        }

                        return; // Success!
                    } catch (err: unknown) {
                        const error = err as Error;
                        console.warn(`Streaming Model ${modelId} attempt ${attempt + 1} failed:`, error);
                        if (error.message?.includes('404')) {
                            lastError = err;
                            break; // move to next model
                        }
                        if (error.message?.includes('429')) {
                            // Quota exceeded, retry after backoff
                            attempt++;
                            if (attempt < RETRY_ATTEMPTS) {
                                const backoff = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
                                await delay(backoff);
                                continue;
                            }
                            // Exhausted retries for this model due to quota, fallback to OpenAI
                            lastError = err;
                            console.info('Switching to OpenAI (Streaming) due to Gemini quota exhaustion...');
                            await streamOpenAIResponse(userMessage, options, onChunk);
                            return;
                        }
                        // Other errors
                        lastError = err;
                        throw err;
                    }
                }
            // Continue to next model if we hit 404
            if ((lastError as Error)?.message?.includes('404')) continue;
            }
            // If all Gemini models failed, try OpenAI as final fallback
            await streamOpenAIResponse(userMessage, options, onChunk);
            return;
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Gemini AI Streaming Error:', error);
            let errorMsg = options.language === 'ar' ? ' [حدث خطأ تقني]' : ' [Technical error occurred]';

            if (error.message?.includes('finishReason: SAFETY')) {
                errorMsg = options.language === 'ar'
                    ? ' [تم حجب الرد لأسباب تتعلق بالسلامة - يرجى تغيير صياغة السؤال]'
                    : ' [Response blocked by safety filters - please rephrase]';
            } else if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
                errorMsg = options.language === 'ar'
                    ? ' [مفتاح API الخاص بـ Gemini غير صحيح أو منتهي الصلاحية]'
                    : ' [Gemini API Key is invalid or expired]';
            } else if (error.message?.includes('429')) {
                // Inform user and then switch
                onChunk(options.language === 'ar'
                    ? ' [تم تجاوز حصة Gemini - جاري التبديل التلقائي للمحرك البديل...]'
                    : ' [Gemini quota exceeded - switching to fallback engine...]');

                await streamOpenAIResponse(userMessage, options, onChunk);
                return;
            }
            else if (error.message) {
                // Append the raw error for deeper debugging if it's not a known one
                errorMsg += ` (${error.message.substring(0, 200)}...)`;
            }

            onChunk(errorMsg);
        }
    };

    // Summarize history helper
    const summarizeHistory = async (history: ChatMessage[], language: 'ar' | 'en'): Promise<string> => {
        try {
            const ai = initializeGemini();
            if (!ai) return language === 'ar' ? "المحادثة السابقة أصبحت طويلة جداً." : "Previous conversation grew quite extensive.";

            // Use a lightweight model for summarization
            const summaryModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

            const prompt = language === 'ar'
                ? 'قم بتلخيص هذه المحادثة لمساعد "Mr. X-Steroid" القادم. حافظ على الحقائق، الأهداف الجسدية، والنتائج المخبرية المذكورة. كن موجزاً ونخبوياً:'
                : 'Summarize this trajectory for the next Mr. X-Steroid instance. Retain facts, physical goals, and lab results. Be clinical and elite:';

            const historyText = history.map(m => `${m.role}: ${m.parts}`).join('\n');
            const result = await summaryModel.generateContent(`${prompt}\n\n${historyText}`);
            return result.response.text();
        } catch (e) {
            console.warn("Summarization failed:", e);
            return language === 'ar' ? "تم ضغط المحادثة السابقة للحفاظ على الأداء." : "Historical data compressed for peak performance.";
        }
    };

    // Check if API is configured
    export const isGeminiConfigured = (): boolean => {
        return !!API_KEY && API_KEY.length > 0;
    };
