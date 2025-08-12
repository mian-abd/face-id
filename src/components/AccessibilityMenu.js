import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, Type, Contrast, Volume2 } from 'lucide-react';
import useAccessibility from '../hooks/useAccessibility';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isHighContrast,
    fontSize,
    toggleHighContrast,
    changeFontSize,
    announce,
    getButtonProps,
  } = useAccessibility();

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
    announce(isOpen ? 'Accessibility menu closed' : 'Accessibility menu opened');
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small', size: '0.9rem' },
    { value: 'normal', label: 'Normal', size: '1rem' },
    { value: 'large', label: 'Large', size: '1.2rem' },
    { value: 'xl', label: 'Extra Large', size: '1.4rem' },
  ];

  return (
    <>
      {/* Accessibility Button */}
      <motion.button
        {...getButtonProps(handleToggleMenu, 'Open accessibility menu')}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isOpen}
      >
        <Settings size={24} />
      </motion.button>

      {/* Accessibility Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleToggleMenu}
            />

            {/* Menu Panel */}
            <motion.div
              style={{
                position: 'fixed',
                top: '100px',
                right: '20px',
                width: '320px',
                maxHeight: '70vh',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                zIndex: 1001,
                color: '#333',
                overflow: 'hidden',
              }}
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="dialog"
              aria-labelledby="accessibility-menu-title"
              aria-modal="true"
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                }}
              >
                <h2
                  id="accessibility-menu-title"
                  style={{
                    margin: 0,
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Eye size={24} />
                  Accessibility Settings
                </h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                  Customize your viewing experience
                </p>
              </div>

              {/* Content */}
              <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                {/* High Contrast Toggle */}
                <div style={{ marginBottom: '25px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                      htmlFor="high-contrast-toggle"
                    >
                      <Contrast size={20} />
                      High Contrast
                    </label>
                    
                    <motion.button
                      id="high-contrast-toggle"
                      {...getButtonProps(
                        toggleHighContrast,
                        `${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`
                      )}
                      style={{
                        position: 'relative',
                        width: '50px',
                        height: '28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: isHighContrast
                          ? 'linear-gradient(45deg, #4CAF50, #81C784)'
                          : '#ccc',
                        cursor: 'pointer',
                        transition: 'background 0.3s',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: '2px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '12px',
                          background: '#fff',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                        animate={{
                          x: isHighContrast ? 24 : 2,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                    Increases color contrast for better visibility
                  </p>
                </div>

                {/* Font Size Options */}
                <div style={{ marginBottom: '25px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '15px',
                    }}
                  >
                    <Type size={20} />
                    <span style={{ fontSize: '1rem', fontWeight: '600' }}>Font Size</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {fontSizeOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        {...getButtonProps(
                          () => changeFontSize(option.value),
                          `Set font size to ${option.label}`
                        )}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: `2px solid ${
                            fontSize === option.value ? '#667eea' : 'rgba(0, 0, 0, 0.1)'
                          }`,
                          background: fontSize === option.value ? 'rgba(102, 126, 234, 0.1)' : '#fff',
                          color: fontSize === option.value ? '#667eea' : '#333',
                          fontSize: option.size,
                          fontWeight: fontSize === option.value ? '600' : '400',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Keyboard Shortcuts Info */}
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>⌨️</span>
                    <span style={{ fontSize: '1rem', fontWeight: '600' }}>Keyboard Shortcuts</span>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4' }}>
                    <p style={{ margin: '5px 0' }}>• <kbd>Tab</kbd> - Navigate between elements</p>
                    <p style={{ margin: '5px 0' }}>• <kbd>Enter</kbd> or <kbd>Space</kbd> - Activate buttons</p>
                    <p style={{ margin: '5px 0' }}>• <kbd>Esc</kbd> - Close dialogs</p>
                    <p style={{ margin: '5px 0' }}>• <kbd>Alt + A</kbd> - Open accessibility menu</p>
                  </div>
                </div>

                {/* Screen Reader Info */}
                <div
                  style={{
                    padding: '15px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <Volume2 size={18} />
                    <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Screen Reader Ready</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                    This app is optimized for screen readers with proper ARIA labels and
                    announcements.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '15px 20px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  background: 'rgba(0, 0, 0, 0.02)',
                  textAlign: 'center',
                }}
              >
                <button
                  {...getButtonProps(handleToggleMenu, 'Close accessibility menu')}
                  style={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityMenu;
