import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { dbHelpers } from '../supabaseClient';

const TrainingSession = ({ user, onTrainingComplete }) => {
  const webcamRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [showCaptureOverlay, setShowCaptureOverlay] = useState(false);

  const TOTAL_IMAGES = 10;
  const CAPTURE_INSTRUCTIONS = [
    "Look straight at the camera 📸",
    "Turn your head slightly left 👈",
    "Turn your head slightly right 👉", 
    "Tilt your head up a bit ⬆️",
    "Tilt your head down a bit ⬇️",
    "Smile! 😊",
    "Serious expression 😐",
    "Look straight again 📸",
    "One more with good lighting 💡",
    "Perfect! Final shot! 🎯"
  ];

  const captureImage = useCallback(() => {
    if (isCapturing) {
      return;
    }
    
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      alert('Failed to capture image. Please try again!');
      return;
    }

    setIsCapturing(true);
    setShowCaptureOverlay(true);

    // Visual feedback
    setTimeout(() => {
      setShowCaptureOverlay(false);
      
      const newImages = [...capturedImages, imageSrc];
      setCapturedImages(newImages);
      setCurrentStep(currentStep + 1);
      setIsCapturing(false);

      // If we've captured all images, start training
      if (newImages.length >= TOTAL_IMAGES) {
        startTraining(newImages);
      }
    }, 300);
  }, [capturedImages, currentStep, isCapturing]);

  const startTraining = async (images) => {
    setIsTraining(true);
    
    try {
      // Save training images to database
      const result = await dbHelpers.saveTrainingImages(user.id, images, 'positive');
      
      if (result.success) {
        // Update user model status
        await dbHelpers.updateModelStatus(user.id, 'trained');
        
        // Simulate training time (in reality, this would be client-side model training)
        setTimeout(() => {
          onTrainingComplete(images);
        }, 3000);
      } else {
        throw new Error('Failed to save training images');
      }
    } catch (error) {
      console.error('Training error:', error);
      alert('Training failed! Please try again.');
      setIsTraining(false);
    }
  };

  const progressPercentage = (currentStep / TOTAL_IMAGES) * 100;

  if (isTraining) {
    return (
      <motion.div 
        className="training-session"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.h2 
          className="training-title"
          animate={{ 
            scale: [1, 1.05, 1],
            textShadow: [
              "0 0 20px rgba(255, 255, 255, 0.3)",
              "0 0 30px rgba(255, 215, 0, 0.6)",
              "0 0 20px rgba(255, 255, 255, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🧠 AI BRAIN TRAINING...
        </motion.h2>
        
        <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.9)' }}>
          <div className="loading-spinner" style={{ margin: '30px auto' }}></div>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            🔬 Teaching AI to recognize {user.username}...
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Creating neural pathways • Analyzing facial features • Building your digital identity
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="training-session"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2 
        className="training-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        🎓 Training Session
      </motion.h2>

      <motion.p
        style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          textAlign: 'center', 
          marginBottom: '20px',
          fontSize: '1.1rem'
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Hello <strong>{user.username}</strong>! 👋
        <br />
        Time to teach the AI how to recognize your beautiful face! ✨
      </motion.p>

      <div className="progress-container">
        <h3 style={{ color: '#fff', margin: '0 0 15px 0', textAlign: 'center' }}>
          📸 Photo {currentStep + 1} of {TOTAL_IMAGES}
        </h3>
        
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          textAlign: 'center', 
          margin: '15px 0 0 0',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          {currentStep < TOTAL_IMAGES ? 
            `📋 ${CAPTURE_INSTRUCTIONS[currentStep]}` : 
            '🎉 All photos captured!'
          }
        </p>
      </div>

      {currentStep < TOTAL_IMAGES && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="webcam-container">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              className="webcam"
              mirrored={true}
              videoConstraints={{
                width: 320,
                height: 240,
                facingMode: "user"
              }}
            />
            <div className={`capture-overlay ${showCaptureOverlay ? 'active' : ''}`} />
          </div>

          <motion.button
            className="capture-button"
            onClick={captureImage}
            disabled={isCapturing}
            whileHover={!isCapturing ? { scale: 1.05 } : {}}
            whileTap={!isCapturing ? { scale: 0.95 } : {}}
            style={{ marginTop: '20px' }}
          >
            {isCapturing ? '📸 Capturing...' : `📸 Capture Photo ${currentStep + 1}`}
          </motion.button>

          <div style={{ 
            marginTop: '20px', 
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            <p>💡 <strong>Pro Tips:</strong></p>
            <p>• Make sure your face is well-lit</p>
            <p>• Look directly at the camera</p>
            <p>• Follow the instructions for each photo</p>
          </div>
        </motion.div>
      )}

      {/* Show captured images preview */}
      {capturedImages.length > 0 && (
        <motion.div
          style={{ marginTop: '30px', textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4 style={{ color: '#fff', marginBottom: '15px' }}>
            ✅ Captured Photos ({capturedImages.length}/{TOTAL_IMAGES})
          </h4>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            justifyContent: 'center',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {capturedImages.map((image, index) => (
              <motion.img
                key={index}
                src={image}
                alt={`Training photo ${index + 1}`}
                style={{
                  width: '60px',
                  height: '45px',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  objectFit: 'cover'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrainingSession;
