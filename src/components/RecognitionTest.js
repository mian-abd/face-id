import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { dbHelpers } from '../supabaseClient';
import modelService from '../services/modelService';

const RecognitionTest = ({ user, onRecognitionResult, onStartNewSession }) => {
  const webcamRef = useRef(null);
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [showCaptureOverlay, setShowCaptureOverlay] = useState(false);

  // Real face recognition using trained model
  const performRecognition = useCallback(async (capturedImage) => {
    try {
      console.log('🔍 Starting face recognition...');
      
      // Load the model if not already loaded
      await modelService.loadModel();
      
      // Get user's training images from database
      console.log('📸 Fetching training images for user:', user.id);
      const trainingImagesResult = await dbHelpers.getTrainingImages(user.id);
      
      if (!trainingImagesResult.success || !trainingImagesResult.images || trainingImagesResult.images.length === 0) {
        console.warn('⚠️ No training images found for user');
        return {
          isRecognized: false,
          confidence: 0,
          error: 'No training data found. Please train first.'
        };
      }
      
      console.log('✅ Found', trainingImagesResult.images.length, 'training images');
      
      // Compare against all training images and get similarities
      console.log('🔄 Comparing against', trainingImagesResult.images.length, 'training images...');
      const similarities = [];
      const imageComparisons = [];
      
      for (let i = 0; i < Math.min(trainingImagesResult.images.length, 8); i++) { // Use up to 8 for better accuracy
        const trainingImage = trainingImagesResult.images[i];
        try {
          console.log(`🖼️ Comparing with training image ${i + 1}...`);
          
          // Use the image URL or base64 data
          const imageData = trainingImage.public_url || trainingImage.image_data;
          const similarity = await modelService.predict(capturedImage, imageData);
          
          similarities.push(similarity);
          imageComparisons.push({
            imageIndex: i,
            similarity: similarity,
            source: trainingImage.public_url ? 'storage' : 'base64'
          });
          
          console.log(`📊 Training image ${i + 1} similarity:`, similarity, `(${trainingImage.public_url ? 'from storage' : 'from base64'})`);
        } catch (error) {
          console.warn(`⚠️ Error comparing with training image ${i + 1}:`, error);
        }
      }
      
      if (similarities.length === 0) {
        return {
          isRecognized: false,
          confidence: 0,
          error: 'Failed to process any training images'
        };
      }
      
      // Calculate different confidence metrics
      const avgConfidence = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
      const maxConfidence = Math.max(...similarities);
      const minConfidence = Math.min(...similarities);
      
      // Use a weighted approach: favor consistent high scores
      const weightedConfidence = (avgConfidence * 0.7) + (maxConfidence * 0.3);
      
      console.log('📈 Confidence Analysis:', {
        average: avgConfidence,
        maximum: maxConfidence,
        minimum: minConfidence,
        weighted: weightedConfidence,
        comparisons: imageComparisons
      });
      
      // Adaptive threshold based on consistency
      const confidenceSpread = maxConfidence - minConfidence;
      const isConsistent = confidenceSpread < 0.3; // Less than 30% spread
      
      // Lower threshold if results are consistent
      const RECOGNITION_THRESHOLD = isConsistent ? 0.4 : 0.6;
      const finalConfidence = weightedConfidence;
      const isRecognized = finalConfidence > RECOGNITION_THRESHOLD;
      
      console.log('🎯 Final confidence:', finalConfidence, 'Recognized:', isRecognized);
      
      return {
        isRecognized,
        confidence: finalConfidence
      };
      
    } catch (error) {
      console.error('❌ Recognition error:', error);
      return {
        isRecognized: false,
        confidence: 0,
        error: error.message
      };
    }
  }, [user.id]);

  const startRecognitionTest = useCallback(async () => {
    if (isTestingInProgress) {
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      alert('Failed to capture image. Please try again!');
      return;
    }

    setIsTestingInProgress(true);
    setTestResult(null);
    setShowCaptureOverlay(true);

    // Visual feedback for capture
    setTimeout(() => {
      setShowCaptureOverlay(false);
    }, 300);

    try {
      const result = await performRecognition(imageSrc);
      setTestResult(result.isRecognized);
      setConfidence(result.confidence);
      
      if (result.error) {
        console.error('Recognition error:', result.error);
        // You might want to show this error to the user
      }
      
      onRecognitionResult(result.isRecognized, result.confidence);
    } catch (error) {
      console.error('Recognition error:', error);
      setTestResult(false);
      setConfidence(0);
    } finally {
      setIsTestingInProgress(false);
    }
  }, [isTestingInProgress, performRecognition, onRecognitionResult]);

  const getResultMessage = () => {
    if (testResult === null) {
      return null;
    }
    
    if (testResult) {
      return {
        title: `🎉 Welcome back, ${user.username}!`,
        message: `I recognize you with ${(confidence * 100).toFixed(1)}% confidence!`,
        className: 'recognition-success'
      };
    } else {
      return {
        title: '🤔 Hmm, I don\'t recognize you...',
        message: `Only ${(confidence * 100).toFixed(1)}% match. Are you ${user.username}?`,
        className: 'recognition-failure'
      };
    }
  };

  const resultData = getResultMessage();

  return (
    <motion.div 
      className="recognition-test"
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
        🔍 Final Exam Time!
      </motion.h2>

      <motion.p
        style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          textAlign: 'center', 
          marginBottom: '30px',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {user.modelTrained ? (
          <>
            Welcome back to Face Academy! 🎓
            <br />
            Let&apos;s see if I still remember you, <strong>{user.username}</strong>! 
          </>
        ) : (
          <>
            Time for the moment of truth! 🎯
            <br />
            Let&apos;s test if the AI learned to recognize <strong>{user.username}</strong>!
          </>
        )}
      </motion.p>

      {isTestingInProgress && (
        <motion.div
          className="recognition-result"
          style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: '#fff'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="loading-spinner" style={{ margin: '20px auto' }}></div>
          <div>🧠 Analyzing your face...</div>
          <small style={{ opacity: 0.8, marginTop: '10px', display: 'block' }}>
            Comparing features • Calculating similarity • Processing...
          </small>
        </motion.div>
      )}

      {resultData && !isTestingInProgress && (
        <motion.div
          className={`recognition-result ${resultData.className}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>
            {resultData.title}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>
            {resultData.message}
          </div>
          
          {/* Confidence meter */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
              Confidence Level:
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <motion.div
                style={{
                  height: '100%',
                  background: testResult ? 
                    'linear-gradient(90deg, #4CAF50, #81C784)' : 
                    'linear-gradient(90deg, #f44336, #ef5350)',
                  borderRadius: '4px'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${confidence * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ marginTop: '30px' }}
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
          onClick={startRecognitionTest}
          disabled={isTestingInProgress}
          whileHover={!isTestingInProgress ? { scale: 1.05 } : {}}
          whileTap={!isTestingInProgress ? { scale: 0.95 } : {}}
          style={{ 
            marginTop: '20px',
            background: isTestingInProgress ? 
              'linear-gradient(45deg, #666, #888)' : 
              'linear-gradient(45deg, #4CAF50, #81C784)'
          }}
        >
          {isTestingInProgress ? '🔍 Testing...' : '🎯 Start Recognition Test'}
        </motion.button>

        {testResult !== null && (
          <motion.div
            style={{ marginTop: '30px', textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="action-buttons">
              <motion.button
                className="action-button"
                onClick={startRecognitionTest}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Test Again
              </motion.button>
              
              <motion.button
                className="action-button secondary"
                onClick={onStartNewSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎓 Back to Academy
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        style={{ 
          marginTop: '25px', 
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>💡 <strong>Tips for better recognition:</strong></p>
        <p>• Use similar lighting as during training</p>
        <p>• Face the camera directly</p>
        <p>• Remove glasses if you didn&apos;t wear them during training</p>
      </motion.div>
    </motion.div>
  );
};

export default RecognitionTest;
