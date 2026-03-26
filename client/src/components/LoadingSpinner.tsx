import React, { useEffect, useState, useRef } from 'react';

const LoadingSpinner: React.FC = () => {
  const messages = [
    "Analyzing document structures...",
    "Extracting key skills and experience...",
    "Running LLM semantic matching...",
    "Calculating contextual fit scores...",
    "Compiling final hiring insights..."
  ];

  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-12 pt-24 space-y-12">
      {/* Geometric Spinner */}
      <div className="relative w-32 h-32">
        {/* Core pulsing center */}
        <div
          className="absolute inset-0 m-auto w-10 h-10 rounded-full animate-pulse z-10"
          style={{
            background: 'var(--accent-blue)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
          }}
        />

        {/* Orbiting rings */}
        <div
          className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite]"
          style={{ borderBottom: '2px solid var(--accent-blue)', borderLeft: '2px solid var(--accent-blue)' }}
        />
        <div
          className="absolute inset-2 rounded-full animate-[spin_2s_linear_infinite_reverse]"
          style={{ borderTop: '2px solid var(--accent-indigo)', borderRight: '2px solid var(--accent-indigo)' }}
        />
        <div
          className="absolute inset-5 rounded-full animate-[spin_4s_ease-in-out_infinite]"
          style={{ borderBottom: '2px solid var(--accent-purple)' }}
        />

        {/* Floating Dots */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              background: 'var(--accent-indigo)',
              top: `${50 + 40 * Math.sin(i * 2)}%`,
              left: `${50 + 40 * Math.cos(i * 2)}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Status Text */}
      <div className="flex flex-col items-center space-y-4">
        <h3
          className="font-black text-2xl tracking-tighter"
          style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}
        >
          Processing Analysis
        </h3>

        <div className="h-6 relative overflow-hidden w-64 text-center">
          {messages.map((msg, idx) => (
            <p
              key={idx}
              className="absolute inset-0 w-full text-sm font-bold tracking-wide transition-all duration-500 ease-in-out"
              style={{
                color: 'var(--text-secondary)',
                opacity: idx === msgIdx ? 1 : 0,
                transform: idx === msgIdx
                  ? 'translateY(0)'
                  : idx < msgIdx
                    ? 'translateY(-100%)'
                    : 'translateY(100%)',
              }}
            >
              {msg}
            </p>
          ))}
        </div>

        {/* Progress Bar */}
        <ProgressBar />
      </div>
    </div>
  );
};

const ProgressBar: React.FC = () => {
  const [width, setWidth] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setWidth((prev) => {
        if (prev >= 95) {
          // Slow down near the end
          return prev + 0.1;
        }
        // Ease-out progression
        return prev + (100 - prev) * 0.02;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className="w-48 h-1.5 rounded-full overflow-hidden mt-4"
      style={{ background: 'var(--border-primary)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-200 ease-out"
        style={{
          background: 'var(--accent-blue)',
          width: `${Math.min(width, 98)}%`,
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
