import { useState, useRef, useEffect, useCallback } from 'react';
import { streamResponse, ChatMessage } from '../../../utils/geminiService';
import { synthesizeMacroResult, synthesizeBodyFatResult } from '../../../utils/toolSynthesizer';

interface UseChatOptions {
    isRTL: boolean;
}

export const useChat = ({ isRTL }: UseChatOptions) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, []);

    const injectSystemContext = useCallback((text: string) => {
        const contextMsg: ChatMessage = {
            role: 'model',
            parts: `[System Sync]: ${text}`,
            id: Date.now() + Math.random()
        };
        setMessages(prev => [...prev, contextMsg]);
        scrollToBottom();
    }, [scrollToBottom]);

    // Listen for tool synthesis events
    useEffect(() => {
        const handleMacroResult = (e: CustomEvent) => {
            const synthesis = synthesizeMacroResult(e.detail, isRTL);
            injectSystemContext(synthesis);
        };
        const handleBFResult = (e: CustomEvent) => {
            const synthesis = synthesizeBodyFatResult(e.detail, isRTL);
            injectSystemContext(synthesis);
        };

        window.addEventListener('macro_calculated', handleMacroResult);
        window.addEventListener('bodyfat_calculated', handleBFResult);
        return () => {
            window.removeEventListener('macro_calculated', handleMacroResult);
            window.removeEventListener('bodyfat_calculated', handleBFResult);
        };
    }, [isRTL, injectSystemContext]);

    const sendMessage = async (textOverride?: string) => {
        const msgToSend = textOverride || input;
        if (!msgToSend.trim()) return;

        const newUserMessage: ChatMessage = { role: 'user', parts: msgToSend };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);
        scrollToBottom();

        const botMessageId = Date.now();
        setMessages(prev => [...prev, { role: 'model', parts: '', id: botMessageId }]);

        try {
            let fullResponse = '';
            await streamResponse(msgToSend, {
                language: isRTL ? 'ar' : 'en',
                history: messages
            }, (chunk) => {
                fullResponse += chunk;
                setMessages(prev => prev.map(m =>
                    m.id === botMessageId ? { ...m, parts: fullResponse } : m
                ));
                scrollToBottom();
            });
        } catch (e: unknown) {
            console.error("useChat Error:", e);
            const errorMessage = isRTL
                ? 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى المحاولة لاحقاً.'
                : 'Error connecting to AI. Please try again later.';
            setMessages(prev => prev.map(m =>
                m.id === botMessageId ? { ...m, parts: errorMessage } : m
            ));
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    return {
        isOpen,
        setIsOpen,
        messages,
        input,
        setInput,
        isLoading,
        messagesEndRef,
        sendMessage
    };
};
