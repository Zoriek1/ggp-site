/** Helpers compartilhados pelos módulos de seed — respeitam o shape exato dos schemas. */

export type Localized = { pt: string; en?: string };

export const lstr = (pt: string, en?: string): Localized => (en ? { pt, en } : { pt });

export const lslug = (pt: string, en?: string) => ({
  pt: { _type: "slug", current: pt },
  ...(en ? { en: { _type: "slug", current: en } } : {}),
});

export const ref = (id: string) => ({ _type: "reference", _ref: id });

export const refArray = (ids: readonly string[]) =>
  ids.map((id, i) => ({ _key: `r${i}-${id.slice(0, 8)}`, ...ref(id) }));
