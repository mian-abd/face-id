import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 60, 
  color = '#ffd700', 
  text = 'Loading...', 
  type = 'pulse' 
}) => {
  const spinnerVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity,
      },
    },
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    bounce: {
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const dotVariants = {
    typing: {
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  if (type === 'neural') {
    return (
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            width: size,
            height: size,
            marginBottom: '20px',
          }}
        >
          {/* Neural network nodes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                background: color,
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transformOrigin: `${size / 2}px 0`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeInOut',
              }}
              initial={{
                transform: `rotate(${i * 45}deg) translateY(-${size / 2}px)`,
              }}
            />
          ))}
          
          {/* Central node */}
          <motion.div
            style={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }}
            animate={{
              scale: [1, 1.3, 1],
              boxShadow: [
                '0 0 20px rgba(102, 126, 234, 0.5)',
                '0 0 30px rgba(102, 126, 234, 0.8)',
                '0 0 20px rgba(102, 126, 234, 0.5)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        
        <motion.p
          style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
          }}
          variants={dotVariants}
          animate="typing"
        >
          {text}
        </motion.p>
      </div>
    );
  }

  if (type === 'brain') {
    return (
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <motion.div
          style={{
            fontSize: `${size}px`,
            marginBottom: '15px',
            display: 'inline-block',
          }}
          animate={{
            scale: [1, 1.1, 1],
            textShadow: [
              '0 0 20px rgba(255, 215, 0, 0.5)',
              '0 0 30px rgba(255, 215, 0, 0.8)',
              '0 0 20px rgba(255, 215, 0, 0.5)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🧠
        </motion.div>
        
        <motion.p
          style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
          }}
        >
          {text}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ...
          </motion.span>
        </motion.p>
      </div>
    );
  }

  // Default spinner types
  return (
    <div style={{ textAlign: 'center', color: '#fff' }}>
      <motion.div
        style={{
          width: size,
          height: size,
          border: `4px solid rgba(255, 255, 255, 0.3)`,
          borderTop: `4px solid ${color}`,
          borderRadius: '50%',
          margin: '0 auto 20px',
        }}
        variants={spinnerVariants}
        animate={type}
      />
      
      {text && (
        <motion.p
          style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
