import {
  AVAILABLE_LOOK_SET,
  CatalogItem,
  COMPLETE_LOOKS,
  CompleteLook,
  ITEM_BY_ID,
  STYLE_METRICS_BY_PAIR,
  StyleMetrics,
} from '../data/catalog';

export type RevealZone = 'top' | 'skirt' | 'bag' | 'full';

export interface OutfitState {
  topId: string;
  skirtId: string;
  bagId: string | null;
}

export interface TryOnNotice {
  type: 'bag-unavailable' | 'bag-auto-removed';
  message: string;
  suggestedLookId?: string;
}

export interface ItemSelectionResult {
  changed: boolean;
  nextState: OutfitState;
  zone: RevealZone;
  tryingOnLabel: string;
  notice: TryOnNotice | null;
}

export interface RevealBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface RevealGeometry {
  clipPath: string;
  showLine: boolean;
  lineTopPct: number;
  lineLeftPct: number;
  lineWidthPct: number;
  lineOpacity: number;
}

export const WIPE_DURATION_SEC = 0.85;

// Calibrated to the 768x1376 (9:16) studio model framing
export const ZONE_BOUNDS: Record<RevealZone, RevealBounds> = {
  top: { top: 19, bottom: 48, left: 26, right: 74 },
  skirt: { top: 41, bottom: 82, left: 24, right: 76 },
  bag: { top: 51, bottom: 75, left: 17, right: 48 },
  full: { top: 15, bottom: 93, left: 17, right: 83 },
};

export function getLookKey(
  topId: string,
  skirtId: string,
  bagId: string | null
): string {
  return `${topId}_${skirtId}_${bagId ?? '00'}`;
}

export function hasLookImage(
  topId: string,
  skirtId: string,
  bagId: string | null
): boolean {
  return AVAILABLE_LOOK_SET.has(getLookKey(topId, skirtId, bagId));
}

export function supportsBagsForPair(topId: string, skirtId: string): boolean {
  return hasLookImage(topId, skirtId, 'B01');
}

export function findSuggestedLookForBag(bagId: string): CompleteLook {
  return (
    COMPLETE_LOOKS.find((look) => look.bagId === bagId) ?? COMPLETE_LOOKS[0]
  );
}

export function selectCatalogItem(
  current: OutfitState,
  item: CatalogItem
): ItemSelectionResult {
  if (item.category === 'top') {
    if (current.topId === item.id) {
      return {
        changed: false,
        nextState: current,
        zone: 'top',
        tryingOnLabel: item.name,
        notice: null,
      };
    }

    const canKeepBag =
      current.bagId !== null &&
      hasLookImage(item.id, current.skirtId, current.bagId);

    const nextBagId = canKeepBag ? current.bagId : null;
    const removedBag = current.bagId !== null && nextBagId === null;

    return {
      changed: true,
      nextState: {
        topId: item.id,
        skirtId: current.skirtId,
        bagId: nextBagId,
      },
      zone: 'top',
      tryingOnLabel: item.name,
      notice: removedBag
        ? {
            type: 'bag-auto-removed',
            message:
              'Handbag removed for this pairing — bags preview on our 3 signature looks.',
          }
        : null,
    };
  }

  if (item.category === 'skirt') {
    if (current.skirtId === item.id) {
      return {
        changed: false,
        nextState: current,
        zone: 'skirt',
        tryingOnLabel: item.name,
        notice: null,
      };
    }

    const canKeepBag =
      current.bagId !== null &&
      hasLookImage(current.topId, item.id, current.bagId);

    const nextBagId = canKeepBag ? current.bagId : null;
    const removedBag = current.bagId !== null && nextBagId === null;

    return {
      changed: true,
      nextState: {
        topId: current.topId,
        skirtId: item.id,
        bagId: nextBagId,
      },
      zone: 'skirt',
      tryingOnLabel: item.name,
      notice: removedBag
        ? {
            type: 'bag-auto-removed',
            message:
              'Handbag removed for this pairing — bags preview on our 3 signature looks.',
          }
        : null,
    };
  }

  // Bag selection
  if (current.bagId === item.id) {
    // Clicking the currently worn bag removes it cleanly
    return {
      changed: true,
      nextState: {
        ...current,
        bagId: null,
      },
      zone: 'bag',
      tryingOnLabel: `${ITEM_BY_ID[current.topId]?.name ?? 'Look'} · No Bag`,
      notice: null,
    };
  }

  if (hasLookImage(current.topId, current.skirtId, item.id)) {
    return {
      changed: true,
      nextState: {
        ...current,
        bagId: item.id,
      },
      zone: 'bag',
      tryingOnLabel: item.name,
      notice: null,
    };
  }

  // Missing combination: never error — return clean guidance notice
  const suggested = findSuggestedLookForBag(item.id);
  return {
    changed: false,
    nextState: current,
    zone: 'bag',
    tryingOnLabel: ITEM_BY_ID[current.topId]?.name ?? 'Look',
    notice: {
      type: 'bag-unavailable',
      message: `${item.name} preview is available on our 3 signature looks. Try "${suggested.title}" to style this bag.`,
      suggestedLookId: suggested.id,
    },
  };
}

