export const PAGE_SIZE = 12;

export const pageBounds = (page: number) => {
  const p = Math.max(1, page);
  return { start: (p - 1) * PAGE_SIZE, end: p * PAGE_SIZE, page: p };
};

export const totalPagesFor = (total: number): number =>
  Math.max(1, Math.ceil(total / PAGE_SIZE));
