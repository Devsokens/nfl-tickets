import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronUp, Facebook, Instagram, Linkedin, Twitter, Youtube, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteSettingsAPI, NewsletterAPI, type SiteSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "NFL Courtier & Service",
  tagline: "Votre partenaire d'excellence à Libreville pour le courtage, les formations et l'événementiel de prestige.",
  phone: "+241 00 00 00 00",
  contact_email: "contact@nflprestige.com",
  address: "Libreville, Gabon",
  facebook_url: "",
  instagram_url: "",
  linkedin_url: "",
  twitter_url: "",
  legal_mentions_url: "#",
  privacy_policy_url: "#",
  footer_tagline: "Fait avec excellence par NFL Courtier & Service",
  copyright_text: "© 2026 NFL Courtier & Service. Tous droits réservés.",
};

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();
  const isEditMode = useIsEditMode();
  const queryClient = useQueryClient();

  const { data: settingsRaw } = useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: SiteSettingsAPI.get,
  });

  const [override, setOverride] = useState<SiteSettings | null>(null);
  useEffect(() => setOverride(null), [settingsRaw]);
  const settings = { ...DEFAULT_SETTINGS, ...settingsRaw, ...override };

  const saveSettingsField = (field: keyof SiteSettings) => async (value: string) => {
    setOverride((prev) => ({ ...prev, [field]: value }));
    const updated = await SiteSettingsAPI.update({ [field]: value });
    queryClient.setQueryData(["siteSettings"], (prev: SiteSettings | undefined) => ({ ...(prev || {}), ...updated }));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    try {
      const res = await NewsletterAPI.subscribe(email);
      toast({ title: "Inscription réussie", description: res.message || "Vous êtes bien inscrit à la newsletter." });
      setEmail("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue.";
      toast({ variant: "destructive", title: "Erreur", description: (err as { response?: { data?: { message?: string } } }).response?.data?.message || errorMsg });
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer id="footer-contact" className="bg-[#100906] text-white border-t border-white/10 pt-14 pb-8 relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl">
        
        {/* GRILLE PRINCIPALE 3 COLONNES SANS COLONNE RÉSEAUX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          
          {/* COLONNE 1 : LOGO + SLOGAN */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              to="/admin/login"
              onClick={isEditMode ? (e) => e.preventDefault() : undefined}
              className="inline-block transition-transform hover:scale-[1.02]"
              title="Espace Administration"
            >
              <img
                src="/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png"
                alt="NFL Courtier & Service"
                className="nfl-logo h-14 sm:h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-sm font-sans">
              <EditableText value={settings.tagline || ""} onSave={saveSettingsField("tagline")} label="Slogan" multiline as="div" />
            </p>
          </div>

          {/* COLONNE 2 : ENTREPRISE / NAVIGATION */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-[#e3bd51] uppercase tracking-wider mb-3">
              Entreprise
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/80 font-medium">
              <li>
                <Link to="/" onClick={isEditMode ? (e) => e.preventDefault() : undefined} className="hover:text-[#e3bd51] transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/events" onClick={isEditMode ? (e) => e.preventDefault() : undefined} className="inline-flex items-center gap-1 hover:text-[#e3bd51] transition-colors">
                  <span>Événements</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#d4af37]/70" />
                </Link>
              </li>
              <li>
                <Link to="/catalogue-formations" onClick={isEditMode ? (e) => e.preventDefault() : undefined} className="inline-flex items-center gap-1 hover:text-[#e3bd51] transition-colors">
                  <span>Formations</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#d4af37]/70" />
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={isEditMode ? (e) => e.preventDefault() : undefined} className="hover:text-[#e3bd51] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href={settings.privacy_policy_url || "#"} onClick={isEditMode ? (e) => e.preventDefault() : undefined} className="inline-flex items-center gap-1 hover:text-[#e3bd51] transition-colors">
                  <span>Confidentialité</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#d4af37]/70" />
                </a>
              </li>
            </ul>
          </div>

          {/* COLONNE 3 : NEWSLETTER */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-[#e3bd51] uppercase tracking-wider mb-2">
              Newsletter
            </h4>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-4">
              Recevez nos invitations exclusives, actualités et offres de formation directement.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="relative flex items-center bg-white rounded-full p-1.5 border border-white/20 shadow-md max-w-md">
              <span className="pl-3.5 text-[#100906]/50 text-sm font-semibold">@</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre email..."
                required
                disabled={isSubscribing}
                className="w-full bg-transparent text-xs sm:text-sm text-[#100906] placeholder:text-[#100906]/40 px-2 py-1.5 focus:outline-none disabled:opacity-50 font-medium"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                aria-label="S'abonner"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#100906] hover:bg-[#8c591a] text-white flex items-center justify-center transition-colors shrink-0 shadow-md group disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>

        </div>

        {/* BARRE DU BAS : COPYRIGHT & LIENS D'ICÔNES */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 tracking-wide">
          <p><EditableText value={settings.copyright_text || ""} onSave={saveSettingsField("copyright_text")} label="Copyright" /></p>
          
          <div className="flex items-center gap-4">
            <span className="text-white/40"><EditableText value={settings.footer_tagline || ""} onSave={saveSettingsField("footer_tagline")} label="Phrase du bas" /></span>
            <div className="flex items-center gap-2">
              <a href={settings.facebook_url || "#"} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#e3bd51] transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href={settings.linkedin_url || "#"} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#e3bd51] transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a href={settings.twitter_url || "#"} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#e3bd51] transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href={settings.instagram_url || "#"} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#e3bd51] transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href={settings.youtube_url || "#"} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#e3bd51] transition-colors">
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* BOUTON RETOUR HAUT DE PAGE */}
      {showBackToTop && (
        <Button
          variant="gold"
          size="icon"
          className="fixed bottom-6 right-6 z-[60] rounded-full w-10 h-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 bg-[#8c591a] hover:bg-[#100906] text-white border border-white/20"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </footer>
  );
};

export default Footer;
