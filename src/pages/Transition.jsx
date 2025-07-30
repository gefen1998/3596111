import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from '../components/intro/Typewriter';

const diagramUrl = 'https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/fixed.svg';

const additionalSentences = [
  { text: "It's time to look closer.", duration: 6500, speed: 80 },
  { text: "I want you to think of a moment that still lives in you.", duration: 7000, speed: 80 },
  { text: "You can close your eyes if you need to.", duration: 6500, speed: 80 },
  { text: "When you're ready...", duration: 6000, speed: 80 },
  { text: "What was the first thing you thought about?", duration: 0, speed: 80 },
];

export default function TransitionPage() {
  const [showText, setShowText] = useState(false);
  const [zoomStage, setZoomStage] = useState('idle');
  const [showAdditionalText, setShowAdditionalText] = useState(false);
  const [additionalIndex, setAdditionalIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);

    const zoomInTimer = setTimeout(() => {
      setZoomStage('zoomIn');
    }, 2500);

    const zoomOutTimer = setTimeout(() => {
      setZoomStage('zoomOut');
    }, 9000);

    const additionalTextTimer = setTimeout(() => {
      setShowAdditionalText(true);
    }, 13000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(zoomInTimer);
      clearTimeout(zoomOutTimer);
      clearTimeout(additionalTextTimer);
    };
  }, []);

  useEffect(() => {
    if (!showAdditionalText) return;
    if (additionalIndex < additionalSentences.length - 1) {
      const timer = setTimeout(() => setAdditionalIndex(i => i + 1), additionalSentences[additionalIndex].duration);
      return () => clearTimeout(timer);
    }
  }, [additionalIndex, showAdditionalText]);

  const handleAdditionalTypewriterComplete = useCallback(() => {
    if (additionalIndex === additionalSentences.length - 1) {
      setTimeout(() => {
        navigate(createPageUrl('Welcome'));
      }, 4000);
    }
  }, [additionalIndex, navigate]);

  const svgVariants = {
    idle: { scale: 1, x: '0%', y: '0%' },
    zoomIn: { scale: 5, x: '15%', y: '5%' },
    zoomOut: { scale: 1, x: '0%', y: '0%' },
  };

  return (
    <div className="flex flex-col h-screen text-center px-6 py-16 overflow-hidden" style={{ backgroundColor: '#1F1F1E' }}>
       {/* Upper part for the visual, takes 3 parts of the space */}
      <div className="flex-[3] flex items-center justify-center w-full relative">
        <motion.div
          className="relative w-full h-full max-h-[70vh] max-w-[70vw] mx-auto"
          initial="idle"
          animate={zoomStage}
          variants={svgVariants}
          transition={{ 
            duration: zoomStage === 'zoomIn' ? 3 : 2.5, 
            ease: "easeInOut" 
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.img
            src={diagramUrl}
            alt="Neural network diagram"
            className="relative z-10 w-full h-full object-contain"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0.9 }}
          />
        </motion.div>
      </div>

       {/* Lower part for the dialogue, takes 2 parts of the space */}
      <div className="flex-[2] w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {showText && !showAdditionalText && (
            <motion.div
              key="first-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto flex flex-col items-center"
            >
              <div className="flex items-center justify-center min-h-[4rem]">
                <div 
                  className="px-8 py-4 rounded-2xl"
                  style={{
                    background: 'rgba(31, 31, 30, 0.85)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="text-2xl font-normal text-white tracking-wide leading-relaxed whitespace-nowrap">
                    <Typewriter
                      text="Every circle in this map is something you've been through."
                      speed={80}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {showAdditionalText && (
            <motion.div
              key="additional-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto flex flex-col items-center"
            >
              <div className="flex items-center justify-center min-h-[4rem]">
                <div className="text-2xl font-normal text-gray-300 tracking-wide leading-relaxed text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={additionalIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Typewriter
                        text={additionalSentences[additionalIndex].text}
                        onComplete={handleAdditionalTypewriterComplete}
                        speed={additionalSentences[additionalIndex].speed}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}