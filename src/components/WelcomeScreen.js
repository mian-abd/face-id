import React from 'react';
import { motion } from 'framer-motion';

const WelcomeScreen = ({ onStart }) => {
  return (
    <motion.div 
      className="welcome-screen"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="welcome-title pulse-effect"
        animate={{ textShadow: [
          "0 0 30px rgba(255, 215, 0, 0.5)",
          "0 0 50px rgba(255, 215, 0, 0.8)",
          "0 0 30px rgba(255, 215, 0, 0.5)"
        ]}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎓 FACE ACADEMY
      </motion.div>
      
      <motion.p 
        className="welcome-subtitle"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Welcome to the future of personalized AI! 🚀
        <br />
        <strong>YOU</strong> become the teacher, and AI becomes your student.
        <br />
        Train your personal face recognition model in just minutes!
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '20px' }}>
          ✨ How It Works:
        </h3>
        <div style={{ textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '30px' }}>
          <p>🎯 <strong>Step 1:</strong> Tell us your name</p>
          <p>📸 <strong>Step 2:</strong> Take 10 training selfies</p>
          <p>🧠 <strong>Step 3:</strong> Watch AI learn YOUR face</p>
          <p>🎉 <strong>Step 4:</strong> Get instant recognition!</p>
        </div>
      </motion.div>

      <motion.button
        className="start-button"
        onClick={onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
      >
        🚀 Start My AI Journey
      </motion.button>

      <motion.div
        style={{ 
          marginTop: '30px', 
          fontSize: '0.9rem', 
          color: 'rgba(255, 255, 255, 0.7)' 
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <p>
          🔬 Powered by Siamese Neural Networks
          <br />
          📄 Based on <a 
            href="https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#ffd700', textDecoration: 'none' }}
          >
            CMU Research Paper
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
