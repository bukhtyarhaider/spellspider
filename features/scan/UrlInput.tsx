import React from "react";
import { Globe, ArrowRight } from "lucide-react";
import { Input, Button } from "../../components/ui";

type ScanStep = "input" | "discovering" | "selection";

interface UrlInputProps {
  urlInput: string;
  onUrlChange: (url: string) => void;
  onDiscover: () => void;
  onReset: () => void;
  step: ScanStep;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  urlInput,
  onUrlChange,
  onDiscover,
  onReset,
  step,
  disabled = false,
}) => {
  const isInputDisabled = disabled || step !== "input";
  const isStartDisabled = !urlInput || disabled;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step === "input" && !disabled && urlInput) {
      onDiscover();
    }
  };

  return (
    <div
      aria-disabled={disabled}
      className={[
        "group relative z-10 flex gap-2 p-3 rounded-2xl",
        "bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl",
        "border border-indigo-100 dark:border-indigo-500/20",
        "shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/5",
        "transition-all duration-300",
        "ring-4 ring-white/50 dark:ring-slate-800/50",
        disabled
          ? "opacity-60 saturate-50 cursor-not-allowed shadow-none ring-0"
          : "hover:shadow-indigo-500/20",
      ].join(" ")}
    >
      {/* glow */}
      <div
        className={[
          "absolute -inset-0.5 rounded-2xl blur transition duration-500",
          "bg-gradient-to-r from-indigo-500 to-violet-600",
          "opacity-0 dark:opacity-20",
          disabled ? "hidden" : "group-hover:opacity-30",
        ].join(" ")}
      />

      <div className="flex-grow relative z-10">
        <Input
          type="text"
          placeholder="enter website url (e.g., example.com)"
          value={urlInput}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
          className={[
            "text-lg border-0 shadow-none focus:ring-0",
            "dark:bg-transparent",
            isInputDisabled
              ? "text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-600"
              : "text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400",
          ].join(" ")}
          icon={
            <Globe
              size={20}
              className={
                isInputDisabled
                  ? "text-slate-300 dark:text-slate-600"
                  : "text-slate-400 dark:text-slate-500"
              }
            />
          }
        />
      </div>

      {step === "discovering" ? (
        <Button variant="primary" size="lg" loading disabled>
          Scanning...
        </Button>
      ) : step === "selection" ? (
        <Button variant="secondary" size="lg" onClick={onReset} disabled={disabled}>
          Reset
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          onClick={onDiscover}
          disabled={isStartDisabled}
          icon={<ArrowRight size={20} />}
          className={disabled ? "pointer-events-none" : undefined}
        >
          Start
        </Button>
      )}
    </div>
  );
};
