import "@/styles/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/app";

const container = document.getElementById("app");

if (!container) {
  document.body.innerHTML = `
    <div style="padding: 20px; color: #dc2626;">
      <h2 style="margin: 0 0 10px 0;">Erro ao carregar aplicação</h2>
      <p style="margin: 0; font-size: 14px;">Container #app não encontrado no DOM.</p>
    </div>
  `;

  throw new Error();
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
