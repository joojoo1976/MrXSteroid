import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
    console.error("main.tsx: Could not find root element!");
    throw new Error("Could not find root element to mount to");
}


import { SpeedInsights } from "@vercel/speed-insights/react";

const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
        <SpeedInsights />
    </React.StrictMode>
);


