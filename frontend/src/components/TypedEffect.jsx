import React, { useState, useEffect } from 'react';

/**
 * TypedEffect component — animates text as if being typed with a blinking teal cursor
 */
const TypedEffect = ({ text, speed = 50, startDelay = 300 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (displayedText === text) {
      setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) => {
        const nextText = text.slice(0, prev.length + 1);
        if (nextText === text) setIsComplete(true);
        return nextText;
      });
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, text, speed]);

  return (
    <span className="inline-block">
      {displayedText}
      {!isComplete && (
        <span className="inline-block ml-1 w-0.5 h-[1em] bg-[var(--color-primary)] animate-pulse" />
      )}
    </span>
  );
};

export default TypedEffect;
