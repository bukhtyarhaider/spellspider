import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { Button } from './Button';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-9 h-9 p-0 rounded-full overflow-hidden"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative z-10">
        {theme === 'dark' ? (
          <Sun size={18} className="text-amber-400 animate-fade-in" />
        ) : (
          <Moon size={18} className="text-indigo-600 animate-fade-in" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
