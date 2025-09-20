'use client';

import { useState, useEffect } from 'react';

const CosmicBackground = () => {
  const [stars, setStars] = useState<
    { x: number; y: number; size: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 150 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 10,
        duration: Math.random() * 5 + 5,
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  return (
    <div className="fixed top-0 left-0 -z-50 h-full w-full overflow-hidden bg-background">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute animate-pulse rounded-full bg-accent/50"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: `0 0 ${star.size * 2}px ${star.size}px hsla(var(--accent), 0.3)`,
          }}
        />
      ))}
    </div>
  );
};

export default CosmicBackground;
