'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { saveVoiceCommand } from '@/lib/supabase/tool-state-sync';

interface VoiceCommandProps {
  currentToolSlug: string;
  onToolNavigate: (slug: string) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

export function VoiceCommandButton({ currentToolSlug, onToolNavigate }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    if ('webkitSpeechRecognition' in windowWithSpeech || 'SpeechRecognition' in windowWithSpeech) {
      const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionRef.current.onerror = (event: { error: string }) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  useEffect(() => {
    if (transcript && !isListening) {
      const command = transcript.toLowerCase();
      let intent = 'unknown';
      let toolSlug: string | undefined;
      let confidence = 0.5;

      // Parse voice commands
      if (command.includes('open') || command.includes('show') || command.includes('go to')) {
        intent = 'navigate';
        // Try to extract tool name
        const toolKeywords = [
          'macro', 'body fat', 'injection', 'half life', 'pct', 'hcg', 'serm',
          'estrogen', 'prolactin', 'bloodwork', 'side effect', 'injection site',
          'compound stack', 'progress tracker', 'calorie', 'macro optimizer',
          'water retention', 'shbg', 'half life calculator', 'drug interaction',
          'hpta recovery', 'cardio monitor', 'genetic potential', 'peptide protocol',
          'half life stacker', 'trt optimization', 'bloodwork interpreter',
          'drug interaction pro', 'injection pain', 'ester conversion',
          'stacking synergy', 'side effect warning', 'cycle cost'
        ];

        for (const keyword of toolKeywords) {
          if (command.includes(keyword)) {
            toolSlug = keyword.replace(/\s+/g, '-').replace('tool-', '');
            confidence = 0.8;
            break;
          }
        }
      }

      // Save voice command to Supabase
      const saveCommand = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveVoiceCommand({
            userId: user.id,
            commandText: transcript,
            intent,
            toolSlug,
            confidence,
            executed: !!toolSlug,
          });
        }
      };
      saveCommand();

      if (toolSlug) {
        // Navigate to tool
        setTimeout(() => {
          window.location.href = `/smarttools/${toolSlug}`;
        }, 500);
      }
    }
  }, [transcript, isListening]);

  return (
    <button
      onClick={isListening ? () => recognitionRef.current?.stop() : () => recognitionRef.current?.start()}
      disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
      className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
        isListening
          ? 'bg-red-900/50 border-red-500/50 text-red-400 animate-pulse'
          : 'bg-zinc-800/50 hover:bg-zinc-700/50 border-white/10'
      }`}
      title={isListening ? 'Click to stop listening' : 'Click to start voice command'}
    >
      <span className="text-lg">{isListening ? '🔴' : '🎤'}</span>
      <span className="font-medium text-sm">
        {isListening ? 'Listening...' : 'Voice Command'}
      </span>
      {error && <span className="text-red-400 text-xs ml-2">{error}</span>}
    </button>
  );
}

export default VoiceCommandButton;