import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  variant?: "default" | "bordered" | "glass" | "gradient";
  onClick?: () => void;
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

const variantStyles = {
  default:
    "bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm",
  bordered:
    "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-md",
  glass:
    "bg-white/50 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 shadow-xl",
  gradient:
    "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg",
};

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  hover = false,
  variant = "default",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${
          hover
            ? "hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200/60 dark:hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            : "transition-all duration-200"
        }
        ${paddingStyles[padding]}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div
      className={`border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 ${className}`}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <h3
      className={`text-lg font-bold text-slate-900 dark:text-slate-100 ${className}`}
    >
      {children}
    </h3>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
};
