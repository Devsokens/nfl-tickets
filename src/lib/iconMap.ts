import {
  ShieldCheck, Star, Landmark, Building2, Users, CheckCircle2, CalendarCheck,
  Award, Sparkles, Handshake, TrendingUp, Briefcase, Target, Trophy, Gem,
  type LucideIcon,
} from "lucide-react";

// Registre fermé d'icônes sélectionnables depuis l'admin (hero, piliers, spotlight...).
// On ne stocke que le NOM de l'icône en base — jamais de code — et on le résout ici
// côté frontend. Ajouter une icône = l'importer ci-dessus et l'ajouter à la liste.
export const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Star,
  Landmark,
  Building2,
  Users,
  CheckCircle2,
  CalendarCheck,
  Award,
  Sparkles,
  Handshake,
  TrendingUp,
  Briefcase,
  Target,
  Trophy,
  Gem,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function getIcon(name?: string | null): LucideIcon {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return Star; // repli neutre si le nom est vide/inconnu
}
