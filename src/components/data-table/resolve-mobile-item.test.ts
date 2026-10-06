import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hasResolvableTitle, resolveMobileSlots } from './resolve-mobile-item.ts';

describe('resolveMobileSlots', () => {
  it('picks primary + phone + money + status', () => {
    const slots = resolveMobileSlots([
      { id: 'name', type: 'text', primary: true, priority: 1 },
      { id: 'phone', type: 'phone', priority: 2 },
      { id: 'udhar', type: 'money', highlight: true, priority: 1 },
      { id: 'status', type: 'status', priority: 2 },
      { id: 'notes', type: 'longtext' },
      { id: 'actions' }
    ]);
    assert.equal(slots.titleColumnId, 'name');
    assert.equal(slots.subtitleColumnId, 'phone');
    assert.equal(slots.valueColumnId, 'udhar');
    assert.equal(slots.badgeColumnId, 'status');
    assert.ok(!slots.detailOnlyColumnIds.includes('name'));
    assert.ok(slots.detailOnlyColumnIds.includes('notes'));
    assert.ok(hasResolvableTitle(slots));
  });

  it('uses simple layout for 2–3 fields (no badge/meta)', () => {
    const slots = resolveMobileSlots([
      { id: 'name', type: 'text', primary: true },
      { id: 'is_active', type: 'boolean' },
      { id: 'actions' }
    ]);
    assert.equal(slots.titleColumnId, 'name');
    assert.equal(slots.badgeColumnId, null);
    assert.deepEqual(slots.metaColumnIds, []);
  });

  it('honors legacy mobile hints', () => {
    const slots = resolveMobileSlots([
      { id: 'sale_no', type: 'id', mobile: 'title' },
      { id: 'customer', type: 'text', mobile: 'subtitle' },
      { id: 'total', type: 'money', mobile: 'value' },
      { id: 'status', type: 'status', mobile: 'badge' },
      { id: 'date', type: 'date', mobile: 'meta' }
    ]);
    assert.equal(slots.titleColumnId, 'sale_no');
    assert.equal(slots.subtitleColumnId, 'customer');
    assert.equal(slots.valueColumnId, 'total');
    assert.equal(slots.badgeColumnId, 'status');
    assert.deepEqual(slots.metaColumnIds, ['date']);
  });

  it('never puts more than 2 meta items', () => {
    const slots = resolveMobileSlots([
      { id: 'title', type: 'text', primary: true },
      { id: 'd1', type: 'date', priority: 1 },
      { id: 'd2', type: 'date', priority: 2 },
      { id: 'd3', type: 'date', priority: 3 },
      { id: 'amt', type: 'money', highlight: true }
    ]);
    assert.ok(slots.metaColumnIds.length <= 2);
  });

  it('fails title guard when no usable columns', () => {
    const slots = resolveMobileSlots([{ id: 'actions' }, { id: 'notes', type: 'longtext' }]);
    assert.equal(hasResolvableTitle(slots), false);
  });

  it('uses thumbnail leading for image columns', () => {
    const slots = resolveMobileSlots([
      { id: 'photo_url', type: 'image' },
      { id: 'name', type: 'text', primary: true },
      { id: 'price', type: 'money', highlight: true }
    ]);
    assert.equal(slots.leading, 'thumbnail');
    assert.equal(slots.imageColumnId, 'photo_url');
  });
});
