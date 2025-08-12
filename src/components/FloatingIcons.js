import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Camera, 
  Zap, 
  Target, 
  Sparkles, 
  Eye, 
  Cpu, 
  Lightbulb,
  Rocket,
  Star
} from 'lucide-react';

const FloatingIcons = ({ stage = 'welcome' }) => {
  const iconSets = {
    welcome: [
      { Icon: Brain, color: '#ffd700', delay: 0 },
      { Icon: Sparkles, color: '#667eea', delay: 0.5 },
      { Icon: Rocket, color: '#ff6b6b', delay: 1 },
      { Icon: Star, color: '#4CAF50', delay: 1.5 },
    ],
    training: [
      { Icon: Camera, color: '#ffd700', delay: 0 },
      { Icon: Eye, color: '#667eea', delay: 0.3 },
      { Icon: Target, color: '#ff6b6b', delay: 0.6 },
      { Icon: Zap, color: '#4CAF50', delay: 0.9 },
    ],
    recognition: [
      { Icon: Cpu, color: '#ffd700', delay: 0 },
      { Icon: Brain, color: '#667eea', delay: 0.4 },
      { Icon: Lightbulb, color: '#ff6b6b', delay: 0.8 },
      { Icon: Sparkles, color: '#4CAF50', delay: 1.2 },
    ],
  };

  const icons = iconSets[stage] || iconSets.welcome;

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const iconVariants = {
    initial: { 
      scale: 0, 
      rotate: -180, 
      opacity: 0 
    },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 0.8,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  const positions = [
    { top: '15%', left: '10%' },
    { top: '25%', right: '15%' },
    { bottom: '30%', left: '20%' },
    { bottom: '20%', right: '10%' },
    { top: '50%', left: '5%' },
    { top: '40%', right: '5%' },
  ];

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {icons.map(({ Icon, color, delay }, index) => (
        <motion.div
          key={`${stage}-${index}`}
          style={{
            position: 'absolute',
            ...positions[index % positions.length],
          }}
          variants={iconVariants}
          animate={{
            ...floatingAnimation,
            transition: {
              ...floatingAnimation.transition,
              delay: delay + index * 0.5,
            },
          }}
        >
          <motion.div
            style={{
              background: `linear-gradient(135deg, ${color}40, ${color}20)`,
              borderRadius: '50%',
              padding: '15px',
              backdropFilter: 'blur(10px)',
              border: `2px solid ${color}30`,
              boxShadow: `0 10px 30px ${color}20`,
            }}
            whileHover={{
              scale: 1.2,
              boxShadow: `0 15px 40px ${color}40`,
              transition: { duration: 0.3 },
            }}
          >
            <Icon
              size={24}
              style={{
                color: color,
                filter: `drop-shadow(0 0 10px ${color}80)`,
              }}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Additional ambient particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: '#ffd700',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
};

export default FloatingIcons;
