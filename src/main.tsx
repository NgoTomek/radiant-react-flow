// src/main.tsx
import { createRoot } from 'react-dom/client';
import React from 'react';
import './index.css';

// Simple error boundary for debugging
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#ffeeee',
          border: '2px solid #ff6666',
          borderRadius: '8px',
          color: 'black',
          fontFamily: 'sans-serif'
        }}>
          <h1>Something went wrong</h1>
          <p>The application encountered an error:</p>
          <pre style={{
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px',
            overflowX: 'auto'
          }}>
            {this.state.error?.message}
            {this.state.error?.stack && '\n' + this.state.error.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple loading indicator
const LoadingIndicator = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#132237',
    color: 'white'
  }}>
    <h1 style={{ marginBottom: '20px' }}>Loading Portfolio Panic...</h1>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid rgba(255, 107, 0, 0.3)',
      borderTop: '5px solid #FF6B00',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Dynamic imports to avoid circular dependencies
const App = React.lazy(() => import('./App'));

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error || event.message);
});

// Main render function
try {
  console.log('Application starting...');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found in the DOM');
    document.body.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h1>Error: Root element not found</h1>
        <p>Make sure your index.html contains a div with id="root"</p>
      </div>
    `;
  } else {
    createRoot(rootElement).render(
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingIndicator />}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    );
  }
} catch (error) {
  console.error('Fatal error during initialization:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; margin: 20px; background-color: #ffeeee; border: 2px solid #ff6666; border-radius: 8px; color: black; font-family: sans-serif;">
      <h1>Fatal Error</h1>
      <p>The application failed to initialize:</p>
      <pre style="background-color: #fff; padding: 10px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
