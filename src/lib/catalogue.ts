import type { HomeContent } from "@/lib/api";

/** PDF final du catalogue de formations (fourni par le client). */
export const CATALOGUE_PDF_URL = "https://drive.google.com/file/d/1MVP2W51296Hn19gFA6wuS_gYwkjjUSrZ/view";

/** Lien Google Drive ".../file/d/<id>/view" → téléchargement direct du fichier. */
export function toDownloadUrl(url: string) {
  const id = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)?.[1];
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

/** PDF du catalogue tel que réglé dans l'admin (champ "PDF" d'un pilier), sinon celui par défaut. */
export function getCataloguePdfUrl(homeContent?: HomeContent) {
  return homeContent?.pillars?.find((p) => p.pdfUrl)?.pdfUrl || CATALOGUE_PDF_URL;
}
