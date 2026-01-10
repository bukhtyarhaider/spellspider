// App Configuration
export const APP_CONFIG = {
  name: "SpellSpider",
  description: "AI-driven content analysis",
  maxHistoryItems: 10,
} as const;

// Error Type Configuration
export const ERROR_TYPES = {
  Spelling: {
    bg: "bg-red-50 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800/50",
    color: "#ef4444",
    icon: "bg-red-100 dark:bg-red-900/50",
  },
  Grammar: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
    color: "#f59e0b",
    icon: "bg-amber-100 dark:bg-amber-900/50",
  },
  Style: {
    bg: "bg-sky-50 dark:bg-sky-950/50",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800/50",
    color: "#0ea5e9",
    icon: "bg-sky-100 dark:bg-sky-900/50",
  },
  Clarity: {
    bg: "bg-violet-50 dark:bg-violet-950/50",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800/50",
    color: "#8b5cf6",
    icon: "bg-violet-100 dark:bg-violet-900/50",
  },
  Tone: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700/50",
    color: "#64748b",
    icon: "bg-slate-200 dark:bg-slate-700/50",
  },
} as const;

export const ERROR_TYPE_OPTIONS = Object.keys(ERROR_TYPES) as Array<
  keyof typeof ERROR_TYPES
>;

// Severity Configuration
export const SEVERITY_COLORS = {
  Low: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/50",
    dot: "bg-emerald-500",
  },
  Medium: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
    dot: "bg-amber-500",
  },
  High: {
    bg: "bg-rose-50 dark:bg-rose-950/50",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/50",
    dot: "bg-rose-500",
  },
} as const;

export const SEVERITY_OPTIONS = ["Low", "Medium", "High"] as const;

// Quality Score Thresholds
export const QUALITY_SCORE = {
  excellent: 80,
  good: 50,
  colors: {
    excellent: "text-green-600",
    good: "text-yellow-600",
    poor: "text-red-600",
  },
} as const;

// Chart Colors
export const CHART_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#64748b",
];

// Storage Keys
export const STORAGE_KEYS = {
  history: "spellspider_history",
} as const;

// Scan Modes
export const SCAN_MODES = {
  url: "url",
  text: "text",
} as const;

// Status Messages
export const STATUS_MESSAGES = {
  idle: "Ready",
  crawling: "Crawling...",
  analyzing: "Analyzing...",
  completed: "Completed",
  failed: "Failed",
} as const;
