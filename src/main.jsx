import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Komponen Pungut Error (Error Boundary)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error: error, errorInfo: errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: 'white', height: '100%', overflow: 'auto' }}>
          <h1>CRITICAL ERROR</h1>
          <h2 style={{color: 'black'}}>Aplikasi Crash sebelum mulai.</h2>
          <hr />
          <h3>Error Message:</h3>
          <pre style={{background: '#eee', padding: '10px'}}>{this.state.error && this.state.error.toString()}</pre>
          <h3>Stack Trace:</h3>
          <pre style={{background: '#eee', padding: '10px', fontSize: '10px'}}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
