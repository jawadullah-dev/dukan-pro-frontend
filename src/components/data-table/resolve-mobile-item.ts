import type { ColumnSemanticType, ColumnLayoutMeta, ResolvedMobileSlots } from './types';

const SKIP_IDS = new Set(['actions', 'select', 'udhar_state']);

function isListable(col: ColumnLayoutMeta): boolean {
  if (SKIP_IDS.has(col.id)) return false;
  if (col.mobile === 'hidden') return false;
  if (col.type === 'longtext') return false;
  return true;
}

function byPriority(a: ColumnLayoutMeta, b: ColumnLayoutMeta): number {
  return (a.priority ?? 3) - (b.priority ?? 3);
}

function pickFirst(
  cols: ColumnLayoutMeta[],
  used: Set<string>,
  pred: (c: ColumnLayoutMeta) => boolean
): ColumnLayoutMeta | undefined {
  return cols.filter((c) => !used.has(c.id) && pred(c)).toSorted(byPriority)[0];
}

export function resolveMobileSlots(columns: ColumnLayoutMeta[]): ResolvedMobileSlots {
  const cols = columns.filter(isListable);
  const used = new Set<string>();

  const take = (col: ColumnLayoutMeta | undefined): ColumnLayoutMeta | undefined => {
    if (!col || used.has(col.id)) return undefined;
    used.add(col.id);
    return col;
  };

  const imageCol = pickFirst(
    cols,
    used,
    (c) => c.type === 'image' || c.id.includes('photo') || c.id.includes('thumbnail')
  );
  const leading: ResolvedMobileSlots['leading'] = imageCol
    ? 'thumbnail'
    : cols.some((c) => c.type === 'phone')
      ? 'avatar'
      : 'icon';

  const hintedTitle = take(cols.find((c) => c.mobile === 'title'));
  const hintedSubtitle = take(cols.find((c) => c.mobile === 'subtitle'));
  const hintedBadge = take(cols.find((c) => c.mobile === 'badge'));
  const hintedValue = take(cols.find((c) => c.mobile === 'value'));
  const hintedMeta = cols.filter((c) => c.mobile === 'meta' && !used.has(c.id)).slice(0, 2);
  for (const m of hintedMeta) used.add(m.id);

  const title =
    hintedTitle ??
    take(cols.find((c) => c.primary && !used.has(c.id))) ??
    take(pickFirst(cols, used, (c) => c.type === 'id' || c.type === 'text'));

  const subtitle =
    hintedSubtitle ??
    take(pickFirst(cols, used, (c) => c.type === 'phone' || c.type === 'text' || c.type === 'id'));

  const badge =
    hintedBadge ?? take(pickFirst(cols, used, (c) => c.type === 'status' || c.type === 'boolean'));

  const value =
    hintedValue ??
    take(cols.find((c) => c.highlight && !used.has(c.id))) ??
    take(pickFirst(cols, used, (c) => c.type === 'money')) ??
    take(pickFirst(cols, used, (c) => c.type === 'number'));

  const metaFromHints = hintedMeta;
  const metaAuto = cols
    .filter((c) => !used.has(c.id) && (c.type === 'date' || c.type === 'text' || c.type === 'id'))
    .toSorted(byPriority)
    .slice(0, 2 - metaFromHints.length);
  for (const m of metaAuto) used.add(m.id);
  const metaColumnIds = [...metaFromHints, ...metaAuto].map((c) => c.id);

  const fieldCount = cols.length;
  let badgeColumnId = badge?.id ?? null;
  let finalMeta = metaColumnIds;
  if (fieldCount <= 3) {
    badgeColumnId = null;
    finalMeta = [];
  }

  if (imageCol) used.add(imageCol.id);

  const detailOnlyColumnIds = columns
    .filter((c) => !SKIP_IDS.has(c.id) && !used.has(c.id))
    .map((c) => c.id);

  return {
    titleColumnId: title?.id ?? null,
    subtitleColumnId: subtitle?.id ?? null,
    badgeColumnId,
    valueColumnId: value?.id ?? null,
    metaColumnIds: finalMeta,
    leading: imageCol ? 'thumbnail' : leading,
    imageColumnId: imageCol?.id ?? null,
    detailOnlyColumnIds
  };
}

export function hasResolvableTitle(slots: ResolvedMobileSlots): boolean {
  return slots.titleColumnId != null;
}
