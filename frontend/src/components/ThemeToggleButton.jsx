import { useTheme } from './ThemeProvider';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="M4.9 4.9 6.7 6.7" />
      <path d="M17.3 17.3 19.1 19.1" />
      <path d="M2 12h2.5" />
      <path d="M19.5 12H22" />
      <path d="m4.9 19.1 1.8-1.8" />
      <path d="m17.3 6.7 1.8-1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  );
}

export default function ThemeToggleButton({ className = '' }) {
  const { themeMode, resolvedTheme, cycleTheme } = useTheme();

  const config = {
    light: { icon: <SunIcon />, label: 'Light', next: 'Dark mode' },
    dark: { icon: <MoonIcon />, label: 'Dark', next: 'System mode' },
    system: { icon: <MonitorIcon />, label: `System ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}`, next: 'Light mode' },
  }[themeMode];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Current theme ${config.label}. Switch to ${config.next}.`}
      title={`Theme: ${config.label}. Click for ${config.next}.`}
      className={`app-btn-secondary inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${className}`.trim()}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
}