import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <motion.div
      className="error-boundary"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <motion.div
          style={{ fontSize: '4rem', marginBottom: '20px' }}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🤖💥
        </motion.div>

        <h1
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '2.5rem',
            color: '#fff',
            marginBottom: '20px',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
          }}
        >
          Oops! AI Brain Malfunction
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '30px',
            lineHeight: '1.6',
          }}
        >
          Don&apos;t worry! Even the smartest AI systems sometimes need a reboot. 🔄
          <br />
          Our neural networks are having a temporary glitch.
        </p>

        <details
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '30px',
            textAlign: 'left',
          }}
        >
          <summary
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              marginBottom: '10px',
              fontWeight: '600',
            }}
          >
            🔍 Technical Details (Click to expand)
          </summary>
          <pre
            style={{
              color: '#ff6b6b',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
            }}
          >
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            onClick={resetErrorBoundary}
            style={{
              background: 'linear-gradient(45deg, #4CAF50, #81C784)',
              color: '#fff',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1.1rem',
              fontWeight: '700',
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Restart Face Academy
          </motion.button>

          <motion.button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: '#fff',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1.1rem',
              fontWeight: '700',
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Full Reload
          </motion.button>
        </div>

        <p
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '25px',
          }}
        >
          If the problem persists, please{' '}
          <a
            href="https://github.com/mian-abd/face-id/issues"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#ffd700', textDecoration: 'none' }}
          >
            report this issue on GitHub
          </a>
          . 🐛
        </p>
      </div>
    </motion.div>
  );
};

const ErrorBoundary = ({ children }) => {
  const handleError = (error, errorInfo) => {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
    
    // In production, you'd send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    }
  };

  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
