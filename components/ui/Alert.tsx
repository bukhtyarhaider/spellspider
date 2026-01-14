import React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<
  AlertVariant,
  {
    container: string;
    icon: string;
    title: string;
    IconComponent: React.FC<{ size?: number; className?: string }>;
  }
> = {
  info: {
    container:
      "bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50",
    icon: "text-sky-600 dark:text-sky-400",
    title: "text-sky-900 dark:text-sky-300",
    IconComponent: Info,
  },
  success: {
    container:
      "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-900 dark:text-emerald-300",
    IconComponent: CheckCircle2,
  },
  warning: {
    container:
      "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-900 dark:text-amber-300",
    IconComponent: AlertTriangle,
  },
  error: {
    container:
      "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50",
    icon: "text-rose-600 dark:text-rose-400",
    title: "text-rose-900 dark:text-rose-300",
    IconComponent: XCircle,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  icon: customIcon,
  className = "",
}) => {
  const styles = variantStyles[variant];
  const IconComponent = styles.IconComponent;

  return (
    <div
      className={`
        ${styles.container}
        rounded-xl p-4 flex gap-3 animate-fade-in
        ${className}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${styles.icon}`}>
        {customIcon || <IconComponent size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-bold text-sm mb-1 ${styles.title}`}>{title}</h4>
        )}
        <div
          className={`text-sm ${
            variant === "info"
              ? "text-sky-800 dark:text-sky-300"
              : variant === "success"
              ? "text-emerald-800 dark:text-emerald-300"
              : variant === "warning"
              ? "text-amber-800 dark:text-amber-300"
              : "text-rose-800 dark:text-rose-300"
          }`}
        >
          {children}
        </div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
          aria-label="Dismiss alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
