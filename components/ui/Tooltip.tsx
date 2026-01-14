import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 200,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowStyles = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900 dark:border-b-slate-700",
    left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-slate-900 dark:border-l-slate-700",
    right:
      "right-full top-1/2 -translate-y-1/2 -mr-1 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-900 dark:border-r-slate-700",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionStyles[position]} animate-fade-in`}
          role="tooltip"
        >
          <div
            className={`
              bg-slate-900 dark:bg-slate-700 text-white text-sm 
              px-3 py-2 rounded-lg shadow-xl whitespace-nowrap
              ${className}
            `}
          >
            {content}
          </div>
          <div className={`absolute ${arrowStyles[position]}`} />
        </div>
      )}
    </div>
  );
};
