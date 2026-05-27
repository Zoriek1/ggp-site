/**
 * Resolve a URL final de um PDF/arquivo: URL externa tem precedência sobre upload.
 * Quando migrarmos para R2/servidor UFG, basta preencher `pdfUrl` no Sanity.
 */
export const resolvePdf = (doc: { pdfUrl?: string | null; pdfFileUrl?: string | null }): string | null =>
  doc.pdfUrl?.trim() || doc.pdfFileUrl?.trim() || null;
