import React from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "white";
  label?: string;
  centered?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const variantStyles = {
  primary: "text-indigo-600 dark:text-indigo-400",
  secondary: "text-slate-600 dark:text-slate-400",
  white: "text-white",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "primary",
  label,
  centered = false,
  className = "",
}) => {
  const content = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Loader2
        size={sizeMap[size]}
        className={`animate-spin ${variantStyles[variant]}`}
      />
      {label && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {content}
      </div>
    );
  }

  return content;
};

interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  label = "Loading...",
  blur = true,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        blur ? "backdrop-blur-sm" : ""
      } bg-slate-900/20 dark:bg-slate-900/40 animate-fade-in`}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <Spinner size="xl" variant="primary" />
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          {label}
        </p>
      </div>
    </div>
  );
};
