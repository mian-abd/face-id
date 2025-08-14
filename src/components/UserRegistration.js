import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbHelpers, authHelpers } from '../supabaseClient';
import AuthButton from './AuthButton';

const UserRegistration = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authUser, setAuthUser] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const result = await authHelpers.getCurrentUser();
      if (result.success && result.user) {
        setAuthUser(result.user);
        handleAuthenticatedUser(result.user);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser(session.user);
        handleAuthenticatedUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleAuthenticatedUser = async (user) => {
    setIsLoading(true);
    try {
      const result = await dbHelpers.createOrGetUserProfile(user);
      if (result.success) {
        onRegister({
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          modelTrained: result.user.model_status === 'trained',
          isAuthenticated: true
        });
      }
    } catch (err) {
      console.error('Profile creation error:', err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('Please enter your name to continue!');
      return;
    }

    if (formData.username.length < 2) {
      setError('Name must be at least 2 characters long!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if username already exists
      const existingUser = await dbHelpers.getUserByUsername(formData.username.trim());
      
      if (existingUser.success) {
        // User exists, check if they have a trained model
        if (existingUser.user.model_status === 'trained') {
          // User has a trained model, proceed to recognition
          onRegister({
            id: existingUser.user.id,
            username: existingUser.user.username,
            email: existingUser.user.email,
            modelTrained: true
          });
        } else {
          // User exists but no trained model, proceed to training
          onRegister({
            id: existingUser.user.id,
            username: existingUser.user.username,
            email: existingUser.user.email,
            modelTrained: false
          });
        }
      } else {
        // Create new user
        const result = await dbHelpers.createUser(
          formData.username.trim(),
          formData.email.trim() || null
        );

        if (result.success) {
          onRegister({
            id: result.user.id,
            username: result.user.username,
            email: result.user.email,
            modelTrained: false
          });
        } else {
          setError('Failed to create your profile. Please try again!');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Something went wrong. Please try again!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="registration-form"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2 
        className="form-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        👋 Welcome, Future AI Teacher!
      </motion.h2>

      <motion.p
        style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          textAlign: 'center', 
          marginBottom: '30px',
          lineHeight: '1.6'
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Let&apos;s create your AI student profile! 🎓
        <br />
        <small style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Don&apos;t worry - we keep your data safe and private! 🔒
        </small>
      </motion.p>

      {/* Google Authentication Section */}
      {!authUser && !showManualForm && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '30px' }}
        >
          <AuthButton user={authUser} onSignIn={handleAuthenticatedUser} />
          
          <motion.div
            style={{ margin: '20px 0', color: 'rgba(255, 255, 255, 0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span>or</span>
          </motion.div>
          
          <motion.button
            type="button"
            onClick={() => setShowManualForm(true)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Continue without Google
          </motion.button>
        </motion.div>
      )}

      {(showManualForm || authUser) && (
        <form onSubmit={handleSubmit}>
        <motion.div 
          className="form-group"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <label htmlFor="username" className="form-label">
            🎯 What should I call you? *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your name (e.g., John, Sarah, Alex...)"
            className="form-input"
            required
            maxLength={30}
            disabled={isLoading}
          />
        </motion.div>

        <motion.div 
          className="form-group"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <label htmlFor="email" className="form-label">
            📧 Email (Optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com (for future updates)"
            className="form-input"
            disabled={isLoading}
          />
          <small style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            fontSize: '0.8rem', 
            marginTop: '5px', 
            display: 'block' 
          }}>
            We&apos;ll only use this to send you cool AI updates! 🚀
          </small>
        </motion.div>

        {error && (
          <motion.div
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
              color: '#fff',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '600'
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        <motion.button
          type="submit"
          className="submit-button"
          disabled={isLoading}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner" style={{ display: 'inline-block', marginRight: '10px' }}></div>
              Creating Your Profile...
            </>
          ) : (
            '🎓 Join Face Academy!'
          )}
        </motion.button>
      </form>
      )}

      <motion.div
        style={{ 
          marginTop: '25px', 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.9rem'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <p>
          🔐 Your privacy matters! We only store your name and training images locally.
          <br />
          🗑️ You can delete everything anytime.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default UserRegistration;
