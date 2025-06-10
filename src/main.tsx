import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

console.log('Mounting React application...');

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('React application mounted successfully');
} catch (error) {
  console.error('Failed to mount React application:', error);
  rootElement.innerHTML = `
    <div style="color: white; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
      <h1>Something went wrong</h1>
      <p>Please check the console for more details.</p>
    </div>
  `;
}
