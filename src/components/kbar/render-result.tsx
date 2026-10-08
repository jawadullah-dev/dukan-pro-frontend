import { KBarResults, useMatches } from 'kbar';
import ResultItem from './result-item';
import { useT } from '@/i18n/use-t';

export default function RenderResults() {
  const { results, rootActionId } = useMatches();
  const t = useT();

  if (!results.length) {
    return (
      <div className='text-muted-foreground flex h-full items-center justify-center px-4 text-center text-sm'>
        {t('kbar.noResults')}
      </div>
    );
  }

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className='text-muted-foreground px-4 pt-3 pb-1 text-xs font-medium tracking-wider uppercase'>
            {item}
          </div>
        ) : (
          <ResultItem action={item} active={active} currentRootActionId={rootActionId ?? ''} />
        )
      }
    />
  );
}
