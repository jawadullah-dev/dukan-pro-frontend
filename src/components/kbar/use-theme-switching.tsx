import { useRegisterActions } from 'kbar';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useThemeConfig } from '@/components/themes/active-theme';
import { THEMES } from '@/components/themes/theme.config';

const useThemeSwitching = () => {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const { activeTheme, setActiveTheme } = useThemeConfig();

  const toggleDarkLight = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.value === activeTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setActiveTheme(THEMES[nextIndex].value);
  };

  const themeActions = [
    {
      id: 'cycleTheme',
      name: t('command.switchTheme'),
      shortcut: ['t', 't'],
      section: t('command.themeSection'),
      perform: cycleTheme
    },
    {
      id: 'toggleDarkLight',
      name: t('command.toggleMode'),
      shortcut: ['d', 'd'],
      section: t('command.themeSection'),
      perform: toggleDarkLight
    },
    {
      id: 'setLightTheme',
      name: t('command.setLight'),
      section: t('command.themeSection'),
      perform: () => setTheme('light')
    },
    {
      id: 'setDarkTheme',
      name: t('command.setDark'),
      section: t('command.themeSection'),
      perform: () => setTheme('dark')
    }
  ];

  useRegisterActions(themeActions, [theme, activeTheme]);
};

export default useThemeSwitching;
