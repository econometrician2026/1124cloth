import React from 'react';
import { Play, Search, X } from 'lucide-react';
import {
  BAGS,
  CatalogItem,
  SKIRTS,
  TOPS,
} from '../data/catalog';
import {
  filterCatalogItems,
  OutfitState,
  supportsBagsForPair,
} from '../utils/tryOnLogic';
import { DemoTargetKey } from '../utils/demoTimeline';

export type CategoryFilter = 'all' | 'top' | 'skirt' | 'bag';

interface CatalogColumnProps {
  outfit: OutfitState;
  category: CategoryFilter;
  searchQuery: string;
  onCategoryChange: (cat: CategoryFilter) => void;
  onSearchChange: (q: string) => void;
  onSelectItem: (item: CatalogItem) => void;
  onOpenShowcase?: () => void;
  demoMode: boolean;
  highlightedTarget: DemoTargetKey | null;
}

const TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'top', label: 'Tops' },
  { id: 'skirt', label: 'Skirts' },
  { id: 'bag', label: 'Bags' },
];

export const CatalogColumn: React.FC<CatalogColumnProps> = ({
  outfit,
  category,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onSelectItem,
  onOpenShowcase,
  demoMode,
  highlightedTarget,
}) => {
  const bagsSupported = supportsBagsForPair(outfit.topId, outfit.skirtId);

  const rawSections: {
    id: 'top' | 'skirt' | 'bag';
    label: string;
    items: CatalogItem[];
  }[] = [
    {
      id: 'top',
      label: 'Tops',
      items: filterCatalogItems(TOPS, category === 'all' ? 'top' : category, searchQuery),
    },
    {
      id: 'skirt',
      label: 'Skirts',
      items: filterCatalogItems(SKIRTS, category === 'all' ? 'skirt' : category, searchQuery),
    },
    {
      id: 'bag',
      label: 'Bags',
      items: filterCatalogItems(BAGS, category === 'all' ? 'bag' : category, searchQuery),
    },
  ];

  const sections = rawSections.filter((sec) => {
    if (category !== 'all' && sec.id !== category) return false;
    return sec.items.length > 0;
  });

  const isWearing = (item: CatalogItem) => {
    if (item.category === 'top') return outfit.topId === item.id;
    if (item.category === 'skirt') return outfit.skirtId === item.id;
    return outfit.bagId === item.id;
  };

  return (
    <aside
      aria-label="Wardrobe Catalog"
      className="w-[640px] h-full bg-[#F6F4EF] border-r border-[#181715]/10 px-[34px] pt-[28px] pb-[24px] flex flex-col shrink-0 select-none"
    >
      {/* Brand Title Header */}
      <header className="flex items-baseline justify-between mb-[16px]">
        <div className="flex items-baseline gap-3">
          <h1 className="font-editorial text-[42px] leading-none font-medium tracking-[0.18em] text-[#181715]">
            VESTIA
          </h1>
          <span className="text-[11px] tracking-[0.16em] uppercase text-[#8B857C]">
            Virtual Atelier
          </span>
        </div>

        {!demoMode && onOpenShowcase && (
          <button
            type="button"
            onClick={onOpenShowcase}
            aria-label="Preview showcase film"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5C5852] hover:text-[#181715] border-b border-transparent hover:border-[#181715] pb-0.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>Showcase</span>
          </button>
        )}
      </header>

      {/* Search Bar */}
      <div className="relative mb-[14px]">
        <Search
          className="w-4 h-4 text-[#8B857C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <label htmlFor="vestia-catalog-search" className="sr-only">
          Search garments and accessories
        </label>
        <input
          id="vestia-catalog-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search silhouettes, fabrics, or designers"
          className="w-full h-[38px] bg-white border border-[#181715]/12 pl-10 pr-9 text-[13px] text-[#181715] placeholder:text-[#9A948B] focus:outline-none focus:border-[#181715]/45 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8B857C] hover:text-[#181715] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div
        role="tablist"
        aria-label="Garment categories"
        className="flex items-center gap-6 border-b border-[#181715]/10 mb-[16px]"
      >
        {TABS.map((tab) => {
          const active = category === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onCategoryChange(tab.id)}
              className={`pb-2.5 text-[13px] font-medium tracking-[0.04em] border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? 'border-[#181715] text-[#181715]'
                  : 'border-transparent text-[#7A746B] hover:text-[#181715]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Product Rows (Tops / Skirts / Bags — 3 cards per row) */}
      <div className="flex-1 flex flex-col justify-between gap-[16px] overflow-y-auto vestia-scroll pr-0.5">
        {sections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <p className="font-editorial text-[24px] text-[#181715] mb-2">
              No matching pieces
            </p>
            <p className="text-[13px] text-[#7A746B] mb-4">
              Try another fabric, silhouette, or clear your search filter.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('all');
              }}
              className="px-4 py-2 text-[12px] font-medium bg-[#181715] text-[#F6F4EF] hover:bg-[#2F2D29] transition-colors cursor-pointer"
            >
              Reset catalog
            </button>
          </div>
        ) : (
          sections.map((section) => (
            <section
              key={section.id}
              aria-label={section.label}
              className="flex flex-col"
            >
              <div className="flex items-baseline justify-between mb-[8px]">
                <h2 className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#4B4741]">
                  {section.label}
                </h2>
                <span className="text-[11px] text-[#8B857C] tabular-nums">
                  {section.id === 'bag' && !bagsSupported
                    ? 'Signature pairings only'
                    : `0${section.items.length} pieces`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-[12px]">
                {section.items.map((item) => {
                  const wearing = isWearing(item);
                  const demoHighlighted = highlightedTarget === item.id;
                  const mutedBag = item.category === 'bag' && !bagsSupported;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-demo-target={item.id}
                      onClick={() => onSelectItem(item)}
                      aria-pressed={wearing}
                      aria-label={`${wearing ? 'Wearing ' : 'Try on '}${item.name} by ${item.brand}, $${item.price}`}
                      className={`group relative flex flex-col text-left bg-white transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181715] ${
                        wearing
                          ? 'ring-2 ring-[#181715] border border-[#181715]'
                          : demoHighlighted
                            ? 'ring-1 ring-[#181715]/60 border border-[#181715]/50'
                            : 'border border-[#181715]/10 hover:border-[#181715]/40'
                      }`}
                    >
                      {/* WEARING label on active item */}
                      {wearing && (
                        <span className="absolute top-2 left-2 z-10 bg-[#181715] text-[#F6F4EF] text-[9px] font-semibold tracking-[0.16em] uppercase px-2 py-[3px] leading-none">
                          WEARING
                        </span>
                      )}

                      {/* White flat-lay product thumbnail */}
                      <div className="w-full h-[156px] bg-white flex items-center justify-center p-2.5 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className={`studio-product-img w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.03] ${
                            mutedBag ? 'opacity-70' : 'opacity-100'
                          }`}
                        />
                      </div>

                      {/* Crisp metadata footer */}
                      <div className="px-2.5 pt-2 pb-2.5 border-t border-[#181715]/6 bg-[#FDFCFA]">
                        <div className="text-[10px] font-medium tracking-[0.11em] uppercase text-[#8B857C] truncate">
                          {item.brand}
                        </div>
                        <div className="text-[12.5px] font-semibold text-[#181715] leading-snug truncate mt-0.5">
                          {item.name}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[12px] font-medium text-[#3F3C37] tabular-nums">
                            ${item.price}
                          </span>
                          <span className="text-[10px] text-[#948E85] truncate max-w-[92px]">
                            {item.color}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </aside>
  );
};
