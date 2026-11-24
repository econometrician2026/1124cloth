export type ItemCategory = 'top' | 'skirt' | 'bag';

export interface CatalogItem {
  id: string;
  category: ItemCategory;
  name: string;
  brand: string;
  price: number;
  color: string;
  fabric: string;
  image: string;
}

export interface CompleteLook {
  id: string;
  title: string;
  subtitle: string;
  topId: string;
  skirtId: string;
  bagId: string;
}

export interface StyleMetrics {
  silhouette: number;
  harmony: number;
  versatility: number;
  note: string;
}

export const CATALOG_ITEMS: CatalogItem[] = [
  // Tops
  {
    id: 'T01',
    category: 'top',
    name: 'Atelier Linen Vest',
    brand: 'MAISON SOLIS',
    price: 280,
    color: 'Warm Ivory',
    fabric: '100% Belgian Linen',
    image: '/img/T01.jpg',
  },
  {
    id: 'T02',
    category: 'top',
    name: 'Silk Draped Blouse',
    brand: 'LUNE NOIRE',
    price: 340,
    color: 'Champagne Taupe',
    fabric: 'Mulberry Charmeuse',
    image: '/img/T02.jpg',
  },
  {
    id: 'T03',
    category: 'top',
    name: 'Cashmere Knit Cardigan',
    brand: 'KOVA STUDIO',
    price: 390,
    color: 'Deep Espresso',
    fabric: 'Fine-Gauge Cashmere',
    image: '/img/T03.jpg',
  },

  // Skirts
  {
    id: 'S01',
    category: 'skirt',
    name: 'Pleated Midi Skirt',
    brand: 'AURELIA',
    price: 320,
    color: 'Camel Sand',
    fabric: 'Virgin Wool-Silk',
    image: '/img/S01.jpg',
  },
  {
    id: 'S02',
    category: 'skirt',
    name: 'Bias-Cut Satin Skirt',
    brand: 'NOCTURNE',
    price: 295,
    color: 'Midnight Black',
    fabric: 'Heavyweight Satin',
    image: '/img/S02.jpg',
  },
  {
    id: 'S03',
    category: 'skirt',
    name: 'Structured A-Line Skirt',
    brand: 'VERRE & CO',
    price: 360,
    color: 'Muted Sage',
    fabric: 'Compact Cotton Twill',
    image: '/img/S03.jpg',
  },

  // Bags
  {
    id: 'B01',
    category: 'bag',
    name: 'Sculpted Saddle Tote',
    brand: 'MARAUX',
    price: 680,
    color: 'Cognac Tan',
    fabric: 'Smooth Calfskin',
    image: '/img/B01.jpg',
  },
  {
    id: 'B02',
    category: 'bag',
    name: 'Crescent Leather Pouch',
    brand: 'SOVEREIGN',
    price: 540,
    color: 'Obsidian',
    fabric: 'Pebbled Leather',
    image: '/img/B02.jpg',
  },
  {
    id: 'B03',
    category: 'bag',
    name: 'Woven Ivory Clutch',
    brand: 'ATELIER NORD',
    price: 610,
    color: 'Chalk Cream',
    fabric: 'Intrecciato Nappa',
    image: '/img/B03.jpg',
  },
];

export const TOPS = CATALOG_ITEMS.filter((i) => i.category === 'top');
export const SKIRTS = CATALOG_ITEMS.filter((i) => i.category === 'skirt');
export const BAGS = CATALOG_ITEMS.filter((i) => i.category === 'bag');

export const ITEM_BY_ID: Record<string, CatalogItem> = Object.fromEntries(
  CATALOG_ITEMS.map((item) => [item.id, item])
);

// All 18 generated outfit combinations with exact canonical filenames: Top_Skirt_Bag.jpg
export const AVAILABLE_LOOK_KEYS: readonly string[] = [
  // 9 Top x Skirt base looks (no bag = 00)
  'T01_S01_00',
  'T01_S02_00',
  'T01_S03_00',
  'T02_S01_00',
  'T02_S02_00',
  'T02_S03_00',
  'T03_S01_00',
  'T03_S02_00',
  'T03_S03_00',
  // 9 Signature Hero Look + Bag pairings (covering all 3 tops & 3 skirts)
  'T01_S01_B01',
  'T01_S01_B02',
  'T01_S01_B03',
  'T02_S02_B01',
  'T02_S02_B02',
  'T02_S02_B03',
  'T03_S03_B01',
  'T03_S03_B02',
  'T03_S03_B03',
] as const;

export const AVAILABLE_LOOK_SET = new Set<string>(AVAILABLE_LOOK_KEYS);

export const COMPLETE_LOOKS: CompleteLook[] = [
  {
    id: 'look-1',
    title: 'Atelier Dawn',
    subtitle: 'Tailored linen & pleated camel',
    topId: 'T01',
    skirtId: 'S01',
    bagId: 'B01',
  },
  {
    id: 'look-2',
    title: 'Evening Fluidity',
    subtitle: 'Draped silk & midnight satin',
    topId: 'T02',
    skirtId: 'S02',
    bagId: 'B02',
  },
  {
    id: 'look-3',
    title: 'Gallery Tailored',
    subtitle: 'Fine cashmere & architectural twill',
    topId: 'T03',
    skirtId: 'S03',
    bagId: 'B03',
  },
];

export const STYLE_METRICS_BY_PAIR: Record<string, StyleMetrics> = {
  T01_S01: {
    silhouette: 96,
    harmony: 95,
    versatility: 92,
    note: 'Crisp waist definition balances fluid accordion pleating.',
  },
  T01_S02: {
    silhouette: 93,
    harmony: 91,
    versatility: 89,
    note: 'Matte linen tailoring contrasts cleanly with liquid satin.',
  },
  T01_S03: {
    silhouette: 91,
    harmony: 90,
    versatility: 94,
    note: 'Structured tonal neutrals suited for daytime gallery wear.',
  },
  T02_S01: {
    silhouette: 89,
    harmony: 93,
    versatility: 88,
    note: 'Warm champagne luster softens crisp wool-silk folds.',
  },
  T02_S02: {
    silhouette: 98,
    harmony: 97,
    versatility: 91,
    note: 'Elongated column drape with effortless evening poise.',
  },
  T02_S03: {
    silhouette: 90,
    harmony: 89,
    versatility: 90,
    note: 'Soft cowl drape offsets architectural A-line structure.',
  },
  T03_S01: {
    silhouette: 92,
    harmony: 94,
    versatility: 95,
    note: 'Cropped espresso knit frames a warm camel waistline.',
  },
  T03_S02: {
    silhouette: 94,
    harmony: 92,
    versatility: 93,
    note: 'Monochrome texture play from matte cashmere to sheen.',
  },
  T03_S03: {
    silhouette: 97,
    harmony: 96,
    versatility: 95,
    note: 'Architectural proportions anchored by deep muted tones.',
  },
};

export function getLookImagePath(key: string): string {
  return `/img/${key}.jpg`;
}
