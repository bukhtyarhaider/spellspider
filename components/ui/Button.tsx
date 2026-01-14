import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "success"
  | "outline";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-400 dark:hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 border border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
  secondary:
    "bg-white dark:bg-slate-800/70 backdrop-blur-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
  danger:
    "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 dark:from-red-500 dark:to-red-600 text-white shadow-lg shadow-red-500/30 dark:shadow-red-500/20 border border-red-500/50 hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
  success:
    "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 text-white shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/20 border border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
  ghost:
    "bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700",
  outline:
    "bg-transparent border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-700 dark:hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled,
  fullWidth = false,
  className = "",
  children,
  ...props
}) => {
  const IconElement = loading ? (
    <Loader2 size={size === "lg" ? 18 : 16} className="animate-spin" />
  ) : icon ? (
    <span className="flex-shrink-0">{icon}</span>
  ) : null;

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 
        font-semibold rounded-xl 
        transition-all duration-200 transform 
        disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {iconPosition === "left" && IconElement}
      <span className="truncate">{children}</span>
      {iconPosition === "right" && !loading && IconElement}
    </button>
  );
};
