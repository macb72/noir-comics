import { useState, useEffect, useRef } from 'react';

export default function TypewriterText({ text, delay = 0, speed = 30 }) {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayText('');
    setStarted(false);
    setDone(false);
    indexRef.current = 0;

    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!started || done) return;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayText(text.slice(0, indexRef.current));
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [started, done, text, speed]);

  return (
    <span>
      {displayText}
      {!done && started && <span className="typewriter-cursor">|</span>}
    </span>
  );
}
