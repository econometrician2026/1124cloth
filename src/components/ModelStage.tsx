import React from 'react';
import { X } from 'lucide-react';
import {
  AVAILABLE_LOOK_KEYS,
  COMPLETE_LOOKS,
  getLookImagePath,
} from '../data/catalog';
import {
  computeRevealGeometry,
  getActiveItems,
  OutfitState,
  RevealZone,
  TryOnNotice,
} from '../utils/tryOnLogic';

interface ModelStageProps {
  outfit: OutfitState;
  activeKey: string;
  prevKey: string;
  revealZone: RevealZone;
  revealProgress: number;
  tryingOnLabel: string;
  notice: TryOnNotice | null;
  onDismissNotice: () => void;
  onApplySuggestedLook: (lookId: string) => void;
  onRemoveBag: () => void;
}

export const ModelStage: React.FC<ModelStageProps> = ({
  outfit,
  activeKey,
  prevKey,
  revealZone,
  revealProgress,
  tryingOnLabel,
  notice,
  onDismissNotice,
  onApplySuggestedLook,
  onRemoveBag,
}) => {
  const isTransitioning = prevKey !== activeKey && revealProgress < 1;
  const geometry = isTransitioning
    ? computeRevealGeometry(revealZone, revealProgress)
    : computeRevealGeometry(revealZone, 1);

  const activeItems = getActiveItems(outfit);
  const suggestedLook = notice?.suggestedLookId
    ? COMPLETE_LOOKS.find((l) => l.id === notice.suggestedLookId)
    : null;

  return (
    <main
      aria-label="Virtual Fitting Stage"
      data-testid="model-stage"
      data-active-look={activeKey}
      className="relative w-[740px] h-full bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 select-none"
    >
      {/* Top "Trying on · Product Name" editorial prompt */}
      <div
        aria-live="polite"
        data-testid="trying-on-banner"
        className="absolute top-[28px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-5 py-2 bg-white/95 border border-[#181715]/10"
      >
        <span className="text-[12px] tracking-[0.06em] text-[#7A746B] whitespace-nowrap">
          Trying on
        </span>
        <span aria-hidden="true" className="text-[#8B857C] font-semibold">
          ·
        </span>
        <span className="text-[13px] font-semibold tracking-[0.01em] text-[#181715] whitespace-nowrap">
          {tryingOnLabel}
        </span>
      </div>

      {/* Left vertical strip of currently worn piece thumbnails */}
      <div
        aria-label="Currently worn items"
        className="absolute left-[26px] top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3"
      >
        {activeItems.map((item) => {
          const isBag = item.category === 'bag';
          return (
            <div
              key={item.id}
              className="group relative w-[68px] bg-[#FAF9F6] border border-[#181715]/12 p-1.5 flex flex-col items-center"
            >
              {isBag && (
                <button
                  type="button"
                  onClick={onRemoveBag}
                  aria-label={`Remove ${item.name}`}
                  title="Remove bag"
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#181715] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              )}
              <div className="w-[54px] h-[54px] bg-white flex items-center justify-center p-1">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="studio-product-img w-full h-full object-contain"
                />
              </div>
              <span className="mt-1 text-[9px] font-medium tracking-[0.12em] uppercase text-[#6D675F]">
                {item.category}
              </span>
            </div>
          );
        })}
      </div>

      {/* Center 9:16 Full-Body Model Canvas */}
      <div className="relative w-[548px] h-[982px] flex items-center justify-center">
        {/* Soft elliptical floor shadow beneath the model's feet */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[50px] left-1/2 -translate-x-1/2 w-[265px] h-[28px] rounded-full z-20"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(24,23,21,0.16) 0%, rgba(24,23,21,0.07) 44%, rgba(24,23,21,0) 74%)',
          }}
        />

        {/* Pre-stacked outfit image layers — strictly NO mix-blend-mode so transitions never darken */}
        <div className="studio-model-frame relative w-full h-full overflow-hidden bg-white">
          {AVAILABLE_LOOK_KEYS.map((key) => {
            const isActive = key === activeKey;
            const isPrev = isTransitioning && key === prevKey;

            let zIndex = 0;
            let opacity = 0;
            let clipPath: string | undefined = undefined;

            if (isActive) {
              zIndex = 2;
              opacity = 1;
              clipPath = isTransitioning ? geometry.clipPath : 'inset(0% 0% 0% 0%)';
            } else if (isPrev) {
              zIndex = 1;
              opacity = 1;
              clipPath = 'inset(0% 0% 0% 0%)';
            }

            return (
              <img
                key={key}
                src={getLookImagePath(key)}
                alt={isActive ? `Model wearing ${tryingOnLabel}` : ''}
                aria-hidden={!isActive}
                referrerPolicy="no-referrer"
                decoding="sync"
                loading="eager"
                className="studio-model-img absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{
                  zIndex,
                  opacity,
                  clipPath,
                  WebkitClipPath: clipPath,
                }}
              />
            );
          })}

          {/* Synchronized glowing white reveal scanline */}
          {isTransitioning && geometry.showLine && (
            <div
              aria-hidden="true"
              data-testid="reveal-scanline"
              className="wipe-scanline absolute z-10 pointer-events-none"
              style={{
                top: `${geometry.lineTopPct}%`,
                left: `${geometry.lineLeftPct}%`,
                width: `${geometry.lineWidthPct}%`,
                opacity: geometry.lineOpacity,
                transform: 'translateY(-50%)',
              }}
            />
          )}
        </div>
      </div>

      {/* Gentle non-error guidance notice when clicking an unavailable bag combo */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          data-testid="tryon-notice"
          className="absolute bottom-[28px] left-1/2 -translate-x-1/2 z-40 w-[560px] bg-[#181715] text-[#F6F4EF] px-5 py-3.5 flex items-center justify-between gap-4 shadow-lg"
        >
          <p className="text-[12.5px] leading-snug text-[#ECE8E0]">
            {notice.message}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {suggestedLook && (
              <button
                type="button"
                onClick={() => onApplySuggestedLook(suggestedLook.id)}
                className="px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase bg-[#F6F4EF] text-[#181715] hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Try {suggestedLook.title}
              </button>
            )}
            <button
              type="button"
              onClick={onDismissNotice}
              aria-label="Dismiss notice"
              className="p-1 text-[#A9A39A] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
