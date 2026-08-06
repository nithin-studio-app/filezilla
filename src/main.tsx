import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { FilezillaApp } from "./FilezillaApp";

// Standalone entry point — no host, so basePath/onBack stay at their
// defaults ("" / undefined). apiBaseUrl falls back to FileManager's own
// http://localhost:8002 default when VITE_API_BASE_URL isn't set.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <FilezillaApp apiBaseUrl={import.meta.env.VITE_API_BASE_URL} />
    </BrowserRouter>
  </StrictMode>,
);
