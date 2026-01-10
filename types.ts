export interface SpellingError {
  original: string;
  suggestion: string;
  context: string;
  type: 'Spelling' | 'Grammar' | 'Style' | 'Clarity' | 'Tone';
  severity: 'Low' | 'Medium' | 'High';
  explanation?: string;
  id?: string; // Unique ID for tracking in checklist
}

export interface PageScanResult {
  url: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors: SpellingError[];
  scannedAt: string;
  wordCount: number;
  score?: number; // 0-100 Quality Score
  summary?: string; // Editorial summary
}

export interface CrawlStats {
  pagesScanned: number;
  totalErrors: number;
  startTime: number;
  duration: number;
}

export interface SavedReport {
  id: string;
  targetUrl: string;
  timestamp: string;
  results: PageScanResult[];
  totalErrors: number;
  resolvedErrors?: string[]; // IDs of resolved errors
}