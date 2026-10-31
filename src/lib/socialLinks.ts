import { Facebook, Instagram, Linkedin, Youtube, type LucideIcon } from "lucide-react";
import type { SiteSettings } from "@/lib/api";

export interface SocialLink {
  key: string;
  label: string;
  url: string;
  Icon: LucideIcon;
}

/** Une URL renseignée dans les Paramètres ("#" ou vide = non renseignée). */
export function isRealUrl(url?: string | null): url is string {
  return !!url && url.trim() !== "" && url.trim() !== "#";
}

/**
 * Réseaux sociaux à afficher (footer, page Contact) : uniquement ceux dont
 * l'URL est renseignée dans les Paramètres, pour ne jamais afficher d'icône
 * qui ne mène nulle part.
 */
export function getSocialLinks(settings?: SiteSettings): SocialLink[] {
  const candidates = [
    { key: "facebook", label: "Facebook", url: settings?.facebook_url, Icon: Facebook },
    { key: "linkedin", label: "LinkedIn", url: settings?.linkedin_url, Icon: Linkedin },
    { key: "instagram", label: "Instagram", url: settings?.instagram_url, Icon: Instagram },
    { key: "youtube", label: "YouTube", url: settings?.youtube_url, Icon: Youtube },
  ];
  return candidates.filter((c): c is SocialLink => isRealUrl(c.url));
}

/** Lien "Mentions légales" / "Confidentialité" : URL des Paramètres si renseignée, sinon la page interne. */
export function getLegalLinks(settings?: SiteSettings) {
  return {
    legal: isRealUrl(settings?.legal_mentions_url) ? settings!.legal_mentions_url! : "/mentions-legales",
    privacy: isRealUrl(settings?.privacy_policy_url) ? settings!.privacy_policy_url! : "/mentions-legales#confidentialite",
  };
}
