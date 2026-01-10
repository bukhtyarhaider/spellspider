import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  full: "w-full max-w-md h-full",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  if (!isOpen) return null;

  const isSidePanel = size === "full";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
      <div
        className={`
          bg-white shadow-2xl overflow-y-auto
          animate-fade-in-right
          ${
            isSidePanel
              ? "w-full max-w-md h-full"
              : `${sizeStyles[size]} rounded-xl m-4`
          }
        `}
      >
        {title && (
          <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        )}
        <div className={title ? "" : "p-6"}>{children}</div>
      </div>
    </div>
  );
};
