import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.css";

console.log("main.tsx: Starting application mount...");

const rootElement = document.getElementById("root");
if (!rootElement) {
    console.error("main.tsx: Could not find root element!");
    throw new Error("Could not find root element to mount to");
}

console.log("main.tsx: Root element found, rendering App...");
const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

console.log("main.tsx: Render call completed.");
