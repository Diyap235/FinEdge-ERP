import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FinEdge-ERP Error caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('finedge_auth_token');
      localStorage.removeItem('finedge_user');
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F6F3EC',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
          padding: '24px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '36px 28px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.07)',
            border: '1px solid #e8e3d8',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#fef0ee',
              color: '#c0392b',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>
              Application Recovery
            </h2>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, margin: '0 0 20px' }}>
              A session or rendering issue occurred. Click below to restore normal application state.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '11px 18px',
                borderRadius: '12px',
                background: '#0F6A4B',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15,106,75,0.25)',
              }}
            >
              Reset Session &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
