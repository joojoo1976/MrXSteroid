'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useIntroAudio — a real HTMLAudioElement controller for the author's intro.
 * Loads a language-appropriate source (/intro.mp3 | /intro_Ar.mp3), exposes
 * play/pause, live time, duration, readiness and error state. Handles autoplay
 * rejections and cleans up on unmount. Pure client-side, edge-safe.
 */
export interface IntroAudio {
    isPlaying: boolean;
    duration: number;
    currentTime: number;
    ready: boolean;
    error: boolean;
    togglePlay: () => void;
    seekTo: (fraction: number) => void;
}

export function useIntroAudio(src: string): IntroAudio {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(false);

    // Create the audio element once.
    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audioRef.current = audio;

        const onLoaded = () => { setDuration(Number.isFinite(audio.duration) ? audio.duration : 0); setReady(true); };
        const onTime = () => setCurrentTime(audio.currentTime || 0);
        const onEnd = () => { setPlaying(false); setCurrentTime(0); try { audio.currentTime = 0; } catch { /* noop */ } };
        const onError = () => { setError(true); setReady(false); setPlaying(false); };

        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('durationchange', onLoaded);
        audio.addEventListener('ended', onEnd);
        audio.addEventListener('error', onError);

        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('durationchange', onLoaded);
            audio.removeEventListener('ended', onEnd);
            audio.removeEventListener('error', onError);
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    // (Re)load when the language/source changes; reset transport state.
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.src = src;
        audio.load();
        setPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setReady(false);
        setError(false);
    }, [src]);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            audio.play()
                .then(() => setPlaying(true))
                .catch(() => { setPlaying(false); setError(true); });
        } else {
            audio.pause();
            setPlaying(false);
        }
    }, []);

    const seekTo = useCallback((fraction: number) => {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(audio.duration)) return;
        const clamped = Math.max(0, Math.min(1, fraction));
        audio.currentTime = clamped * audio.duration;
        setCurrentTime(audio.currentTime);
    }, []);

    return { isPlaying, duration, currentTime, ready, error, togglePlay, seekTo };
}
