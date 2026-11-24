import React from 'react';
import { DemoFrameState } from '../utils/demoTimeline';

interface DemoOverlayProps {
  frame: DemoFrameState;
}

export const DemoOverlay: React.FC<DemoOverlayProps> = ({ frame }) => {
  const { cursor, ripple } = frame;

  return (
    <div
      aria-hidden="true"
      data-testid="demo-overlay"
      className="pointer-events-none absolute inset-0 z-[100] overflow-hidden"
    >
      {/* Expanding click ripple */}
      {ripple.active && (
        <>
          <div
            data-testid="demo-ripple"
            className="absolute rounded-full border-2 border-[#181715]"
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              width: `${22 + ripple.progress * 78}px`,
              height: `${22 + ripple.progress * 78}px`,
              transform: 'translate(-50%, -50%)',
              opacity: Math.max(0, 1 - ripple.progress) * 0.75,
            }}
          />
          <div
            className="absolute rounded-full bg-[#181715]"
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              width: `${10 + ripple.progress * 32}px`,
              height: `${10 + ripple.progress * 32}px`,
              transform: 'translate(-50%, -50%)',
              opacity: Math.max(0, 1 - ripple.progress * 1.4) * 0.24,
            }}
          />
        </>
      )}

      {/* Crisp Editorial Pointer Cursor */}
      {cursor.visible && (
        <div
          data-testid="demo-cursor"
          className="absolute"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: `translate(-3px, -3px) scale(${cursor.pressing ? 0.88 : 1})`,
            transformOrigin: '3px 3px',
            filter: 'drop-shadow(0 4px 10px rgba(24, 23, 21, 0.28))',
          }}
        >
          <svg
            width="30"
            height="34"
            viewBox="0 0 30 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 2.5L26 17.2L15.4 19.3L10.3 29.8L3 2.5Z"
              fill="#181715"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
