import React from "react";
import { Sparkles } from "lucide-react";
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
    <div className="max-w-3xl mx-auto mb-16 text-center transition-all duration-700 ease-out">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in shadow-sm hover:shadow-md transition-shadow">
        <Sparkles size={14} className="animate-pulse" />
        AI-Powered Content Audit
      </div>

      <h2 className="text-5xl sm:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight animate-slide-up leading-tight">
        Refine Your <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 animate-gradient-x bg-[length:200%_auto]">
          Digital Presence
        </span>
      </h2>

      <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up [animation-delay:100ms]">
        Instant, professional analysis of spelling, grammar, tone, and style for
        your website. Powered by Gemini AI.
      </p>

      <div className="flex flex-col gap-6 animate-slide-up [animation-delay:200ms]">
        <div className="transform hover:scale-[1.01] transition-transform duration-300">
          <UrlInput
            urlInput={urlInput}
            onUrlChange={onUrlChange}
            onDiscover={onDiscover}
            onReset={onReset}
            step={step}
          />
        </div>

        {discoveryProgress && step === "discovering" && (
          <Alert variant="info" className="animate-pulse">
            <div className="flex items-center gap-3">
              <Spinner size="sm" variant="primary" />
              <div className="text-left">
                <p className="font-semibold">Discovering pages...</p>
                <p className="text-xs mt-1 opacity-90">{discoveryProgress}</p>
              </div>
            </div>
          </Alert>
        )}

        {errorDetails && <ErrorMessage message={errorDetails} />}
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 text-left">
        {[
          {
            icon: "🎯",
            title: "Precise Analysis",
            desc: "AI-powered detection of grammar, spelling, and style issues",
          },
          {
            icon: "⚡",
            title: "Lightning Fast",
            desc: "Scan multiple pages in seconds with concurrent processing",
          },
          {
            icon: "📊",
            title: "Detailed Reports",
            desc: "Export professional PDF reports with insights and fixes",
          },
        ].map((feature, idx) => (
          <Card
            key={idx}
            variant="glass"
            hover
            className="p-5 animate-slide-up"
            style={{ animationDelay: `${300 + idx * 100}ms` } as any}
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {feature.desc}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
