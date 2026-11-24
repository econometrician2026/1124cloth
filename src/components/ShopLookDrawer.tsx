import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  calculateLookTotal,
  getActiveItems,
  OutfitState,
} from '../utils/tryOnLogic';

interface ShopLookDrawerProps {
  open: boolean;
  outfit: OutfitState;
  onClose: () => void;
}

const SIZES = ['XS', 'S', 'M', 'L'] as const;

export const ShopLookDrawer: React.FC<ShopLookDrawerProps> = ({
  open,
  outfit,
  onClose,
}) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!open) return null;

  const items = getActiveItems(outfit);
  const subtotal = calculateLookTotal(outfit);

  const getSize = (id: string) => selectedSizes[id] ?? 'S';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shop the look bag"
      data-testid="shop-look-drawer"
      className="absolute inset-0 z-50 flex justify-end bg-[#181715]/8"
    >
      {/* Clickable backdrop over left/center to dismiss */}
      <button
        type="button"
        aria-label="Close shopping bag"
        onClick={() => {
          setOrderPlaced(false);
          onClose();
        }}
        className="flex-1 h-full cursor-default"
      />

      {/* Curated editorial checkout panel occupying the right 540px column cleanly */}
      <div className="w-[540px] h-full bg-[#F6F4EF] border-l border-[#181715]/18 px-[36px] py-[32px] flex flex-col justify-between shadow-[-24px_0_60px_rgba(24,23,21,0.12)]">
        <div>
          <div className="flex items-start justify-between pb-5 border-b border-[#181715]/10">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8B857C]">
                VESTIA Atelier Bag
              </span>
              <h2 className="font-editorial text-[34px] leading-tight font-medium text-[#181715] mt-1">
                {orderPlaced ? 'Order Reserved' : 'Shop the Look'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setOrderPlaced(false);
                onClose();
              }}
              aria-label="Close bag drawer"
              className="p-2 text-[#5C5852] hover:text-[#181715] border border-[#181715]/12 bg-white cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {orderPlaced ? (
            <div className="mt-8 bg-white border border-[#181715]/12 p-7">
              <div className="w-10 h-10 bg-[#181715] text-[#F6F4EF] flex items-center justify-center mb-4">
                <Check className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-editorial text-[26px] font-medium text-[#181715] mb-2">
                Curated Ensemble Reserved
              </h3>
              <p className="text-[13.5px] leading-relaxed text-[#5C5852] mb-5">
                Order #VS-8419 for {items.length} pieces has been prepared with
                complimentary garment-bag courier delivery.
              </p>
              <div className="border-t border-[#181715]/10 pt-4 flex items-baseline justify-between">
                <span className="text-[12px] tracking-[0.1em] uppercase text-[#7A746B]">
                  Confirmed Total
                </span>
                <span className="font-editorial text-[26px] font-semibold text-[#181715] tabular-nums">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3.5">
              {items.map((item) => {
                const isBag = item.category === 'bag';
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-[#181715]/10 p-4 flex items-center gap-4"
                  >
                    <div className="w-[74px] h-[74px] bg-white border border-[#181715]/8 p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="studio-product-img w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#8B857C]">
                          {item.brand}
                        </span>
                        <span className="text-[14px] font-semibold text-[#181715] tabular-nums">
                          ${item.price}
                        </span>
                      </div>
                      <div className="text-[15px] font-semibold text-[#181715] truncate mt-0.5">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-[#7A746B] mt-0.5">
                        {item.color} · {item.fabric}
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5">
                        {isBag ? (
                          <span className="text-[11px] font-medium text-[#5C5852]">
                            Size: One Size
                          </span>
                        ) : (
                          SIZES.map((sz) => {
                            const selected = getSize(item.id) === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() =>
                                  setSelectedSizes((prev) => ({
                                    ...prev,
                                    [item.id]: sz,
                                  }))
                                }
                                className={`w-7 h-6 text-[11px] font-medium border transition-colors cursor-pointer ${
                                  selected
                                    ? 'bg-[#181715] text-[#F6F4EF] border-[#181715]'
                                    : 'bg-white text-[#5C5852] border-[#181715]/15 hover:border-[#181715]/50'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer totals & action */}
        <div className="border-t border-[#181715]/12 pt-5">
          {!orderPlaced && (
            <div className="space-y-2 mb-5 text-[13px]">
              <div className="flex justify-between text-[#5C5852]">
                <span>Subtotal ({items.length} pieces)</span>
                <span className="tabular-nums">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#5C5852]">
                <span>Atelier Express Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="flex items-baseline justify-between pt-3 border-t border-[#181715]/10">
                <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#181715]">
                  Estimated Total
                </span>
                <span className="font-editorial text-[30px] leading-none font-semibold text-[#181715] tabular-nums">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {orderPlaced ? (
            <button
              type="button"
              onClick={() => {
                setOrderPlaced(false);
                onClose();
              }}
              className="w-full h-[52px] bg-[#181715] text-[#F6F4EF] text-[13px] font-semibold tracking-[0.12em] uppercase hover:bg-[#2C2A26] transition-colors cursor-pointer"
            >
              Continue Styling
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOrderPlaced(true)}
              className="w-full h-[52px] bg-[#181715] text-[#F6F4EF] text-[13px] font-semibold tracking-[0.12em] uppercase hover:bg-[#2C2A26] transition-colors cursor-pointer"
            >
              Add {items.length} Pieces to Bag · ${subtotal.toLocaleString()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
