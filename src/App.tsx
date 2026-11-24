import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CatalogColumn, CategoryFilter } from './components/CatalogColumn';
import { ModelStage } from './components/ModelStage';
import { LookPanel } from './components/LookPanel';
import { ShopLookDrawer } from './components/ShopLookDrawer';
import { DemoOverlay } from './components/DemoOverlay';
import { ShowcaseModal } from './components/ShowcaseModal';
import {
  CatalogItem,
  COMPLETE_LOOKS,
  CompleteLook,
  ITEM_BY_ID,
} from './data/catalog';
import {
  applyCompleteLook,
  getLookKey,
  OutfitState,
  RevealZone,
  selectCatalogItem,
  TryOnNotice,
  WIPE_DURATION_SEC,
} from './utils/tryOnLogic';
import {
  DEMO_INITIAL_OUTFIT,
  DEMO_TOTAL_DURATION_SEC,
  DemoTargetKey,
  evaluateDemoAt,
  Point2D,
} from './utils/demoTimeline';

const CANVAS_W = 1920;
const CANVAS_H = 1080;

declare global {
  interface Window {
    __VESTIA_SET_DEMO_TIME__?: (seconds: number) => void;
    __VESTIA_READY__?: boolean;
  }
}

function readInitialDemoParams(): { isDemo: boolean; initialTime: number } {
  if (typeof window === 'undefined') {
    return { isDemo: false, initialTime: 0 };
  }
  const params = new URLSearchParams(window.location.search);
  const demoFlag = params.get('demo');
  const isDemo = demoFlag === '1' || demoFlag === 'true';
  const rawT = parseFloat(params.get('t') ?? '0');
  return {
    isDemo,
    initialTime: Number.isFinite(rawT) ? rawT : 0,
  };
}

