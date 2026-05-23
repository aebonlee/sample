import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const KEY = 'sample-gallery-theme';

function resolveInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(KEY) as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(resolveInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`${next === 'dark' ? '다크' : '라이트'} 모드로 전환`}
      title={`${next === 'dark' ? '다크' : '라이트'} 모드로 전환`}
      onClick={() => setTheme(next)}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
