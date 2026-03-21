import React, { useEffect, useState } from 'react';

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
    <div className="flex flex-col items-center justify-center p-12 space-y-12">
      {/* Refined Geometric Spinner */}
      <div className="relative w-32 h-32">
        {/* Core pulsing center */}
        <div className="absolute inset-0 m-auto w-10 h-10 bg-blue-600 rounded-full animate-pulse shadow-[0_0_30px_rgba(37,99,235,0.4)] z-10"></div>
        
        {/* Orbiting rings */}
        <div className="absolute inset-0 rounded-full border-b-2 border-l-2 border-blue-500/80 animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-indigo-500/90 animate-[spin_2s_linear_infinite_reverse]"></div>
        <div className="absolute inset-5 rounded-full border-b-2 border-blue-400/60 animate-[spin_4s_ease-in-out_infinite]"></div>
        
        {/* Floating AI Dots */}
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-indigo-500 animate-ping`}
            style={{
              top: `${50 + 40 * Math.sin(i * 2)}%`,
              left: `${50 + 40 * Math.cos(i * 2)}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Dynamic Status Text */}
      <div className="flex flex-col items-center space-y-4">
        <h3 className="font-outfit font-black text-2xl tracking-tighter text-slate-900 bg-clip-text">
          Processing Analysis
        </h3>
        
        <div className="h-6 relative overflow-hidden w-64 text-center">
          {messages.map((msg, idx) => (
            <p
              key={idx}
              className={`absolute inset-0 w-full text-slate-500 text-sm font-bold tracking-wide transition-all duration-500 ease-in-out ${
                idx === msgIdx 
                  ? 'opacity-100 translate-y-0' 
                  : idx < msgIdx 
                    ? 'opacity-0 -translate-y-full' 
                    : 'opacity-0 translate-y-full'
              }`}
            >
              {msg}
            </p>
          ))}
        </div>
        
        {/* Progress Bar placeholder */}
        <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-blue-600 rounded-full w-2/3 animate-[pulse_2s_ease-in-out_infinite] origin-left"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
