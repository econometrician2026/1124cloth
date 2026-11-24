import React from 'react';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import {
  COMPLETE_LOOKS,
  CompleteLook,
  getLookImagePath,
  ITEM_BY_ID,
} from '../data/catalog';
import {
  calculateLookTotal,
  getActiveItems,
  getLookKey,
  getStyleMetrics,
  OutfitState,
} from '../utils/tryOnLogic';
import { DemoTargetKey } from '../utils/demoTimeline';

interface LookPanelProps {
  outfit: OutfitState;
  onSelectCompleteLook: (look: CompleteLook) => void;
  onShopTheLook: () => void;
  highlightedTarget: DemoTargetKey | null;
}

export const LookPanel: React.FC<LookPanelProps> = ({
  outfit,
  onSelectCompleteLook,
  onShopTheLook,
  highlightedTarget,
}) => {
  const activeItems = getActiveItems(outfit);
  const totalPrice = calculateLookTotal(outfit);
  const metrics = getStyleMetrics(outfit);

  const scoreRows = [
    { label: 'Silhouette', value: metrics.silhouette },
    { label: 'Color Harmony', value: metrics.harmony },
    { label: 'Versatility', value: metrics.versatility },
  ];

  return (
    <aside
      aria-label="Your Look Summary"
      className="w-[540px] h-full bg-[#F6F4EF] border-l border-[#181715]/10 px-[36px] pt-[28px] pb-[24px] flex flex-col justify-between shrink-0 select-none"
    >
      {/* Top: Your Look Breakdown */}
      <div>
        <div className="flex items-baseline justify-between mb-[14px]">
          <h2 className="font-editorial text-[30px] leading-none font-medium text-[#181715]">
            Your Look
          </h2>
          <span className="text-[12px] text-[#7A746B] tabular-nums">
            {activeItems.length} {activeItems.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>

        <div className="bg-white border border-[#181715]/10 divide-y divide-[#181715]/8">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[44px] h-[44px] bg-white border border-[#181715]/8 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="studio-product-img w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#8B857C]">
                    {item.brand}
                  </div>
                  <div className="text-[13.5px] font-semibold text-[#181715] truncate">
                    {item.name}
                  </div>
                </div>
              </div>
              <span className="text-[13.5px] font-medium text-[#181715] tabular-nums shrink-0">
                ${item.price}
              </span>
            </div>
          ))}

          {/* Placeholder row if no bag selected so vertical height stays rock-steady */}
          {!outfit.bagId && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#FCFBFA]">
              <div className="flex items-center gap-3">
                <div className="w-[44px] h-[44px] border border-dashed border-[#181715]/20 flex items-center justify-center text-[#A09A90]">
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] tracking-[0.12em] uppercase text-[#9A948B]">
                    Accessory
                  </div>
                  <div className="text-[12.5px] text-[#7A746B]">
                    No handbag selected
                  </div>
                </div>
              </div>
              <span className="text-[12px] text-[#9A948B] tabular-nums">—</span>
            </div>
          )}

          {/* Total row */}
          <div className="flex items-baseline justify-between px-4 py-3 bg-[#FAF9F6]">
            <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#5C5852]">
              Total
            </span>
            <span
              data-testid="look-total-price"
              className="font-editorial text-[28px] leading-none font-semibold text-[#181715] tabular-nums"
            >
              ${totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Style & Fit 3 Scores + Primary Shop CTA */}
      <div className="my-[16px]">
        <div className="flex items-baseline justify-between mb-[10px]">
          <h3 className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#4B4741]">
            Style &amp; Fit
          </h3>
          <span className="text-[11px] text-[#8B857C]">Atelier Index</span>
        </div>

        <p className="text-[12.5px] leading-relaxed text-[#5C5852] mb-[14px]">
          {metrics.note}
        </p>

        <div className="space-y-3 mb-[18px]">
          {scoreRows.map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-[12px] mb-1.5">
                <span className="font-medium text-[#2C2A26]">{row.label}</span>
                <span className="text-[#5C5852] tabular-nums font-medium">
                  {row.value} / 100
                </span>
              </div>
              <div className="w-full h-[4px] bg-[#E3DED5] overflow-hidden">
                <div
                  className="h-full bg-[#181715] transition-all duration-300"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          data-demo-target="shop-the-look"
          onClick={onShopTheLook}
          className={`w-full h-[50px] bg-[#181715] text-[#F6F4EF] text-[13px] font-semibold tracking-[0.1em] uppercase flex items-center justify-center gap-2.5 transition-colors cursor-pointer hover:bg-[#2C2A26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181715] ${
            highlightedTarget === 'shop-the-look' ? 'bg-[#2C2A26] ring-2 ring-[#181715]/30' : ''
          }`}
        >
          <span>Shop the look</span>
          <span aria-hidden="true" className="text-[#8B857C]">
            ·
          </span>
          <span className="tabular-nums">${totalPrice.toLocaleString()}</span>
          <ArrowUpRight className="w-4 h-4 ml-0.5" aria-hidden="true" />
        </button>
      </div>

      {/* Bottom: 3 Complete Looks One-Click Cards */}
      <div>
        <div className="flex items-baseline justify-between mb-[10px]">
          <h3 className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#4B4741]">
            Complete looks
          </h3>
          <span className="text-[11px] text-[#8B857C]">
            One-click styling
          </span>
        </div>

        <div className="flex flex-col gap-[10px]">
          {COMPLETE_LOOKS.map((look) => {
            const lookKey = getLookKey(look.topId, look.skirtId, look.bagId);
            const lookTotal =
              (ITEM_BY_ID[look.topId]?.price ?? 0) +
              (ITEM_BY_ID[look.skirtId]?.price ?? 0) +
              (ITEM_BY_ID[look.bagId]?.price ?? 0);
            const isActiveLook =
              outfit.topId === look.topId &&
              outfit.skirtId === look.skirtId &&
              outfit.bagId === look.bagId;
            const demoHighlighted = highlightedTarget === look.id;

            return (
              <button
                key={look.id}
                type="button"
                data-demo-target={look.id}
                onClick={() => onSelectCompleteLook(look)}
                aria-pressed={isActiveLook}
                aria-label={`Apply complete look ${look.title}, $${lookTotal}`}
                className={`group w-full bg-white p-2.5 flex items-center gap-3.5 text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181715] ${
                  isActiveLook
                    ? 'ring-2 ring-[#181715] border border-[#181715]'
                    : demoHighlighted
                      ? 'ring-1 ring-[#181715]/60 border border-[#181715]/50'
                      : 'border border-[#181715]/10 hover:border-[#181715]/40'
                }`}
              >
                <div className="w-[56px] h-[82px] bg-white overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={getLookImagePath(lookKey)}
                    alt={look.title}
                    referrerPolicy="no-referrer"
                    className="studio-model-img w-full h-full object-cover object-top"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-editorial text-[21px] leading-tight font-medium text-[#181715] truncate">
                      {look.title}
                    </span>
                    {isActiveLook ? (
                      <span className="bg-[#181715] text-[#F6F4EF] text-[9px] font-semibold tracking-[0.14em] uppercase px-2 py-[3px] shrink-0">
                        WEARING
                      </span>
                    ) : (
                      <span className="text-[12.5px] font-medium text-[#4B4741] tabular-nums shrink-0">
                        ${lookTotal.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#7A746B] truncate mt-0.5">
                    {look.subtitle}
                  </p>
                  <div className="text-[11px] text-[#9A948B] truncate mt-1.5">
                    {ITEM_BY_ID[look.topId]?.name} · {ITEM_BY_ID[look.skirtId]?.name} ·{' '}
                    {ITEM_BY_ID[look.bagId]?.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
