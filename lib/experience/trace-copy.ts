import type { Locale } from "@/design-system/i18n/locale";

const COPY: Record<string, { en: string; es: string }> = {
  "batch.1": { en: "references 1 to 5 checked", es: "referencias 1 a 5 revisadas" },
  "batch.2": { en: "references 6 to 10 checked", es: "referencias 6 a 10 revisadas" },
  "batch.3": { en: "references 11 to 15 checked", es: "referencias 11 a 15 revisadas" },
  "batch.4": { en: "references 16 to 19 checked", es: "referencias 16 a 19 revisadas" },
};
export function traceCopy(locale: Locale, key: string) { return COPY[key]?.[locale] ?? key; }
