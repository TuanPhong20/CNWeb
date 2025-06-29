import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  animationDuration: number;
  animationDelay: number;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive, duration = 3000 }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const colors = [
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#ec4899', // Pink
  ];

  useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        animationDuration: 2 + Math.random() * 2,
        animationDelay: Math.random() * 0.5,
      }));

      setPieces(newPieces);

      // Clear confetti after duration
      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [isActive, duration]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="confetti-overlay">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            animationDuration: `${piece.animationDuration}s`,
            animationDelay: `${piece.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti; 