export default function App() {
  const initialParams = readInitialDemoParams();

  // Fixed 1920x1080 proportional viewport scaling
  const [scale, setScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
  });

  // Deterministic demo mode state (URL ?demo=1 or interactive Live Demo playback)
  const [demoMode, setDemoMode] = useState<boolean>(initialParams.isDemo);
  const [demoTime, setDemoTime] = useState<number>(initialParams.initialTime);
  const [liveDemoPlaying, setLiveDemoPlaying] = useState<boolean>(false);
  const [measuredAnchors, setMeasuredAnchors] = useState<
    Partial<Record<DemoTargetKey | 'start', Point2D>>
  >({});

  // Interactive fitting room state
  const [outfit, setOutfit] = useState<OutfitState>(DEMO_INITIAL_OUTFIT);
  const [prevKey, setPrevKey] = useState<string>(
    getLookKey(
      DEMO_INITIAL_OUTFIT.topId,
      DEMO_INITIAL_OUTFIT.skirtId,
      DEMO_INITIAL_OUTFIT.bagId
    )
  );
  const [revealZone, setRevealZone] = useState<RevealZone>('full');
  const [revealProgress, setRevealProgress] = useState<number>(1);
  const [tryingOnLabel, setTryingOnLabel] = useState<string>(
    ITEM_BY_ID[DEMO_INITIAL_OUTFIT.topId]?.name ?? 'Atelier Linen Vest'
  );
  const [notice, setNotice] = useState<TryOnNotice | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shopDrawerOpen, setShopDrawerOpen] = useState<boolean>(false);
  const [showcaseOpen, setShowcaseOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const liveDemoRafRef = useRef<number | null>(null);

  // Proportional scaling listener
  useEffect(() => {
    const updateScale = () => {
      const next = Math.min(
        window.innerWidth / CANVAS_W,
        window.innerHeight / CANVAS_H
      );
      setScale(next);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Measure exact centers of [data-demo-target] controls inside 1920x1080 space
  const measureDemoAnchors = useCallback(() => {
    const root = canvasRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    if (rootRect.width <= 0 || rootRect.height <= 0) return;
    const sx = CANVAS_W / rootRect.width;
    const sy = CANVAS_H / rootRect.height;

    const targets: DemoTargetKey[] = [
      'S02',
      'T02',
      'B01',
      'B02',
      'look-3',
      'shop-the-look',
    ];
    const next: Partial<Record<DemoTargetKey | 'start', Point2D>> = {
      start: { x: 460, y: 210 },
    };

    for (const key of targets) {
      const el = root.querySelector(`[data-demo-target="${key}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        next[key] = {
          x: (r.left + r.width / 2 - rootRect.left) * sx,
          y: (r.top + r.height / 2 - rootRect.top) * sy,
        };
      }
    }
    setMeasuredAnchors(next);
  }, []);

  useLayoutEffect(() => {
    measureDemoAnchors();
    window.__VESTIA_READY__ = true;
  }, [measureDemoAnchors, scale, category, searchQuery]);

  // Expose deterministic time setter for headless frame-by-frame capture
  useEffect(() => {
    window.__VESTIA_SET_DEMO_TIME__ = (seconds: number) => {
      setDemoMode(true);
      setLiveDemoPlaying(false);
      setShowcaseOpen(false);
      setCategory('all');
      setSearchQuery('');
      setDemoTime(seconds);
    };
    return () => {
      delete window.__VESTIA_SET_DEMO_TIME__;
    };
  }, []);

  // Real-time live demo playback (when user clicks "Replay Live Demo" from Showcase modal)
  useEffect(() => {
    if (!liveDemoPlaying) return;
    setDemoMode(true);
    setCategory('all');
    setSearchQuery('');
    const startTs = performance.now();

    const step = (now: number) => {
      const elapsed = (now - startTs) / 1000;
      if (elapsed >= DEMO_TOTAL_DURATION_SEC) {
        setDemoTime(DEMO_TOTAL_DURATION_SEC);
        setLiveDemoPlaying(false);
        return;
      }
      setDemoTime(elapsed);
      liveDemoRafRef.current = requestAnimationFrame(step);
    };

    liveDemoRafRef.current = requestAnimationFrame(step);
    return () => {
      if (liveDemoRafRef.current !== null) {
        cancelAnimationFrame(liveDemoRafRef.current);
      }
    };
  }, [liveDemoPlaying]);

  // Interactive 0.85s clip-path reveal driver
  const triggerReveal = useCallback(
    (fromKey: string, zone: RevealZone) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      setPrevKey(fromKey);
      setRevealZone(zone);
      setRevealProgress(0);

      const start = performance.now();
      const durationMs = WIPE_DURATION_SEC * 1000;

      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / durationMs);
        setRevealProgress(p);
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSelectItem = useCallback(
    (item: CatalogItem) => {
      if (demoMode) return;
      const beforeKey = getLookKey(outfit.topId, outfit.skirtId, outfit.bagId);
      const res = selectCatalogItem(outfit, item);
      setNotice(res.notice);
      if (res.changed) {
        setOutfit(res.nextState);
        setTryingOnLabel(res.tryingOnLabel);
        triggerReveal(beforeKey, res.zone);
      }
    },
    [demoMode, outfit, triggerReveal]
  );

  const handleSelectCompleteLook = useCallback(
    (look: CompleteLook) => {
      if (demoMode) return;
      const beforeKey = getLookKey(outfit.topId, outfit.skirtId, outfit.bagId);
      const res = applyCompleteLook(outfit, look);
      setNotice(null);
      if (res.changed) {
        setOutfit(res.nextState);
        setTryingOnLabel(res.tryingOnLabel);
        triggerReveal(beforeKey, res.zone);
      }
    },
    [demoMode, outfit, triggerReveal]
  );

  const handleApplySuggestedLook = useCallback(
    (lookId: string) => {
      const look = COMPLETE_LOOKS.find((l) => l.id === lookId);
      if (look) handleSelectCompleteLook(look);
    },
    [handleSelectCompleteLook]
  );

  const handleRemoveBag = useCallback(() => {
    if (demoMode || !outfit.bagId) return;
    const bag = ITEM_BY_ID[outfit.bagId];
    if (bag) handleSelectItem(bag);
  }, [demoMode, outfit.bagId, handleSelectItem]);

  // Resolve render state: purely time-driven in Demo Mode, interactive otherwise
  const demoFrame = demoMode
    ? evaluateDemoAt(demoTime, measuredAnchors)
    : null;

  const renderOutfit = demoFrame ? demoFrame.outfit : outfit;
  const renderActiveKey = demoFrame
    ? demoFrame.activeKey
    : getLookKey(outfit.topId, outfit.skirtId, outfit.bagId);
  const renderPrevKey = demoFrame ? demoFrame.prevKey : prevKey;
  const renderZone = demoFrame ? demoFrame.revealZone : revealZone;
  const renderProgress = demoFrame ? demoFrame.revealProgress : revealProgress;
  const renderTryingOn = demoFrame ? demoFrame.tryingOnLabel : tryingOnLabel;
  const renderShopOpen = demoFrame ? demoFrame.shopDrawerOpen : shopDrawerOpen;
  const highlightedTarget = demoFrame ? demoFrame.highlightedTarget : null;

  const isUrlCaptureDemo = initialParams.isDemo;

  return (
    <div
      className={`w-screen h-screen bg-[#ECE9E2] flex items-center justify-center overflow-hidden ${
        demoMode ? 'demo-mode' : ''
      }`}
    >
      {/* Fixed 1920x1080 proportionally scaled master canvas */}
      <div
        ref={canvasRef}
        data-testid="vestia-canvas"
        data-demo-mode={demoMode ? 'true' : 'false'}
        style={{
          width: `${CANVAS_W}px`,
          height: `${CANVAS_H}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="relative flex bg-[#F6F4EF] text-[#181715] shadow-[0_24px_80px_rgba(24,23,21,0.14)] overflow-hidden shrink-0"
      >
        {/* Left Column: Brand, Search, Tabs, 3x3 Product Cards */}
        <CatalogColumn
          outfit={renderOutfit}
          category={category}
          searchQuery={searchQuery}
          onCategoryChange={setCategory}
          onSearchChange={setSearchQuery}
          onSelectItem={handleSelectItem}
          onOpenShowcase={() => setShowcaseOpen(true)}
          demoMode={demoMode}
          highlightedTarget={highlightedTarget}
        />

        {/* Center Column: Pure White Model Stage with Pre-Stacked Clip-Path Wipe */}
        <ModelStage
          outfit={renderOutfit}
          activeKey={renderActiveKey}
          prevKey={renderPrevKey}
          revealZone={renderZone}
          revealProgress={renderProgress}
          tryingOnLabel={renderTryingOn}
          notice={demoMode ? null : notice}
          onDismissNotice={() => setNotice(null)}
          onApplySuggestedLook={handleApplySuggestedLook}
          onRemoveBag={handleRemoveBag}
        />

        {/* Right Column: Your Look, Style & Fit, Shop CTA, 3 Complete Looks */}
        <LookPanel
          outfit={renderOutfit}
          onSelectCompleteLook={handleSelectCompleteLook}
          onShopTheLook={() => setShopDrawerOpen(true)}
          highlightedTarget={highlightedTarget}
        />

        {/* Curated Shop the Look Drawer */}
        <ShopLookDrawer
          open={renderShopOpen}
          outfit={renderOutfit}
          onClose={() => setShopDrawerOpen(false)}
        />

        {/* Deterministic Demo Cursor + Click Ripple */}
        {demoFrame && <DemoOverlay frame={demoFrame} />}

        {/* Exit bar ONLY during interactive in-app Live Demo replay (never during ?demo=1 capture) */}
        {demoMode && !isUrlCaptureDemo && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 px-5 py-2.5 bg-[#181715]/92 text-[#F6F4EF]">
            <span className="text-[12px] tracking-[0.08em] uppercase tabular-nums">
              Live Demo · {demoTime.toFixed(1)}s / {DEMO_TOTAL_DURATION_SEC.toFixed(0)}s
            </span>
            <button
              type="button"
              onClick={() => {
                setLiveDemoPlaying(false);
                setDemoMode(false);
              }}
              className="px-3 py-1 bg-[#F6F4EF] text-[#181715] text-[11px] font-semibold tracking-[0.08em] uppercase cursor-pointer"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Showcase Video Preview Modal */}
        <ShowcaseModal
          open={showcaseOpen}
          onClose={() => setShowcaseOpen(false)}
          onStartLiveDemo={() => {
            setDemoTime(0);
            setLiveDemoPlaying(true);
          }}
        />
      </div>
    </div>
  );
}
