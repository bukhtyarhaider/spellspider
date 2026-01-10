import React from "react";
import { Bug, Sparkles, Github, ExternalLink } from "lucide-react";
import { APP_CONFIG } from "../constants";
import { ThemeToggle } from "./ui/ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200">
      {/* Premium Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-indigo-100/50 dark:border-indigo-500/10 shadow-sm dark:shadow-none supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-full" />
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform group-hover:scale-105 transition-all duration-300 ring-1 ring-white/20">
                <Bug size={20} className="stroke-[2.5px]" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 group-hover:to-indigo-500 transition-all duration-300">
                {APP_CONFIG.name}
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                AI Auditor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <a
              href="https://github.com/bukhtyarhaider/spellspider"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <Github size={18} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow relative z-0 pt-20">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          {/* Primary Top Left Glow */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
          {/* Secondary Bottom Right Glow */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-violet-500/10 to-transparent dark:from-violet-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
          {/* Grain Texture (Optional, adds nice detailed feel) */}
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        {children}
      </main>

      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                © {new Date().getFullYear()} {APP_CONFIG.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-md">
                {APP_CONFIG.description}
              </p>
            </div>

            <div className="flex items-center gap-8">
              {["Features", "Privacy", "Terms"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
