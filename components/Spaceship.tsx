
import React from 'react';
import { Velocity } from '../types';

interface SpaceshipProps {
  velocity: Velocity; // Kept for engine glow calculation
  rotation: number;   // Explicit rotation from game loop
}

const Spaceship: React.FC<SpaceshipProps> = ({ velocity, rotation }) => {
  // Determine if thrusting for engine glow (approximate based on velocity magnitude for visual effect)
  // In a real engine, we'd pass "isThrusting" state, but checking velocity magnitude is a decent proxy for drift vs accel
  // OR we can check if velocity is significant, but engine glow usually only happens when key is pressed.
  // Since we don't pass key state here, we'll leave the glow always slightly active or based on speed.
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  const hasSpeed = speed > 0.0000005;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
         style={{ 
           transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
           transition: 'transform 0.05s linear' // Faster update for responsive rotation
         }}
    >
        {/* Asteroids Style Wireframe 'A' - Reduced Size */}
        <svg 
            width="40" 
            height="40" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]"
        >
            {/* The 'A' Frame */}
            <path 
                d="M24 4L8 44L24 34L40 44L24 4Z" 
                className="stroke-white stroke-[1.5] fill-black/20"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* The Crossbar */}
            <line 
                x1="14" y1="31" 
                x2="34" y2="31" 
                className="stroke-white stroke-[1.5]" 
            />
            
            {/* Engine Flame (visible when moving fast enough to imply recent thrust) */}
            <path 
                d="M20 38L24 46L28 38" 
                className={`fill-white transition-opacity duration-200 ${hasSpeed ? 'opacity-100' : 'opacity-0'}`}
            />
        </svg>
    </div>
  );
};

export default Spaceship;
