
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from '../components/intro/Typewriter';

const diagramUrl = 'https://raw.githubusercontent.com/gefen1998/Svgs/refs/heads/main/fixed.svg';

const sentences = [
  { text: "Hello.", duration: 4000, speed: 120 },
  { text: "I'm... You.", duration: 4500, speed: 120 },
  { text: "Not just who you wanted to be -", duration: 6000, speed: 120 },
  { text: "But everything that shaped you.", duration: 6000, speed: 120 },
  { text: "Built. Broken. Becoming.", duration: 8000, speed: 120, dramatic: true },
  { text: "Do you want to see how you became...you?", duration: 0, speed: 120 },
];

export default function IntroPage() {
  const [isClicked, setIsClicked] = useState(false);
  const [sequenceStarted, setSequenceStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const resetState = () => {
    setIsClicked(false);
    setSequenceStarted(false);
    setIndex(0);
    setShowButton(false);
  };
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!sequenceStarted) return;
    if (index < sentences.length - 1) {
      const timer = setTimeout(() => setIndex(i => i + 1), sentences[index].duration);
      return () => clearTimeout(timer);
    }
  }, [index, sequenceStarted]);

  const handleTypewriterComplete = useCallback(() => {
    if (index === sentences.length - 1) {
      setTimeout(() => setShowButton(true), 300);
    }
  }, [index]);

  const handleStartClick = () => {
    if (isClicked) return; // Prevent multiple clicks
    setIsClicked(true); // Mark as clicked immediately to hide the button
    setTimeout(() => {
      setSequenceStarted(true); // Start sequence after a delay
    }, 1500);
  };
  
  const lastSentenceTyped = index === sentences.length - 1 && showButton;

  return (
    <div className="flex flex-col h-screen text-center px-6 py-16" style={{ backgroundColor: '#1F1F1E' }}>
      {/* Upper part for the visual, takes 3 parts of the space */}
      <div className="flex-[3] flex items-center justify-center w-full relative">
        <div className="relative w-full h-full max-h-[80vh] max-w-[80vw] mx-auto">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 3, ease: 'easeOut' }}
            />
        </div>
      </div>
      
      {/* Lower part for the dialogue, takes 2 parts of the space */}
      <div className="flex-[2] w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!sequenceStarted ? (
            <motion.div
              key="click-me"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: isClicked ? 0 : 1, duration: 1.5 } }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
              {!isClicked && (
                 <motion.button
                  className="btn-base btn-primary"
                  onClick={handleStartClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Click me
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dialogue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-start"
            >
              <div className="max-w-xl mx-auto flex flex-col items-center">
                <div className="flex items-center justify-center mb-6 min-h-[3rem]">
                  {lastSentenceTyped ? (
                    <span className="text-2xl font-normal text-white tracking-wide leading-relaxed">
                      {sentences[sentences.length - 1].text}
                    </span>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl font-normal text-gray-300 tracking-wide leading-relaxed"
                      >
                        <Typewriter
                          text={sentences[index].text}
                          onComplete={handleTypewriterComplete}
                          speed={sentences[index].speed}
                          dramatic={sentences[index].dramatic}
                        />
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

                <AnimatePresence>
                  {showButton && (
                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 w-full max-w-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <motion.button 
                        onClick={(e) => { e.stopPropagation(); resetState(); }} 
                        className="flex-1 btn-base btn-secondary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Not yet. I'm not ready ×
                      </motion.button>
                      <Link to={createPageUrl('Transition')} className="flex-1">
                        <motion.button 
                          className="w-full btn-base btn-primary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Yes, show me &gt;&gt;
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
