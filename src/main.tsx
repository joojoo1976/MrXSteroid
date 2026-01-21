import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.css";
import { UnitProvider } from "./context/UnitContext";



const rootElement = document.getElementById("root");
if (!rootElement) {
    console.error("main.tsx: Could not find root element!");
    throw new Error("Could not find root element to mount to");
}


const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <UnitProvider>
            <App />
        </UnitProvider>
    </React.StrictMode>
);


