import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure React is properly initialized
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Wrap in StrictMode for development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
