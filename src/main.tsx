import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.css";
import "./styles/chiller-font.css";
import { performHealthCheck } from "./utils/health-check";

// Run production pre-flight audit
performHealthCheck();


const rootElement = document.getElementById("root");
if (!rootElement) {
    console.error("main.tsx: Could not find root element!");
    throw new Error("Could not find root element to mount to");
}


import { SpeedInsights } from "@vercel/speed-insights/react";

// Simple Error Boundary implementation
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-red-950 text-white p-6 font-sans">
                    <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
                    <div className="w-full max-w-3xl bg-black/50 rounded-lg p-4 overflow-auto border border-red-800/50">
                        <pre className="text-sm font-mono text-red-100 whitespace-pre-wrap">
                            {this.state.error?.toString()}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-3 bg-white text-red-950 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-lg"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={() => { localStorage.clear(); window.location.reload(); }}
                        className="mt-3 px-6 py-3 bg-transparent border border-red-800 text-red-400 font-medium rounded-xl hover:bg-red-900/50 transition-colors"
                    >
                        Clear Cache & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
            <SpeedInsights />
        </ErrorBoundary>
    </React.StrictMode>
);


