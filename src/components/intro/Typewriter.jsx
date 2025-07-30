import React, { useState, useEffect } from 'react';

export default function Typewriter({ text, speed = 60, dramatic = false, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let timeoutId;

    const type = (fullText, index) => {
      if (index < fullText.length) {
        setDisplayedText(fullText.substring(0, index + 1));
        timeoutId = setTimeout(() => type(fullText, index + 1), speed);
      } else {
        if (onComplete) onComplete();
      }
    };

    if (dramatic) {
      const words = text.split(' ');
      let currentText = '';
      let wordIdx = 0;

      const typeWord = () => {
        if (wordIdx >= words.length) {
          if (onComplete) onComplete();
          return;
        }

        let charIdx = 0;
        const currentWord = words[wordIdx];
        const typeChar = () => {
          if (charIdx < currentWord.length) {
            currentText += currentWord[charIdx];
            setDisplayedText(currentText);
            charIdx++;
            timeoutId = setTimeout(typeChar, speed);
          } else {
            // Word finished
            wordIdx++;
            if (wordIdx < words.length) {
              currentText += ' ';
              setDisplayedText(currentText);
              timeoutId = setTimeout(typeWord, 800); // Pause between words
            } else {
              if (onComplete) onComplete();
            }
          }
        };
        typeChar();
      };
      typeWord();
    } else {
      type(text, 0);
    }

    return () => clearTimeout(timeoutId);
  }, [text, speed, dramatic, onComplete]);

  return <span>{displayedText}</span>;
}