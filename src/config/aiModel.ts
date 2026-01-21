// Configuration for selecting AI model (Gemini or OpenAI)
// The selection is persisted in localStorage so it survives page reloads.

export type AIModel = 'gemini' | 'openai';

const STORAGE_KEY = 'selectedAIModel';

/**
 * Returns the currently selected AI model.
 * Defaults to 'gemini' if no preference is stored.
 */
export function getSelectedModel(): AIModel {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'openai' || stored === 'gemini') {
            return stored as AIModel;
        }
    } catch (e) {
        // localStorage may be unavailable in some environments (e.g., SSR)
        console.warn('Unable to read AI model from localStorage:', e);
    }
    return 'gemini';
}

/**
 * Persists the chosen AI model.
 */
export function setSelectedModel(model: AIModel): void {
    try {
        localStorage.setItem(STORAGE_KEY, model);
    } catch (e) {
        console.warn('Unable to write AI model to localStorage:', e);
    }
}
