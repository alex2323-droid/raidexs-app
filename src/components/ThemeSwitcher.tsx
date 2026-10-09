import { useState, useEffect } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';

type Theme = 'theme-dark-blue' | 'theme-dark' | 'theme-light';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('theme-dark-blue');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('app_theme') as Theme;
      if (savedTheme && ['theme-dark-blue', 'theme-dark', 'theme-light'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.warn('localStorage not accessible', e);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('theme-dark-blue', 'theme-dark', 'theme-light');
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem('app_theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'theme-dark-blue') return 'theme-dark';
      if (prev === 'theme-dark') return 'theme-light';
      return 'theme-dark-blue';
    });
  };

  const getThemeIcon = () => {
    if (theme === 'theme-dark-blue') return <Palette size={20} />;
    if (theme === 'theme-dark') return <Moon size={20} />;
    return <Sun size={20} />;
  };

  const getThemeName = () => {
    if (theme === 'theme-dark-blue') return 'Raidexs Azul Cyber';
    if (theme === 'theme-dark') return 'Negro Noche';
    return 'Modo Claro';
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Cambiar tema (Actual: ${getThemeName()})`}
      className="transition-all duration-200 active:scale-95 flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
    >
      {getThemeIcon()}
    </button>
  );
}
