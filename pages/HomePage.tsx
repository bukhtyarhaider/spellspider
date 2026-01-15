import React from "react";
import { Sparkles, ScanSearch, Zap, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { UrlInput } from "../features/scan/UrlInput";
import { ErrorMessage } from "../features/scan/ErrorMessage";
import { Card, Alert, Spinner } from "../components/ui";

interface HomePageProps {
  urlInput: string;
  onUrlChange: (url: string) => void;
  onDiscover: () => void;
  onReset: () => void;
  step: "input" | "discovering" | "selection";
  discoveryProgress?: string;
  errorDetails?: string | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  urlInput,
  onUrlChange,
  onDiscover,
  onReset,
  step,
  discoveryProgress,
  errorDetails,
}) => {
  return (
    <div className="max-w-4xl mx-auto mb-20 text-center transition-all duration-700 ease-out">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-indigo-500/10">
        <Sparkles size={14} className="animate-pulse text-indigo-500" />
        <span>AI-Powered Content Audit</span>
      </div>

      <h2 className="text-6xl sm:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
        Perfect Your <br />
        <span className="relative inline-block">
          <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 blur opacity-30 dark:opacity-50" />
          <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
            Digital Presence
          </span>
        </span>
      </h2>

      <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
        Instant, professional analysis of spelling, grammar, tone, and style.
        <br className="hidden sm:block" /> Powered by advanced Gemini AI.
      </p>

      <div className="flex flex-col gap-8 max-w-2xl mx-auto mb-20 relative z-10">
        <div className="transform transition-all duration-300 hover:scale-[1.01]">
          <UrlInput
            urlInput={urlInput}
            onUrlChange={onUrlChange}
            onDiscover={onDiscover}
            onReset={onReset}
            step={step}
          />
        </div>

        {discoveryProgress && step === "discovering" && (
          <Alert variant="info" className="animate-in fade-in slide-in-from-bottom-2 duration-300 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                <Spinner size="sm" variant="primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Scanning Site Structure...</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{discoveryProgress}</p>
              </div>
            </div>
          </Alert>
        )}

        {errorDetails && <ErrorMessage message={errorDetails} />}
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {[
          {
            icon: ScanSearch,
            title: "Precise Analysis",
            desc: "Deep scan for grammar, spelling, and subtle tone inconsistencies.",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            icon: Zap,
            title: "Lightning Fast",
            desc: "Concurrent processing engine scans multiple pages in seconds.",
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
          },
          {
            icon: FileText,
            title: "Detailed Reports",
            desc: "Export comprehensive PDF reports with actionable insights.",
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="group p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <feature.icon size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {feature.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
   
    </div>
  );
};
