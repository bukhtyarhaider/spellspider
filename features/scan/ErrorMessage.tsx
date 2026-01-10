import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex flex-col items-center justify-center gap-2 animate-fade-in border border-red-100">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle size={16} />
        {message}
      </div>
    </div>
  );
};
