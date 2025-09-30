import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Error Boundary per catturare errori
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Errore catturato:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Si è verificato un errore</h2>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()}>
            Ricarica la pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render dell'applicazione per React 18/19
const container = document.getElementById('root');
const root = createRoot(container);

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        {/* RIMUOVI il Router qui - sarà già dentro App.jsx */}
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Errore nel rendering:', error);
  container.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2>Errore di caricamento</h2>
      <p>${error.toString()}</p>
      <button onclick="window.location.reload()">Ricarica</button>
    </div>
  `;
}