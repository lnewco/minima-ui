import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.scss"; // Import the existing SCSS
import App from "./App";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);