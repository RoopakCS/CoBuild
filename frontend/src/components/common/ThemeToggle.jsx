import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '../../lib/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle bg-surface-dim text-primary transition-colors hover:bg-surface hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary cursor-pointer"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        size={18}
        weight="bold"
        className={`absolute transition-all duration-200 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
      />
      <Moon
        size={18}
        weight="bold"
        className={`absolute transition-all duration-200 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
      />
    </button>
  );
}
