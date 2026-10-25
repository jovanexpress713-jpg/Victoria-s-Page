import React, { useEffect, useState } from 'react';

export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total > 0) {
        setProgress((doc.scrollTop / total) * 100);
      } else {
        setProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="reading-progress-bar"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
};
