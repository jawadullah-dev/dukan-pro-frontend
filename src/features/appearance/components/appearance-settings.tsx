'use client';

import { useTheme } from 'next-themes';
import { useThemeConfig } from '@/components/themes/active-theme';
import { THEMES } from '@/components/themes/theme.config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { cn } from '@/lib/utils';
import { useAppearanceStore, type AppearanceAccent } from '@/lib/appearance/store';
import { translateMaybe, useT } from '@/i18n/use-t';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import type { AppLocale } from '@/i18n/request';
import { delocalize } from '@/lib/auth/routes';

const ACCENT_OPTIONS: AppearanceAccent[] = ['blue', 'green', 'purple', 'orange', 'red', 'teal'];

const ACCENT_CLASS: Record<AppearanceAccent, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  teal: 'bg-teal-500'
};

function LivePreview() {
  const digits = useAppearanceStore((s) => s.digits);
  const t = useT();

  const amount = digits === 'eastern' ? 'Rs ٤٥٬٠٠٠' : 'Rs 45,000';

  return (
    <Card className='sticky top-20'>
      <CardHeader className='pb-3'>
        <CardDescription className='text-xs tracking-wide uppercase'>
          {t('appearance.previewTitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-2xl font-semibold tabular-nums'>{amount}</span>
          <Badge>{t('status.active')}</Badge>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button size='sm'>{t('appearance.previewButtonPrimary')}</Button>
          <Button size='sm' variant='secondary'>
            {t('appearance.previewButtonSecondary')}
          </Button>
          <Button size='sm' variant='outline'>
            {t('appearance.previewButtonOutline')}
          </Button>
        </div>
        <div className='rounded-lg border'>
          <div className='grid grid-cols-3 gap-2 border-b px-3 py-2 text-xs font-medium'>
            <span>{t('appearance.previewColItem')}</span>
            <span>{t('appearance.previewColQty')}</span>
            <span className='text-end'>{t('appearance.previewColAmount')}</span>
          </div>
          <div className='grid grid-cols-3 gap-2 px-3 py-2 text-sm'>
            <span>{t('appearance.previewSampleItem')}</span>
            <span>1</span>
            <span className='text-end tabular-nums'>
              {digits === 'eastern' ? '٨٥٬٠٠٠' : '85,000'}
            </span>
          </div>
        </div>
        <p className='text-muted-foreground text-xs'>{t('appearance.previewFooter')}</p>
      </CardContent>
    </Card>
  );
}

export function AppearanceSettings() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const { activeTheme, setActiveTheme } = useThemeConfig();
  const prefs = useAppearanceStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = useLocale() as AppLocale;

  const onSelectLanguage = (newLocale: AppLocale) => {
    if (currentLocale === newLocale) return;

    const query = searchParams.toString();
    const route = delocalize(pathname);
    router.replace(query ? `${route}?${query}` : route, { locale: newLocale });
  };

  return (
    <div className='grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]'>
      <div className='min-w-0 space-y-6'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-semibold tracking-tight'>{t('appearance.title')}</h2>
            <p className='text-muted-foreground text-sm'>{t('appearance.subtitle')}</p>
          </div>
          <Button variant='outline' size='sm' onClick={() => prefs.resetAll()}>
            <Icons.history className='me-2 h-4 w-4' />
            {t('appearance.reset')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.download className='h-4 w-4' />
              {t('pwa.installApp')}
            </CardTitle>
            <CardDescription>{t('pwa.installDesktopHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <InstallPrompt
              variant='menu'
              className='border-border hover:bg-muted rounded-md border px-3 py-2'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.palette className='h-4 w-4' />
              {t('appearance.theme')}
            </CardTitle>
            <CardDescription>{t('appearance.themeHint')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label>{t('appearance.mode')}</Label>
              <div className='flex flex-wrap gap-2'>
                {[
                  {
                    value: 'system',
                    label: t('appearance.modeSystem'),
                    icon: Icons.laptop
                  },
                  {
                    value: 'light',
                    label: t('appearance.modeLight'),
                    icon: Icons.sun
                  },
                  {
                    value: 'dark',
                    label: t('appearance.modeDark'),
                    icon: Icons.moon
                  }
                ].map((mode) => (
                  <Button
                    key={mode.value}
                    type='button'
                    size='sm'
                    variant={(theme ?? 'system') === mode.value ? 'default' : 'outline'}
                    onClick={() => setTheme(mode.value)}
                  >
                    <mode.icon className='me-1 h-4 w-4' />
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className='space-y-2'>
              <Label>{t('appearance.visualTheme')}</Label>
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                {THEMES.map((th) => (
                  <button
                    key={th.value}
                    type='button'
                    onClick={() => setActiveTheme(th.value)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-start text-sm transition-colors',
                      activeTheme === th.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <span className='font-medium'>
                      {translateMaybe(`appearance.themeNames.${th.value}`, t)}
                    </span>
                    {activeTheme === th.value ? (
                      <Icons.check className='text-primary mt-1 h-4 w-4' />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.sparkles className='h-4 w-4' />
              {t('appearance.accent')}
            </CardTitle>
            <CardDescription>{t('appearance.accentDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-3'>
              {ACCENT_OPTIONS.map((accent) => (
                <button
                  key={accent}
                  type='button'
                  aria-label={t('aria.accentColor', {
                    name: translateMaybe(`appearance.accentColors.${accent}`, t)
                  })}
                  onClick={() => prefs.setAccent(accent)}
                  className={cn(
                    'relative h-9 w-9 rounded-full border-2 transition-transform hover:scale-105',
                    ACCENT_CLASS[accent],
                    prefs.accent === accent
                      ? 'border-foreground ring-2 ring-offset-2'
                      : 'border-transparent'
                  )}
                >
                  {prefs.accent === accent ? (
                    <Icons.check className='absolute inset-0 m-auto h-4 w-4 text-white' />
                  ) : null}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.dashboard className='h-4 w-4' />
              {t('appearance.layout')}
            </CardTitle>
            <CardDescription>{t('appearance.layoutDescription')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label>{t('appearance.density')}</Label>
              <div className='flex flex-wrap gap-2'>
                {(['comfortable', 'compact'] as const).map((density) => (
                  <Button
                    key={density}
                    type='button'
                    size='sm'
                    variant={prefs.density === density ? 'default' : 'outline'}
                    onClick={() => prefs.setDensity(density)}
                  >
                    {density === 'comfortable'
                      ? t('appearance.comfortable')
                      : t('appearance.compact')}
                  </Button>
                ))}
              </div>
            </div>
            <div className='space-y-2'>
              <Label>{t('appearance.radius')}</Label>
              <div className='flex flex-wrap gap-2'>
                {(['sharp', 'medium', 'round'] as const).map((radius) => (
                  <Button
                    key={radius}
                    type='button'
                    size='sm'
                    variant={prefs.radius === radius ? 'default' : 'outline'}
                    onClick={() => prefs.setRadius(radius)}
                  >
                    {radius === 'sharp'
                      ? t('appearance.sharp')
                      : radius === 'medium'
                        ? t('appearance.medium')
                        : t('appearance.round')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.brightness className='h-4 w-4' />
              {t('appearance.language')}
            </CardTitle>
            <CardDescription>{t('appearance.languageHint')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-2 sm:grid-cols-3'>
              {[
                { value: 'en' as const, label: 'English', badge: 'LTR' },
                { value: 'ur' as const, label: 'اردو', badge: 'RTL' },
                { value: 'ps' as const, label: 'پښتو', badge: 'RTL' }
              ].map((lang) => (
                <button
                  key={lang.value}
                  type='button'
                  onClick={() => onSelectLanguage(lang.value)}
                  className={cn(
                    'rounded-lg border px-3 py-3 text-start',
                    currentLocale === lang.value
                      ? 'border-primary ring-1 ring-primary'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <p className='font-medium'>{lang.label}</p>
                  <Badge variant='secondary' className='mt-1 text-[10px]'>
                    {lang.badge}
                  </Badge>
                </button>
              ))}
            </div>
            <div className='space-y-2'>
              <Label>{t('appearance.digits')}</Label>
              <RadioGroup
                value={prefs.digits}
                onValueChange={(v) => prefs.setDigits(v as typeof prefs.digits)}
                className='flex gap-4'
              >
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='western' id='digits-western' />
                  <Label htmlFor='digits-western'>{t('appearance.digitsWestern')}</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem value='eastern' id='digits-eastern' />
                  <Label htmlFor='digits-eastern'>{t('appearance.digitsEastern')}</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      <LivePreview />
    </div>
  );
}
