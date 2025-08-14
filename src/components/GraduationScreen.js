import React from 'react';
import { motion } from 'framer-motion';

const GraduationScreen = ({ user, onNewSession, onReset }) => {
  const congratsMessages = [
    `🎉 Congratulations ${user.username}! You've successfully trained your AI!`,
    `🧠 Your personal AI model is now active and ready!`,
    `🎓 Welcome to the Face Academy Hall of Fame!`,
    `⚡ You're now part of the AI revolution!`
  ];

  const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];

  return (
    <motion.div 
      className="graduation-screen"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
    >
      {/* Celebratory Animation */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '4rem',
          zIndex: 10
        }}
        initial={{ y: -100, opacity: 0, rotate: -45 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ 
          duration: 1.2, 
          type: "spring", 
          stiffness: 300,
          delay: 0.5 
        }}
      >
        🎓
      </motion.div>

      <motion.h1 
        className="graduation-title"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        🎉 GRADUATION DAY!
      </motion.h1>

      <motion.div
        className="graduation-message"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <p style={{ fontSize: '1.4rem', marginBottom: '15px' }}>
          {randomMessage}
        </p>
        
        <div style={{ 
          background: 'rgba(255, 215, 0, 0.1)', 
          padding: '20px', 
          borderRadius: '15px',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>
            🏆 Your AI Achievements:
          </h3>
          <div style={{ textAlign: 'left', color: 'rgba(255, 255, 255, 0.9)' }}>
            <p>✅ Completed 10 training photos</p>
            <p>✅ Successfully trained a Siamese Neural Network</p>
            <p>✅ Created your personal face recognition model</p>
            <p>✅ Joined the exclusive Face Academy community</p>
            <p>✅ Learned cutting-edge AI technology</p>
          </div>
        </div>

        <div style={{ 
          fontSize: '1rem', 
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '30px' 
        }}>
          <p>
            🚀 <strong>What&apos;s Next?</strong>
            <br />
            Your AI model is now ready for real-time face recognition!
            <br />
            Test it out, share with friends, or train a new model.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="action-buttons"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <motion.button
          className="action-button"
          onClick={onNewSession}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔍 Test Recognition Again
        </motion.button>
        
        <motion.button
          className="action-button secondary"
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🆕 Train New Model
        </motion.button>
      </motion.div>

      {/* Social Share Section */}
      <motion.div
        style={{ 
          marginTop: '40px', 
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '15px',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        <h4 style={{ color: '#fff', marginBottom: '15px' }}>
          📱 Share Your Success!
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontSize: '0.9rem',
          marginBottom: '15px' 
        }}>
          Tell the world you&apos;ve mastered AI face recognition!
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            style={{
              background: 'linear-gradient(45deg, #1DA1F2, #1a91da)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              const text = `🎓 I just graduated from Face Academy! Trained my own AI to recognize my face using Siamese Neural Networks. Check it out! #FaceAcademy #AI #MachineLearning`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }}
          >
            🐦 Tweet
          </motion.button>
          
          <motion.button
            style={{
              background: 'linear-gradient(45deg, #4267B2, #365899)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              const url = window.location.href;
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            }}
          >
            📘 Share
          </motion.button>
          
          <motion.button
            style={{
              background: 'linear-gradient(45deg, #0077B5, #005885)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              const text = `I just trained my own AI to recognize my face! Check out Face Academy - where YOU become the AI teacher.`;
              const url = window.location.href;
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank');
            }}
          >
            💼 LinkedIn
          </motion.button>
        </div>
      </motion.div>

      {/* Tech Credits */}
      <motion.div
        style={{ 
          marginTop: '30px', 
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.8rem',
          textAlign: 'center',
          lineHeight: '1.4'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.6 }}
      >
        <p>
          🧠 Powered by <strong>Siamese Neural Networks</strong>
          <br />
          📄 Based on <a 
            href="https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#ffd700', textDecoration: 'none' }}
          >
            CMU Research Paper
          </a>
          <br />
          ⚡ Built with <strong>TensorFlow.js</strong> • <strong>React</strong> • <strong>Supabase</strong>
          <br />
          💾 Dataset: <a 
            href="https://www.kaggle.com/datasets/hearfool/vggface2" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#ffd700', textDecoration: 'none' }}
          >
            VGGFace2
          </a>
        </p>
      </motion.div>

      {/* Floating confetti effect */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '-10px',
              left: `${Math.random() * 100}%`,
              fontSize: '20px',
              opacity: 0.7
            }}
            initial={{ y: -50, rotate: 0 }}
            animate={{ 
              y: window.innerHeight + 50, 
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {['🎉', '🎊', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GraduationScreen;
