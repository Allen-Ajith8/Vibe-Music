import React, { useState, useEffect, useRef } from 'react';

const ScrollingText = ({ text, className = "", speed = 10, enableScroll = true }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  const displayText = text || "";

  useEffect(() => {
    if (enableScroll && containerRef.current && textRef.current) {
      const isOverflowing = textRef.current.scrollWidth > containerRef.current.offsetWidth;
      setShouldScroll(isOverflowing);
    } else {
      setShouldScroll(false);
    }
  }, [displayText, enableScroll]);

  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden relative ${shouldScroll ? 'side-fade' : ''} ${className}`}
      style={{ width: '100%' }}
    >
      <div 
        ref={textRef}
        className={`${shouldScroll ? 'animate-scroll' : 'truncate'}`}
        style={{ 
          animationDuration: shouldScroll ? `${Math.max(displayText.length * 0.5, 10)}s` : '0s',
          display: shouldScroll ? 'inline-block' : 'block'
        }}
      >
        {displayText}
        {shouldScroll && <span className="ml-[20%]">{displayText}</span>}
      </div>
    </div>
  );
};

export default ScrollingText;