export function applyCompleteLook(
  current: OutfitState,
  look: CompleteLook
): ItemSelectionResult {
  const alreadyWearing =
    current.topId === look.topId &&
    current.skirtId === look.skirtId &&
    current.bagId === look.bagId;

  return {
    changed: !alreadyWearing,
    nextState: {
      topId: look.topId,
      skirtId: look.skirtId,
      bagId: look.bagId,
    },
    zone: 'full',
    tryingOnLabel: look.title,
    notice: null,
  };
}

export function getActiveItems(state: OutfitState): CatalogItem[] {
  const items: CatalogItem[] = [];
  if (ITEM_BY_ID[state.topId]) items.push(ITEM_BY_ID[state.topId]);
  if (ITEM_BY_ID[state.skirtId]) items.push(ITEM_BY_ID[state.skirtId]);
  if (state.bagId && ITEM_BY_ID[state.bagId]) {
    items.push(ITEM_BY_ID[state.bagId]);
  }
  return items;
}

export function calculateLookTotal(state: OutfitState): number {
  return getActiveItems(state).reduce((sum, item) => sum + item.price, 0);
}

export function getStyleMetrics(state: OutfitState): StyleMetrics {
  const pairKey = `${state.topId}_${state.skirtId}`;
  const base = STYLE_METRICS_BY_PAIR[pairKey] ?? {
    silhouette: 92,
    harmony: 91,
    versatility: 90,
    note: 'Balanced editorial proportions across fabric weights.',
  };

  if (!state.bagId) {
    return base;
  }

  // Subtle styling bonus when paired with a leather handbag
  return {
    silhouette: Math.min(99, base.silhouette + 1),
    harmony: Math.min(99, base.harmony + 2),
    versatility: Math.min(99, base.versatility + 1),
    note: base.note,
  };
}

export function easeInOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Computes deterministic clip-path + glowing white scanline geometry for a 0.85s zone reveal.
 * Phase 1 (0 -> 0.86): sweeps strictly within the target garment zone from top to bottom with glowing line.
 * Phase 2 (0.86 -> 1.0): opens clip-path to full image while softly fading out the scanline.
 */
export function computeRevealGeometry(
  zone: RevealZone,
  rawProgress: number
): RevealGeometry {
  const progress = Math.max(0, Math.min(1, rawProgress));
  const bounds = ZONE_BOUNDS[zone];

  if (progress >= 1) {
    return {
      clipPath: 'inset(0% 0% 0% 0%)',
      showLine: false,
      lineTopPct: bounds.bottom,
      lineLeftPct: bounds.left,
      lineWidthPct: bounds.right - bounds.left,
      lineOpacity: 0,
    };
  }

  const sweepEnd = 0.86;

  if (progress <= sweepEnd) {
    const p = easeInOutCubic(progress / sweepEnd);
    const currentBottomY = bounds.top + (bounds.bottom - bounds.top) * p;
    const insetTop = bounds.top;
    const insetRight = 100 - bounds.right;
    const insetBottom = Math.max(0, 100 - currentBottomY);
    const insetLeft = bounds.left;

    // Fade in line softly at start
    const fadeIn = Math.min(1, progress / 0.08);

    return {
      clipPath: `inset(${insetTop.toFixed(2)}% ${insetRight.toFixed(2)}% ${insetBottom.toFixed(2)}% ${insetLeft.toFixed(2)}%)`,
      showLine: true,
      lineTopPct: currentBottomY,
      lineLeftPct: bounds.left,
      lineWidthPct: bounds.right - bounds.left,
      lineOpacity: fadeIn,
    };
  }

  // Final settle phase: expand clip-path cleanly to reveal the rest of the frame
  const settleP = easeInOutCubic((progress - sweepEnd) / (1 - sweepEnd));
  const insetTop = bounds.top * (1 - settleP);
  const insetRight = (100 - bounds.right) * (1 - settleP);
  const insetBottom = (100 - bounds.bottom) * (1 - settleP);
  const insetLeft = bounds.left * (1 - settleP);

  return {
    clipPath: `inset(${insetTop.toFixed(2)}% ${insetRight.toFixed(2)}% ${insetBottom.toFixed(2)}% ${insetLeft.toFixed(2)}%)`,
    showLine: settleP < 0.95,
    lineTopPct: bounds.bottom,
    lineLeftPct: bounds.left,
    lineWidthPct: bounds.right - bounds.left,
    lineOpacity: Math.max(0, 1 - settleP * 1.15),
  };
}

export function filterCatalogItems(
  items: CatalogItem[],
  category: 'all' | 'top' | 'skirt' | 'bag',
  query: string
): CatalogItem[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) {
      return false;
    }
    if (!normalized) return true;
    return (
      item.name.toLowerCase().includes(normalized) ||
      item.brand.toLowerCase().includes(normalized) ||
      item.color.toLowerCase().includes(normalized) ||
      item.fabric.toLowerCase().includes(normalized)
    );
  });
}
