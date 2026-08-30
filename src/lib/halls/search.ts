export type HallQuickSearch = {
  label: string;
  query: string;
};

const SEARCH_ALIASES: Record<string, string> = {
  "豐州": "豊洲",
  "toy０su": "豊洲",
  "toyosu": "豊洲",
  "澀谷": "渋谷",
  "涩谷": "渋谷",
  "shibuya": "渋谷",
  "新宿": "新宿",
  "shinjuku": "新宿",
  "池袋": "池袋",
  "ikebukuro": "池袋",
  "秋葉原": "秋葉原",
  "akihabara": "秋葉原",
  "上野": "上野",
  "ueno": "上野",
  "橫濱": "横浜",
  "横滨": "横浜",
  "yokohama": "横浜",
  "難波": "難波",
  "namba": "難波",
};

export const HALL_QUICK_SEARCHES: HallQuickSearch[] = [
  { label: "新宿", query: "新宿" },
  { label: "池袋", query: "池袋" },
  { label: "秋葉原", query: "秋葉原" },
  { label: "上野", query: "上野" },
  { label: "澀谷", query: "渋谷" },
  { label: "豐洲", query: "豊洲" },
];

function aliasKey(value: string) {
  return value.normalize("NFKC").trim().toLowerCase().replace(/[\s\-ー]+/g, "");
}

export function normalizeHallSearchQuery(value: string) {
  const trimmed = value.normalize("NFKC").trim();
  if (!trimmed) return { query: "", changed: false };
  const translated = SEARCH_ALIASES[aliasKey(trimmed)] ?? trimmed;
  return { query: translated, changed: translated !== trimmed };
}

export const NEARBY_SLOT_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=%E3%83%91%E3%83%81%E3%82%B9%E3%83%AD";
