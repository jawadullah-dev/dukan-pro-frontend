'use client';

import { useThemeConfig } from '@/components/themes/active-theme';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { Icons } from '../icons';
import { Kbd } from '@/components/ui/kbd';
import { THEMES } from './theme.config';
import { translateMaybe, useT } from '@/i18n/use-t';

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();
  const t = useT();

  return (
    <div className='flex items-center gap-2'>
      <Label htmlFor='theme-selector' className='sr-only'>
        {t('appearance.theme')}
      </Label>
      <Select
        items={THEMES.map((theme) => ({
          value: theme.value,
          label: translateMaybe(`appearance.themeNames.${theme.value}`, t)
        }))}
        value={activeTheme}
        onValueChange={(value) => {
          if (value !== null) setActiveTheme(value);
        }}
      >
        <SelectTrigger
          id='theme-selector'
          className='justify-start *:data-[slot=select-value]:w-24'
        >
          <span className='text-muted-foreground hidden sm:block'>
            <Icons.palette />
          </span>
          <span className='text-muted-foreground block sm:hidden'>{t('appearance.theme')}</span>
          <SelectValue placeholder={t('appearance.selectTheme')} />
          <Kbd>T</Kbd>
          <Kbd>T</Kbd>
        </SelectTrigger>
        <SelectContent align='end'>
          {THEMES.length > 0 && (
            <>
              <SelectGroup>
                <SelectLabel>{t('appearance.themes')}</SelectLabel>
                {THEMES.map((theme) => (
                  <SelectItem key={theme.name} value={theme.value}>
                    {translateMaybe(`appearance.themeNames.${theme.value}`, t)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
