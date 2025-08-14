import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import ParticleBackground from './components/ParticleBackground';
import FloatingIcons from './components/FloatingIcons';
import AccessibilityMenu from './components/AccessibilityMenu';
import WelcomeScreen from './components/WelcomeScreen';
import UserRegistration from './components/UserRegistration';
import TrainingSession from './components/TrainingSession';
import RecognitionTest from './components/RecognitionTest';
import GraduationScreen from './components/GraduationScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { supabase } from './supabaseClient';
import modelService from './services/modelService';
import useAccessibility from './hooks/useAccessibility';
import './App.css';

const STAGES = {
  WELCOME: 'welcome',
  REGISTRATION: 'registration', 
  TRAINING: 'training',
  RECOGNITION: 'recognition',
  GRADUATION: 'graduation'
};

function App() {
  const [currentStage, setCurrentStage] = useState(STAGES.WELCOME);
  const [user, setUser] = useState(null);
  const [trainingImages, setTrainingImages] = useState([]);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const { announce } = useAccessibility();

  // Initialize app and load user data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Initializing Face Academy...');

        // Load saved user data
        const savedUser = localStorage.getItem('faceAcademyUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          if (userData.modelTrained) {
            setCurrentStage(STAGES.RECOGNITION);
            setIsModelTrained(true);
          }
        }

        // Pre-load AI model in background (non-blocking)
        try {
          setLoadingMessage('Loading AI neural networks...');
          await modelService.loadModel();
          setLoadingMessage('Ready to train your AI!');
        } catch (modelError) {
          console.warn('Model loading failed, will retry during training:', modelError);
          setLoadingMessage('Starting Face Academy...');
        }
        
        announce('Face Academy loaded successfully');
        toast.success('🎓 Welcome to Face Academy!', {
          duration: 2000,
          style: {
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: '#fff',
          },
        });

      } catch (error) {
        console.error('App initialization error:', error);
        // Don't show error toast immediately, just log
        console.log('Continuing with basic functionality...');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };

    initializeApp();
  }, [announce]);

  const handleStageChange = (newStage) => {
    setCurrentStage(newStage);
  };

  const handleUserRegistration = (userData) => {
    setUser(userData);
    localStorage.setItem('faceAcademyUser', JSON.stringify(userData));
    announce(`Welcome ${userData.username}! Starting training session.`);
    toast.success(`Welcome ${userData.username}! 🎉`);
    setCurrentStage(STAGES.TRAINING);
  };

  const handleTrainingComplete = async (images) => {
    try {
      setTrainingImages(images);
      setIsModelTrained(true);
      
      // Update user data
      const updatedUser = { ...user, modelTrained: true };
      setUser(updatedUser);
      localStorage.setItem('faceAcademyUser', JSON.stringify(updatedUser));
      
      announce('Training completed successfully! You are now ready for graduation.');
      toast.success('🎓 Training completed! You\'re ready for graduation!', {
        duration: 4000,
      });
      
      setCurrentStage(STAGES.GRADUATION);
    } catch (error) {
      console.error('Training completion error:', error);
      toast.error('Training completed but there was an issue saving your data.');
    }
  };

  const handleRecognitionResult = (isRecognized, confidence) => {
    if (isRecognized) {
      announce(`Recognition successful! Confidence: ${(confidence * 100).toFixed(1)}%`);
      toast.success(`🎉 Welcome back ${user.username}! (${(confidence * 100).toFixed(1)}% confidence)`);
      setCurrentStage(STAGES.GRADUATION);
    } else {
      announce(`Recognition failed. Confidence: ${(confidence * 100).toFixed(1)}%`);
      toast.error(`🤔 I don't recognize you. Try again or retrain your model.`);
    }
  };

  const startNewSession = () => {
    announce('Starting new recognition session');
    setCurrentStage(STAGES.RECOGNITION);
  };

  const resetApp = () => {
    // Clean up resources
    modelService.dispose();
    
    // Clear data
    localStorage.removeItem('faceAcademyUser');
    setUser(null);
    setTrainingImages([]);
    setIsModelTrained(false);
    setCurrentStage(STAGES.WELCOME);
    
    announce('App reset successfully. Welcome back to Face Academy!');
    toast.success('🔄 App reset! Ready for a new student.');
  };

  const stageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="app">
          <ParticleBackground intensity={30} />
          <div className="stage-container">
            <LoadingSpinner
              size={80}
              type="neural"
              text={loadingMessage}
            />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app" role="main">
        {/* Enhanced Background Effects */}
        <ParticleBackground intensity={currentStage === STAGES.WELCOME ? 60 : 40} />
        <FloatingIcons stage={currentStage} />

        {/* Accessibility Menu */}
        <AccessibilityMenu />

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '600',
            },
          }}
        />

        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          className="skip-link"
          style={{
            position: 'absolute',
            top: '-40px',
            left: '6px',
            background: '#000',
            color: '#fff',
            padding: '8px',
            borderRadius: '4px',
            textDecoration: 'none',
            zIndex: 1000,
          }}
          onFocus={(e) => {
            e.target.style.top = '6px';
          }}
          onBlur={(e) => {
            e.target.style.top = '-40px';
          }}
        >
          Skip to main content
        </a>

        {/* Main Content */}
        <main id="main-content" tabIndex="-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="stage-container"
            >
              {currentStage === STAGES.WELCOME && (
                <WelcomeScreen onStart={() => handleStageChange(STAGES.REGISTRATION)} />
              )}
              
              {currentStage === STAGES.REGISTRATION && (
                <UserRegistration onRegister={handleUserRegistration} />
              )}
              
              {currentStage === STAGES.TRAINING && (
                <TrainingSession
                  user={user}
                  onTrainingComplete={handleTrainingComplete}
                />
              )}
              
              {currentStage === STAGES.RECOGNITION && (
                <RecognitionTest
                  user={user}
                  trainingImages={trainingImages}
                  isModelTrained={isModelTrained}
                  onRecognitionResult={handleRecognitionResult}
                  onStartNewSession={startNewSession}
                />
              )}
              
              {currentStage === STAGES.GRADUATION && (
                <GraduationScreen
                  user={user}
                  onNewSession={startNewSession}
                  onReset={resetApp}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Enhanced Footer */}
        <footer className="app-footer" role="contentinfo">
          <p>
            🧠 Powered by <strong>Siamese Neural Networks</strong> • 
            ⚡ Built with <strong>TensorFlow.js</strong> • 
            🎓 Face Academy by{' '}
            <a 
              href="https://github.com/mian-abd" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Visit Mian Abd's GitHub profile"
            >
              Mian Abd
            </a>
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>
            🔬 Research-based • 🌐 Open Source • ♿ Accessible
          </p>
        </footer>

        {/* Performance Monitor (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div
            style={{
              position: 'fixed',
              bottom: '80px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'monospace',
              zIndex: 1000,
            }}
          >
            <div>Stage: {currentStage}</div>
            <div>User: {user?.username || 'None'}</div>
            <div>Model: {isModelTrained ? 'Trained' : 'Not trained'}</div>
            <div>Images: {trainingImages.length}</div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
