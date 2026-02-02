import React, { useState, useRef } from 'react';
import { TRANSITIONS } from '../../utils/logic';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { streamResponse, ChatMessage } from '../../utils/geminiService';
import { synthesizeMacroResult, synthesizeBodyFatResult } from '../../utils/toolSynthesizer';
import { ContentStrings } from '../../types';
import BrandLogo from './BrandLogo';
import { StyledBrandName } from './StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';

const ChatWidget: React.FC<{ content: ContentStrings }> = ({ content }) => {
    const { isRTL } = usePreferences();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    // Listen for tool synthesis events (Context Partitioning Strategy)
    React.useEffect(() => {
        const handleMacroResult = (e: any) => {
            const synthesis = synthesizeMacroResult(e.detail, isRTL);
            injectSystemContext(synthesis);
        };
        const handleBFResult = (e: any) => {
            const synthesis = synthesizeBodyFatResult(e.detail, isRTL);
            injectSystemContext(synthesis);
        };

        window.addEventListener('macro_calculated', handleMacroResult);
        window.addEventListener('bodyfat_calculated', handleBFResult);
        return () => {
            window.removeEventListener('macro_calculated', handleMacroResult);
            window.removeEventListener('bodyfat_calculated', handleBFResult);
        };
    }, [isRTL]);

    const injectSystemContext = (text: string) => {
        const contextMsg: ChatMessage = { role: 'model', parts: `[System Sync]: ${text}`, id: Date.now() + Math.random() };
        setMessages(prev => [...prev, contextMsg]);
        scrollToBottom();
    };

    const sendMessage = async (textOverride?: string) => {
        const msgToSend = textOverride || input;
        if (!msgToSend.trim()) return;

        const newUserMessage: ChatMessage = { role: 'user', parts: msgToSend };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);
        scrollToBottom();

        // Create a placeholder for the model response
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
            console.error("ChatWidget Error:", e);
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

    return (
        <>
            {/* Floating Button with Label */}
            <div className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-40 flex items-center gap-3 ${TRANSITIONS.SLIDE_UP}`}>
                {!isOpen && content.aiChat.label && (
                    <div className={`hidden md:flex items-center gap-2 bg-white dark:bg-zinc-800 py-2 px-4 rounded-full shadow-xl border border-gold-500/30`}>
                        <span className="text-base font-bold text-zinc-600 dark:text-zinc-300">{content.aiChat.label}</span>
                        <BrandLogo variant="short" className="text-xl" />
                    </div>
                )}
                <button
                    onClick={() => setIsOpen(true)}
                    title="Open Chat"
                    className="bg-gold-500 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform relative group"
                >
                    <Bot className="w-8 h-8" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                </button>
            </div>

            {isOpen && (
                <div className={`fixed bottom-24 ${isRTL ? 'left-6' : 'right-6'} z-50 w-[90vw] md:w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden h-[600px] ${TRANSITIONS.SLIDE_UP}`}>

                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-black flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-black/10 rounded-full"><Bot className="w-6 h-6" /></div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-lg"><StyledBrandName text={content.aiChat.title} /></span>
                                <span className="text-xs opacity-75 font-normal uppercase tracking-wider"><StyledBrandName text={content.aiChat.fabLabel} /></span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} title="Close Chat" className="hover:bg-black/10 p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-black/50 scrollbar-thin scrollbar-thumb-gold-500/50">
                        {messages.length === 0 && (
                            <div className="mt-8 space-y-6">
                                <div className="text-center space-y-2">
                                    <BrandLogo variant="short" className="text-5xl opacity-50 block mb-4 mx-auto" />
                                    <p className="text-zinc-500 font-medium px-6"><StyledBrandName text={content.aiChat.welcomeMessage} /></p>
                                </div>

                                {/* Smart Suggestions */}
                                {content.aiChat.suggestions && (
                                    <div className="grid grid-cols-1 gap-2 px-4">
                                        {content.aiChat.suggestions.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => sendMessage(suggestion)}
                                                className="text-left text-sm md:text-base p-3 bg-white dark:bg-zinc-800 border-l-4 border-gold-500 shadow-sm rounded-r-xl hover:bg-gold-500/10 transition-colors flex items-center gap-2 group"
                                            >
                                                <Sparkles className="w-4 h-4 text-gold-500 group-hover:rotate-12 transition-transform" />
                                                <span>{suggestion}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} ${TRANSITIONS.FADE_IN}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-base leading-relaxed ${m.role === 'user'
                                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-br-none'
                                    : 'bg-gold-500/10 text-zinc-800 dark:text-zinc-200 border border-gold-500/20 rounded-bl-none'
                                    }`}>
                                    {m.role === 'model' && (
                                        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gold-500/10">
                                            <Bot className="w-4 h-4 text-gold-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gold-600/70">Expert AI Analysis</span>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">
                                        <StyledBrandName text={String(m.parts || '')} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex justify-start">
                                <div className="bg-gold-500/5 p-4 rounded-2xl rounded-bl-none border border-gold-500/10 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-4 h-4 text-gold-500 animate-bounce" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gold-500/50">
                                            {isRTL ? "جاري معالجة البيانات العلمية..." : "Processing scientific data..."}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gold-500/40 rounded-full animate-pulse"></div>
                                        <div className="w-1.5 h-1.5 bg-gold-500/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gold-500/40 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder={content.aiChat.placeholder}
                                disabled={isLoading}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl pl-4 pr-12 py-4 text-base outline-none focus:ring-2 focus:ring-gold-500/50 transition-shadow disabled:opacity-50"
                            />
                            <button
                                onClick={() => sendMessage()}
                                title="Send Message"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-2 bottom-2 aspect-square bg-gold-500 rounded-lg hover:bg-gold-400 disabled:opacity-50 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 flex items-center justify-center transition-all"
                            >
                                <Send className="w-5 h-5 text-black" />
                            </button>
                        </div>
                        <p className="text-xs text-zinc-400 text-center mt-2 opacity-60">{content.aiChat.disclaimer}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
