/**
 * L'admin ne doit jamais voir/écrire du HTML dans les templates d'email —
 * juste du texte brut, avec des paragraphes séparés par une ligne vide.
 * Le backend stocke toujours du HTML (body_html) ; ces deux fonctions font
 * la conversion dans les deux sens autour de ce stockage inchangé.
 */

export function htmlToEditableText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function textToHtml(text: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return text
    .trim()
    .split(/\n{2,}/)
    .filter((block) => block.trim().length > 0)
    .map((block) => `<p>${escape(block.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}
