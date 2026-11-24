import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AVAILABLE_LOOK_KEYS,
  COMPLETE_LOOKS,
  ITEM_BY_ID,
} from '../data/catalog';
import {
  applyCompleteLook,
  calculateLookTotal,
  computeRevealGeometry,
  filterCatalogItems,
  getLookKey,
  hasLookImage,
  selectCatalogItem,
  supportsBagsForPair,
} from './tryOnLogic';
import {
  DEMO_SCRIPT,
  DEMO_TOTAL_DURATION_SEC,
  evaluateDemoAt,
} from './demoTimeline';

test('catalog contains all 18 expected outfit image keys', () => {
  assert.equal(AVAILABLE_LOOK_KEYS.length, 18);
  assert.equal(hasLookImage('T01', 'S01', null), true);
  assert.equal(hasLookImage('T02', 'S02', 'B02'), true);
  assert.equal(hasLookImage('T03', 'S03', 'B01'), true);
  assert.equal(hasLookImage('T01', 'S02', 'B01'), false);
});

test('switching top or skirt automatically removes bag when combo lacks bag imagery', () => {
  const start = { topId: 'T02', skirtId: 'S02', bagId: 'B01' };
  const result = selectCatalogItem(start, ITEM_BY_ID['T01']);

  assert.equal(result.changed, true);
  assert.equal(result.zone, 'top');
  assert.deepEqual(result.nextState, {
    topId: 'T01',
    skirtId: 'S02',
    bagId: null,
  });
  assert.equal(result.notice?.type, 'bag-auto-removed');
  assert.equal(
    hasLookImage(
      result.nextState.topId,
      result.nextState.skirtId,
      result.nextState.bagId
    ),
    true
  );
});

test('clicking a bag on unsupported pairing returns helpful notice without breaking state', () => {
  const start = { topId: 'T01', skirtId: 'S02', bagId: null };
  assert.equal(supportsBagsForPair(start.topId, start.skirtId), false);

  const result = selectCatalogItem(start, ITEM_BY_ID['B02']);
  assert.equal(result.changed, false);
  assert.deepEqual(result.nextState, start);
  assert.equal(result.notice?.type, 'bag-unavailable');
  assert.ok(result.notice?.suggestedLookId);
});

test('clicking a bag on supported pairing equips it and clicking again removes it', () => {
  const start = { topId: 'T02', skirtId: 'S02', bagId: null };
  const equipped = selectCatalogItem(start, ITEM_BY_ID['B01']);
  assert.equal(equipped.changed, true);
  assert.equal(equipped.zone, 'bag');
  assert.equal(equipped.nextState.bagId, 'B01');
  assert.equal(equipped.notice, null);

  const toggledOff = selectCatalogItem(equipped.nextState, ITEM_BY_ID['B01']);
  assert.equal(toggledOff.changed, true);
  assert.equal(toggledOff.nextState.bagId, null);
});

test('applyCompleteLook equips full outfit and computes accurate total price', () => {
  const start = { topId: 'T01', skirtId: 'S01', bagId: null };
  const look3 = COMPLETE_LOOKS[2];
  const res = applyCompleteLook(start, look3);

  assert.equal(res.changed, true);
  assert.equal(res.zone, 'full');
  assert.deepEqual(res.nextState, {
    topId: 'T03',
    skirtId: 'S03',
    bagId: 'B03',
  });
  assert.equal(
    calculateLookTotal(res.nextState),
    ITEM_BY_ID['T03'].price + ITEM_BY_ID['S03'].price + ITEM_BY_ID['B03'].price
  );
});

test('computeRevealGeometry sweeps down zone then opens full clip-path', () => {
  const startGeo = computeRevealGeometry('skirt', 0.05);
  assert.equal(startGeo.showLine, true);
  assert.ok(startGeo.clipPath.startsWith('inset(41.00%'));

  const midGeo = computeRevealGeometry('skirt', 0.45);
  assert.equal(midGeo.showLine, true);
  assert.ok(midGeo.lineTopPct > startGeo.lineTopPct);

  const doneGeo = computeRevealGeometry('skirt', 1.0);
  assert.equal(doneGeo.showLine, false);
  assert.equal(doneGeo.clipPath, 'inset(0% 0% 0% 0%)');
});

test('filterCatalogItems filters by category and search text', () => {
  const all = Object.values(ITEM_BY_ID);
  assert.equal(filterCatalogItems(all, 'skirt', '').length, 3);
  assert.equal(filterCatalogItems(all, 'all', 'cashmere').length, 1);
  assert.equal(filterCatalogItems(all, 'bag', 'cognac').length, 1);
});

test('16-second demo script only uses existing image combinations at every timestamp', () => {
  assert.equal(DEMO_SCRIPT.length, 7);
  for (let frame = 0; frame <= DEMO_TOTAL_DURATION_SEC * 30; frame++) {
    const t = frame / 30;
    const state = evaluateDemoAt(t);
    const activeValid = hasLookImage(
      state.outfit.topId,
      state.outfit.skirtId,
      state.outfit.bagId
    );
    assert.equal(
      activeValid,
      true,
      `Missing active image at t=${t.toFixed(2)}s: ${state.activeKey}`
    );
    assert.equal(
      getLookKey(state.outfit.topId, state.outfit.skirtId, state.outfit.bagId),
      state.activeKey
    );
  }

  // Spot check key timestamps from user script
  assert.equal(evaluateDemoAt(0.5).activeKey, 'T01_S01_00');
  assert.equal(evaluateDemoAt(2.3).activeKey, 'T01_S02_00');
  assert.equal(evaluateDemoAt(4.3).activeKey, 'T02_S02_00');
  assert.equal(evaluateDemoAt(6.3).activeKey, 'T02_S02_B01');
  assert.equal(evaluateDemoAt(8.3).activeKey, 'T02_S02_B02');
  assert.equal(evaluateDemoAt(10.3).activeKey, 'T03_S03_B03');
  assert.equal(evaluateDemoAt(12.3).activeKey, 'T03_S03_B01');
  assert.equal(evaluateDemoAt(14.5).shopDrawerOpen, true);
  assert.equal(evaluateDemoAt(6.2).ripple.active, true);
  assert.ok(evaluateDemoAt(6.4).revealProgress > 0.3 && evaluateDemoAt(6.4).revealProgress < 0.7);
});
