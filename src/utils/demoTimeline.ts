import { COMPLETE_LOOKS, ITEM_BY_ID } from '../data/catalog';
import {
  applyCompleteLook,
  easeInOutCubic,
  getLookKey,
  OutfitState,
  RevealZone,
  selectCatalogItem,
  WIPE_DURATION_SEC,
} from './tryOnLogic';

export type DemoTargetKey =
  | 'S02'
  | 'T02'
  | 'B01'
  | 'B02'
  | 'look-3'
  | 'shop-the-look';

export interface DemoAction {
  time: number;
  target: DemoTargetKey;
  kind: 'item' | 'complete-look' | 'shop';
  itemId?: string;
  lookId?: string;
  label: string;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface DemoFrameState {
  time: number;
  outfit: OutfitState;
  activeKey: string;
  prevKey: string;
  revealZone: RevealZone;
  revealProgress: number; // 0..1
  tryingOnLabel: string;
  shopDrawerOpen: boolean;
  cursor: {
    x: number;
    y: number;
    pressing: boolean;
    visible: boolean;
  };
  ripple: {
    active: boolean;
    x: number;
    y: number;
    progress: number; // 0..1
  };
  highlightedTarget: DemoTargetKey | null;
}

export const DEMO_TOTAL_DURATION_SEC = 16.0;

/**
 * Exact 7-step showcase script (every 2 seconds, 16s total):
 * 2s: Change skirt (S02) -> T01_S02_00
 * 4s: Change top (T02) -> T02_S02_00
 * 6s: Add bag (B01) -> T02_S02_B01
 * 8s: Change bag (B02) -> T02_S02_B02
 * 10s: Click Complete Look 3 (Gallery Tailored) -> T03_S03_B03
 * 12s: Change bag (B01) -> T03_S03_B01
 * 14s: Click Shop the look -> Opens curated checkout drawer
 */
export const DEMO_SCRIPT: readonly DemoAction[] = [
  {
    time: 2.0,
    target: 'S02',
    kind: 'item',
    itemId: 'S02',
    label: 'Swap skirt to Bias-Cut Satin Skirt',
  },
  {
    time: 4.0,
    target: 'T02',
    kind: 'item',
    itemId: 'T02',
    label: 'Swap top to Silk Draped Blouse',
  },
  {
    time: 6.0,
    target: 'B01',
    kind: 'item',
    itemId: 'B01',
    label: 'Add Sculpted Saddle Tote',
  },
  {
    time: 8.0,
    target: 'B02',
    kind: 'item',
    itemId: 'B02',
    label: 'Swap bag to Crescent Leather Pouch',
  },
  {
    time: 10.0,
    target: 'look-3',
    kind: 'complete-look',
    lookId: 'look-3',
    label: 'Apply Gallery Tailored complete look',
  },
  {
    time: 12.0,
    target: 'B01',
    kind: 'item',
    itemId: 'B01',
    label: 'Swap bag to Sculpted Saddle Tote',
  },
  {
    time: 14.0,
    target: 'shop-the-look',
    kind: 'shop',
    label: 'Open Shop the look summary',
  },
] as const;

export const DEMO_INITIAL_OUTFIT: OutfitState = {
  topId: 'T01',
  skirtId: 'S01',
  bagId: null,
};

// Default 1920x1080 fallback coordinates (overridden dynamically by measured DOM button centers)
export const DEFAULT_DEMO_ANCHORS: Record<DemoTargetKey | 'start', Point2D> = {
  start: { x: 420, y: 310 },
  S02: { x: 355, y: 635 },
  T02: { x: 355, y: 365 },
  B01: { x: 160, y: 905 },
  B02: { x: 355, y: 905 },
  'look-3': { x: 1670, y: 940 },
  'shop-the-look': { x: 1670, y: 615 },
};

export function evaluateDemoAt(
  rawTime: number,
  anchors: Partial<Record<DemoTargetKey | 'start', Point2D>> = {}
): DemoFrameState {
  const time = Math.max(0, Math.min(DEMO_TOTAL_DURATION_SEC, rawTime));
  const pts: Record<DemoTargetKey | 'start', Point2D> = {
    ...DEFAULT_DEMO_ANCHORS,
    ...anchors,
  };

  let current: OutfitState = { ...DEMO_INITIAL_OUTFIT };
  let prevKey = getLookKey(current.topId, current.skirtId, current.bagId);
  let activeKey = prevKey;
  let revealZone: RevealZone = 'full';
  let revealProgress = 1;
  let tryingOnLabel = ITEM_BY_ID[current.topId]?.name ?? 'Atelier Linen Vest';
  let shopDrawerOpen = false;

  // Replay every action whose timestamp has occurred by `time`
  for (const action of DEMO_SCRIPT) {
    if (time < action.time) break;

    if (action.kind === 'shop') {
      shopDrawerOpen = true;
      continue;
    }

    const beforeKey = getLookKey(current.topId, current.skirtId, current.bagId);

    if (action.kind === 'item' && action.itemId) {
      const item = ITEM_BY_ID[action.itemId];
      if (item) {
        const res = selectCatalogItem(current, item);
        if (res.changed) {
          prevKey = beforeKey;
          current = res.nextState;
          activeKey = getLookKey(current.topId, current.skirtId, current.bagId);
          revealZone = res.zone;
          tryingOnLabel = res.tryingOnLabel;
          const elapsed = time - action.time;
          revealProgress = Math.max(0, Math.min(1, elapsed / WIPE_DURATION_SEC));
        }
      }
    } else if (action.kind === 'complete-look' && action.lookId) {
      const look = COMPLETE_LOOKS.find((l) => l.id === action.lookId);
      if (look) {
        const res = applyCompleteLook(current, look);
        if (res.changed) {
          prevKey = beforeKey;
          current = res.nextState;
          activeKey = getLookKey(current.topId, current.skirtId, current.bagId);
          revealZone = res.zone;
          tryingOnLabel = res.tryingOnLabel;
          const elapsed = time - action.time;
          revealProgress = Math.max(0, Math.min(1, elapsed / WIPE_DURATION_SEC));
        }
      }
    }
  }

  // Deterministic fake cursor path:
  // Glides over 0.72s before each click timestamp, presses for 0.14s, then rests softly
  const moveDuration = 0.72;
  let cursorX = pts.start.x;
  let cursorY = pts.start.y;
  let pressing = false;
  let highlightedTarget: DemoTargetKey | null = null;

  let prevAnchor: Point2D = pts.start;
  for (let i = 0; i < DEMO_SCRIPT.length; i++) {
    const action = DEMO_SCRIPT[i];
    const targetPt = pts[action.target];
    const moveStart = action.time - moveDuration;

    if (time < moveStart) {
      cursorX = prevAnchor.x;
      cursorY = prevAnchor.y;
      break;
    } else if (time >= moveStart && time < action.time) {
      const p = easeInOutCubic((time - moveStart) / moveDuration);
      // Slight gentle arc so cursor motion looks natural and human
      const arcLift = Math.sin(p * Math.PI) * -18;
      cursorX = prevAnchor.x + (targetPt.x - prevAnchor.x) * p;
      cursorY = prevAnchor.y + (targetPt.y - prevAnchor.y) * p + arcLift;
      if (p > 0.78) {
        highlightedTarget = action.target;
      }
      break;
    } else {
      cursorX = targetPt.x;
      cursorY = targetPt.y;
      if (time >= action.time && time < action.time + 0.14) {
        pressing = true;
        highlightedTarget = action.target;
      } else if (time >= action.time && time < action.time + 0.35) {
        highlightedTarget = action.target;
      }
      prevAnchor = targetPt;
    }
  }

  // Click ripple for 0.48s starting at each action timestamp
  const rippleDuration = 0.48;
  let ripple = { active: false, x: cursorX, y: cursorY, progress: 0 };
  for (const action of DEMO_SCRIPT) {
    if (time >= action.time && time < action.time + rippleDuration) {
      const targetPt = pts[action.target];
      ripple = {
        active: true,
        x: targetPt.x,
        y: targetPt.y,
        progress: (time - action.time) / rippleDuration,
      };
      break;
    }
  }

  return {
    time,
    outfit: current,
    activeKey,
    prevKey,
    revealZone,
    revealProgress,
    tryingOnLabel,
    shopDrawerOpen,
    cursor: {
      x: cursorX,
      y: cursorY,
      pressing,
      visible: time >= 0.25 && time <= 15.85,
    },
    ripple,
    highlightedTarget,
  };
}
