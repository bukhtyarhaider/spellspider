import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  size?: "sm" | "md";
  variant?: "default" | "minimal";
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className = "",
  size = "md",
  variant = "default",
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs pr-7",
    md: "px-3 py-2 text-sm pr-8",
  };

  const variantStyles = {
    default:
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
    minimal:
      "bg-slate-100 dark:bg-slate-800 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700",
  };

  return (
    <div className={label ? "w-full" : "inline-block"}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            appearance-none cursor-pointer
            rounded-lg border
            text-slate-700 dark:text-slate-200
            font-medium
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400
            outline-none transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeStyles[size]}
            ${variantStyles[variant]}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={size === "sm" ? 12 : 14}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
        />
      </div>
    </div>
  );
};
