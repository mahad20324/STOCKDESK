import { useTheme } from './ThemeProvider';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', shortLabel: 'L', Icon: SunIcon },
  { value: 'dark', label: 'Dark', shortLabel: 'D', Icon: MoonIcon },
  { value: 'system', label: 'System', shortLabel: 'S', Icon: MonitorIcon },
];

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

export default function ThemeToggleButton({ className = '', compact = false, stretch = false }) {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  const containerClassName = compact
    ? 'inline-flex items-center gap-0.5 rounded-lg p-0.5'
    : 'inline-flex items-center gap-1 rounded-xl p-1';

  const buttonClassName = compact
    ? 'min-w-0 rounded-md px-2 py-2 sm:px-2.5'
    : 'rounded-lg px-3 py-2';

  return (
    <div
      className={`app-panel-soft ${containerClassName} ${stretch ? 'w-full' : ''} border ${className}`.trim()}
      role="group"
      aria-label="Theme selector"
    >
      {THEME_OPTIONS.map(({ value, label, shortLabel, Icon }) => {
        const isActive = themeMode === value;
        const isSystem = value === 'system';
        const title = isSystem ? `System (${resolvedTheme})` : label;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setThemeMode(value)}
            aria-pressed={isActive}
            title={title}
            className={`inline-flex items-center gap-2 text-sm font-medium transition ${stretch ? 'flex-1 justify-center' : ''} ${buttonClassName} ${
              isActive
                ? 'app-panel text-[var(--accent-strong)] shadow-sm'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon />
            <span className={compact ? 'hidden md:inline' : 'hidden sm:inline'}>{label}</span>
            <span className={compact ? 'inline md:hidden' : 'sm:hidden'}>{shortLabel}</span>
            {isSystem ? (
              <span className={`${compact ? 'hidden lg:inline' : 'hidden md:inline'} text-xs text-[var(--text-muted)]`}>
                {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}