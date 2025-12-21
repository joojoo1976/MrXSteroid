import React, { useState, useRef } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ContentStrings } from '../types';

const ChatWidget: React.FC<{ content: ContentStrings, isRTL: boolean }> = ({ content, isRTL }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSession = useRef<Chat | null>(null);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            if (!chatSession.current) {
                // Note: API key should ideally be handled more securely than just env var in client
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
                chatSession.current = ai.chats.create({
                    model: 'gemini-2.0-flash', // Updated to latest flash
                    config: { systemInstruction: 'You are Mr. X, a bodybuilding expert. Answer briefly.' }
                });
            }

            const result: GenerateContentResponse = await chatSession.current.sendMessage({ message: userMsg });
            const responseText = result.text || '';
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to AI.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-40 bg-gold-500 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform`}>
                <Bot className="w-6 h-6" />
            </button>
            {isOpen && (
                <div className={`fixed bottom-24 ${isRTL ? 'left-6' : 'right-6'} z-50 w-80 md:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden h-[500px] animate-fade-in-up`}>
                    <div className="p-4 bg-gold-500 text-black font-bold flex justify-between items-center"><div className="flex items-center gap-2"><Bot className="w-5 h-5" /> {content.aiChat.title}</div><button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950">
                        {messages.length === 0 && <p className="text-center text-zinc-500 text-sm mt-10">{content.aiChat.welcomeMessage}</p>}
                        {messages.map((m, i) => (<div key={i} className={`p-3 rounded-xl text-sm max-w-[80%] ${m.role === 'user' ? 'bg-zinc-200 dark:bg-zinc-800 ml-auto' : 'bg-gold-500/20 text-gold-800 dark:text-gold-200 border border-gold-500/20 mr-auto'}`}>{String(m.text || '')}</div>))}
                        {isLoading && <div className="text-xs text-zinc-400 animate-pulse ml-2">Mr. X is thinking...</div>}
                    </div>
                    <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={content.aiChat.placeholder} className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gold-500" />
                        <button onClick={sendMessage} disabled={isLoading} className="p-2 bg-gold-500 rounded-lg hover:bg-gold-400 disabled:opacity-50"><Send className="w-4 h-4 text-black" /></button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
