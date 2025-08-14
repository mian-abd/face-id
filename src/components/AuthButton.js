import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { authHelpers } from '../supabaseClient';
import './AuthButton.css';

const AuthButton = ({ onSignIn, user }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await authHelpers.signInWithGoogle();
      if (result.success) {
        // The redirect will handle the rest
        console.log('Redirecting to Google...');
      } else {
        console.error('Sign-in failed:', result.error);
        alert('Failed to sign in with Google. Please try again.');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const result = await authHelpers.signOut();
      if (result.success) {
        window.location.reload(); // Simple refresh
      } else {
        console.error('Sign-out failed:', result.error);
      }
    } catch (error) {
      console.error('Sign-out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <motion.div 
        className="auth-user-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="user-avatar">
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata?.full_name || user.email}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="user-details">
          <p className="user-name">{user.user_metadata?.full_name || 'Face Academy Student'}</p>
          <p className="user-email">{user.email}</p>
        </div>
        <motion.button
          className="sign-out-btn"
          onClick={handleSignOut}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? '...' : 'Sign Out'}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.button
      className="google-sign-in-btn"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(66, 133, 244, 0.3)" }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="btn-content">
        {!isLoading ? (
          <>
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </>
        ) : (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Connecting...</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default AuthButton;
