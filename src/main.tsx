import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle chunk load errors (common in production after new deployments)
window.addEventListener('error', (event) => {
  if (event.message.includes('Failed to fetch dynamically imported module')) {
    console.warn('Chunk load failed. Reloading page...');
    window.location.reload();
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
