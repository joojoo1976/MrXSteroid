import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.css";
import "./styles/chiller-font.css";


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
                <div style={{ padding: '20px', color: 'white', backgroundColor: 'darkred', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1>Something went wrong.</h1>
                    <pre style={{ maxWidth: '800px', overflow: 'auto', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
                        Reload Page
                    </button>
                    <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}>
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


