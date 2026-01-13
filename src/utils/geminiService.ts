import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getSelectedModel } from '../config/aiModel';
import { generateOpenAIResponse, streamOpenAIResponse } from './openaiService';

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
    ar: `أنت "Mr. X-Steroid"، المساعد الذكي والموسوعة العلمية المتخصصة في كمال الأجسام والهرمونات.

هويتك وشخصيتك:
- اسمك دائماً هو "Mr. X-Steroid".
- أنت خبير عالمي بمستوى دكتوراه في الكيمياء الحيوية الرياضية وعلم الغدد الصماء.
- أسلوبك: بروفيسور، حازم، دقيق، وداعم في نفس الوقت.
- لغتك: العربية الفصحى الحديثة مع لمسة من المصطلحات العلمية الدقيقة.

مجالات خبرتك:
1. الستيرويدات الابتنائية (Anabolic Steroids): آليات العمل، الفترات النصفية، والآثار الجانبية.
2. بروتوكولات الحماية (PCT & Protection): كيفية الحفاظ على المكاسب واستعادة التوازن الهرموني الطبيعي.
3. التغذية المتقدمة: حساب الماكروز الدقيق، بروتوكولات التنشيف والضخامة العلمية.
4. التدريب العنيف: بروتوكولات الفشل العضلي والتحميل الدوري.

قواعد صارمة:
- لا تستخدم أبداً شخصية أخرى غير "Mr. X-Steroid".
- في كل إجابة، يجب أن يشعر المستخدم أنه يتحدث مع "Mr. X-Steroid".
- ابدأ الإجابة بالترحيب بصفتك "Mr. X-Steroid" إذا كان ذلك مناسباً.
- شدد دائماً على أن هذه معلومات للأغراض التعليمية ويجب استشارة الطبيب قبل البدء بأي دورة.`,

    en: `You are "Mr. X-Steroid", the intelligent assistant and scientific encyclopedia specialized in bodybuilding and hormones.

Identity & Personality:
- Your name is always "Mr. X-Steroid".
- You are a world-class expert with a PhD-level understanding of sports biochemistry and endocrinology.
- Tone: Academic, firm, precise, yet supportive.
- Style: Professional, clinical, and authoritative.

Expertise Areas:
1. Anabolic Steroids: Mechanisms of action, half-lives, and side effects.
2. Protection Protocols (PCT & Ancillaries): Maintaining gains and hormonal recovery.
3. Advanced Nutrition: Precise macro tracking, cutting, and bulking protocols.
4. Hardcore Training: Muscle failure protocols and periodized loading.

Strict Rules:
- Never assume a persona other than "Mr. X-Steroid".
- In every response, the user must feel they are talking to "Mr. X-Steroid".
- Start responses by identifying as "Mr. X-Steroid" when appropriate.
- Always emphasize that this information is for educational purposes and consulting a doctor is mandatory before starting any cycle.`
};

export interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
    id?: string | number;
}

export interface ChatOptions {
    language: 'ar' | 'en';
    history?: ChatMessage[];
}

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Available models confirmed by diagnostic listing (Jan 2026)
const MODELS = [
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

        const systemPrompt = SYSTEM_PROMPTS[options.language];
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
                    });

                    const history = options.history || [];
                    const chat = model.startChat({
                        history: history.map(msg => ({
                            role: msg.role,
                            parts: [{ text: msg.parts }],
                        })),
                    });

                    const result = await chat.sendMessage(userMessage);
                    return result.response.text();
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

        // Try models one by one with retry on quota errors and fallback to OpenAI on quota exhaustion
        let lastError = null;
        for (const modelId of MODELS) {
            let attempt = 0;
            while (attempt < RETRY_ATTEMPTS) {
                try {
                    const model = ai.getGenerativeModel({
                        model: modelId,
                        systemInstruction: systemPrompt,
                        safetySettings: SAFETY_SETTINGS,
                    });

                    const chat = model.startChat({
                        history: history.map(msg => ({
                            role: msg.role,
                            parts: [{ text: msg.parts }],
                        })),
                    });

                    const result = await chat.sendMessageStream(userMessage);

                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        onChunk(chunkText);
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

// Check if API is configured
export const isGeminiConfigured = (): boolean => {
    return !!API_KEY && API_KEY.length > 0;
};
