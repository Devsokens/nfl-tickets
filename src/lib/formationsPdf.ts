import { jsPDF } from "jspdf";
import type { Formation, SiteSettings } from "./api";

// Palette alignée sur l'identité NFL (or + noir profond).
const GOLD: [number, number, number] = [227, 189, 81];
const GOLD_DARK: [number, number, number] = [178, 143, 40];
const INK: [number, number, number] = [12, 13, 15];
const CHARCOAL: [number, number, number] = [28, 28, 28];
const MUTED: [number, number, number] = [120, 120, 120];

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN = 18;

async function urlToImageData(url: string): Promise<{ dataUrl: string; format: "PNG" | "JPEG" } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const format: "PNG" | "JPEG" = blob.type.includes("png") ? "PNG" : "JPEG";
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { dataUrl, format };
  } catch {
    return null;
  }
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number, siteSettings?: SiteSettings) {
  const y = PAGE_H - 12;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y - 5, PAGE_W - MARGIN, y - 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const contact = [siteSettings?.contact_email, siteSettings?.phone].filter(Boolean).join("   •   ");
  doc.text(contact || "NFL Courtier & Service", MARGIN, y);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y, { align: "right" });
}

/**
 * Génère le catalogue PDF complet : page de couverture + une page détaillée
 * par formation (image, prix, description, points clés, programme).
 */
export async function generateFormationsCatalogPdf(
  formations: Formation[],
  siteSettings?: SiteSettings
): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const [images, logo] = await Promise.all([
    Promise.all(formations.map((f) => (f.image_url ? urlToImageData(f.image_url) : Promise.resolve(null)))),
    urlToImageData("/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png"),
  ]);

  // ---------- PAGE DE COUVERTURE ----------
  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, PAGE_W, 3, "F");

  if (logo) {
    const logoW = 40;
    const logoH = 40;
    doc.addImage(logo.dataUrl, logo.format, PAGE_W / 2 - logoW / 2, 52, logoW, logoH, undefined, "FAST");
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.text("Catalogue des", PAGE_W / 2, 128, { align: "center" });
  doc.setTextColor(...GOLD);
  doc.text("Formations", PAGE_W / 2, 142, { align: "center" });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(PAGE_W / 2 - 20, 150, PAGE_W / 2 + 20, 150);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(210, 210, 210);
  doc.text(
    "Programmes d'excellence pour dirigeants et professionnels exigeants",
    PAGE_W / 2,
    163,
    { align: "center", maxWidth: 130 }
  );

  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const dateStr = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
  doc.text(`NFL Courtier & Service  —  ${dateStr}`, PAGE_W / 2, PAGE_H - 20, { align: "center" });

  // ---------- UNE PAGE PAR FORMATION ----------
  formations.forEach((formation, idx) => {
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");

    const img = images[idx];
    let cursorY: number;

    if (img) {
      const imgH = 68;
      doc.addImage(img.dataUrl, img.format, 0, 0, PAGE_W, imgH, undefined, "FAST");
      doc.setFillColor(...GOLD);
      doc.rect(0, imgH, PAGE_W, 1.2, "F");
      cursorY = imgH + 16;
    } else {
      doc.setFillColor(...INK);
      doc.rect(0, 0, PAGE_W, 26, "F");
      doc.setFillColor(...GOLD);
      doc.rect(0, 26, PAGE_W, 1.2, "F");
      cursorY = 42;
    }

    // Eyebrow (badge / catégorie)
    const eyebrow = (formation.badge || formation.category || "").toUpperCase();
    if (eyebrow) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...GOLD_DARK);
      doc.text(eyebrow, MARGIN, cursorY);
      cursorY += 9;
    }

    // Titre
    doc.setFont("times", "bold");
    doc.setFontSize(21);
    doc.setTextColor(...CHARCOAL);
    const titleLines = doc.splitTextToSize(formation.title, PAGE_W - MARGIN * 2);
    doc.text(titleLines, MARGIN, cursorY);
    cursorY += titleLines.length * 8.5 + 5;

    // Prix
    const priceLabel = formation.price
      ? `${formation.price.toLocaleString("fr-FR")} ${formation.currency || "XAF"}`
      : "Sur devis / inscription sur-mesure";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...GOLD_DARK);
    doc.text(priceLabel, MARGIN, cursorY);
    cursorY += 11;

    // Description
    if (formation.description) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(90, 90, 90);
      const descLines = doc.splitTextToSize(formation.description, PAGE_W - MARGIN * 2);
      doc.text(descLines, MARGIN, cursorY);
      cursorY += descLines.length * 5.5 + 9;
    }

    // Points clés
    const bullets = formation.bullets || [];
    if (bullets.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...CHARCOAL);
      doc.text("POINTS CLÉS", MARGIN, cursorY);
      cursorY += 7;
      bullets.forEach((b) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...GOLD_DARK);
        doc.text("•", MARGIN, cursorY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(70, 70, 70);
        const lines = doc.splitTextToSize(b, PAGE_W - MARGIN * 2 - 6);
        doc.text(lines, MARGIN + 6, cursorY);
        cursorY += lines.length * 5.3 + 2.5;
      });
      cursorY += 6;
    }

    // Programme
    const program = formation.program || [];
    if (program.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...CHARCOAL);
      doc.text("PROGRAMME", MARGIN, cursorY);
      cursorY += 8;
      for (let stepIdx = 0; stepIdx < program.length; stepIdx++) {
        if (cursorY > PAGE_H - 28) break; // garde-fou anti-débordement
        const step: any = program[stepIdx];
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...GOLD_DARK);
        doc.text(String(stepIdx + 1).padStart(2, "0"), MARGIN, cursorY);
        doc.setTextColor(...CHARCOAL);
        doc.text(step.title || step.name || "", MARGIN + 10, cursorY);
        cursorY += 5.5;
        if (step.description) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...MUTED);
          const stepLines = doc.splitTextToSize(step.description, PAGE_W - MARGIN * 2 - 10);
          doc.text(stepLines, MARGIN + 10, cursorY);
          cursorY += stepLines.length * 4.4 + 4.5;
        } else {
          cursorY += 4.5;
        }
      }
    }
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, p, totalPages, siteSettings);
  }

  doc.save(`Catalogue-Formations-NFL-${new Date().toISOString().slice(0, 10)}.pdf`);
}
