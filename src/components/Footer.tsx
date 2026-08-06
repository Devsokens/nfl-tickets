import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, MapPin, ChevronUp, Facebook, Instagram, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteSettingsAPI, NewsletterAPI, type SiteSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import { EditableSocialLink } from "@/components/admin/editable/EditableSocialLink";

// Contenu de repli : identique à ce qui était codé en dur avant la dynamisation.
const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "NFL Courtier & Service",
  tagline: "Votre partenaire stratégique pour le courtage d'exception, l'ingénierie financière et l'organisation d'événements prestigieux au Gabon.",
  phone: "+241 00 00 00 00",
  contact_email: "contact@nfl-ga.com",
  address: "Libreville, Gabon",
  facebook_url: "",
  instagram_url: "",
  linkedin_url: "",
  twitter_url: "",
  legal_mentions_url: "#",
  privacy_policy_url: "#",
  footer_tagline: "CRÉER DES EXPÉRIENCES QUI INSPIRENT, CONNECTENT ET TRANSFORMENT.",
  copyright_text: "© 2024 NFL COURTIER & SERVICE. LIBREVILLE, GABON",
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

  // État optimiste local, uniquement utile en mode édition (voir Index.tsx
  // pour la même logique appliquée au contenu de l'accueil).
  const [override, setOverride] = useState<SiteSettings | null>(null);
  useEffect(() => setOverride(null), [settingsRaw]);
  const settings = { ...DEFAULT_SETTINGS, ...settingsRaw, ...override };

  const saveSettingsField = (field: keyof SiteSettings) => async (value: string) => {
    setOverride((prev) => ({ ...prev, [field]: value }));
    const updated = await SiteSettingsAPI.update({ [field]: value });
    queryClient.setQueryData(["siteSettings"], (prev: SiteSettings | undefined) => ({ ...(prev || {}), ...updated }));
  };

  const socialLinks = [
    { url: settings.facebook_url, Icon: Facebook, label: "Facebook" },
    { url: settings.instagram_url, Icon: Instagram, label: "Instagram" },
    { url: settings.linkedin_url, Icon: Linkedin, label: "LinkedIn" },
    { url: settings.twitter_url, Icon: Twitter, label: "Twitter / X" },
  ];
  const visibleSocialLinks = isEditMode ? socialLinks : socialLinks.filter((s) => !!s.url);

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
    <footer id="footer-contact" className="border-t border-black bg-[#0c0d0f] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:gap-8 mb-12">
          {/* Column 1: Brand & Tagline */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-start">
              <Link
                to="/admin/login"
                onClick={isEditMode ? (e) => e.preventDefault() : undefined}
                className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
                title="Espace Administration"
              >
                <img
                  src="/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png"
                  alt="NFL Courtier & Service — Espace Admin"
                  className="nfl-logo w-auto object-contain cursor-pointer"
                  style={{ height: "clamp(5.5rem, 16vw, 8rem)" }}
                />
              </Link>
            </div>
            <p className="text-white/60 text-lvl-footer leading-relaxed max-w-xs font-sans">
              <EditableText value={settings.tagline || ""} onSave={saveSettingsField("tagline")} label="Slogan" multiline as="div" />
            </p>
            {visibleSocialLinks.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                {visibleSocialLinks.map(({ url, Icon, label }, idx) => {
                  const field = (["facebook_url", "instagram_url", "linkedin_url", "twitter_url"] as const)[idx];
                  return <EditableSocialLink key={idx} url={url} icon={Icon} label={label} onSave={saveSettingsField(field)} />;
                })}
              </div>
            )}
          </div>

          {/* Column 2: NOS SERVICES */}
          <div>
            <h4 className="text-lvl-footer font-bold uppercase tracking-[0.2em] text-[#c29c38] mb-4">
              NOS SERVICES
            </h4>
            <ul className="space-y-2.5 text-lvl-footer text-white/70">
              <li className="hover:text-white transition-colors cursor-pointer">Courtage Assurance</li>
              <li className="hover:text-white transition-colors cursor-pointer">Ingénierie Financière</li>
              <li className="hover:text-white transition-colors cursor-pointer">Prestige Events</li>
              <li className="hover:text-white transition-colors cursor-pointer">Formation Élite</li>
            </ul>
          </div>

          {/* Column 3: COMPAGNIE */}
          <div>
            <h4 className="text-lvl-footer font-bold uppercase tracking-[0.2em] text-[#c29c38] mb-4">
              COMPAGNIE
            </h4>
            <ul className="space-y-2.5 text-lvl-footer text-white/70">
              <li>
                <Link to="/catalogue-formations" onClick={isEditMode ? (e) => e.preventDefault() : undefined} className="hover:text-white transition-colors">
                  Catalogue Formation
                </Link>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById("footer-contact")?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-white transition-colors text-left"
                >
                  Devenir partenaire
                </button>
              </li>
              <li>
                <a href={settings.legal_mentions_url || "#"} onClick={isEditMode ? (e) => e.preventDefault() : undefined} className="hover:text-white transition-colors">Mentions Légales</a>
              </li>
              <li>
                <a href={settings.privacy_policy_url || "#"} onClick={isEditMode ? (e) => e.preventDefault() : undefined} className="hover:text-white transition-colors">Confidentialité</a>
              </li>
            </ul>
          </div>

          {/* Column 4: SIÈGE SOCIAL & NEWSLETTER */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="text-lvl-footer font-bold uppercase tracking-[0.2em] text-[#c29c38] mb-4">
              SIÈGE SOCIAL
            </h4>
            <ul className="space-y-2.5 text-lvl-footer text-white/70">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#c29c38] shrink-0" />
                <span><EditableText value={settings.address || ""} onSave={saveSettingsField("address")} label="Adresse" /></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#c29c38] shrink-0" />
                <span><EditableText value={settings.phone || ""} onSave={saveSettingsField("phone")} label="Téléphone" /></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#c29c38] shrink-0" />
                {isEditMode ? (
                  <EditableText value={settings.contact_email || ""} onSave={saveSettingsField("contact_email")} label="Email de contact" />
                ) : (
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors">
                    {settings.contact_email}
                  </a>
                )}
              </li>
            </ul>

            <div className="pt-2">
              <span className="text-lvl-footer font-bold uppercase tracking-wider text-white/40 block mb-2">
                INSCRIVEZ-VOUS À LA NEWSLETTER
              </span>
              <form onSubmit={handleNewsletterSubmit} className="relative flex items-center max-w-xs">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  required
                  disabled={isSubscribing}
                  className="w-full bg-[#16171a] border border-white/20 text-lvl-footer text-white px-3 py-2 pr-8 rounded-none focus:outline-none focus:border-[#c29c38] placeholder:text-white/30 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="absolute right-2.5 text-white/50 hover:text-[#c29c38] transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-lvl-footer text-white/40 uppercase tracking-wider">
          <p><EditableText value={settings.copyright_text || ""} onSave={saveSettingsField("copyright_text")} label="Copyright" /></p>
          <p><EditableText value={settings.footer_tagline || ""} onSave={saveSettingsField("footer_tagline")} label="Phrase du bas" /></p>
        </div>
      </div>

      {showBackToTop && (
        <Button
          variant="gold"
          size="icon"
          className="fixed bottom-8 right-8 z-[60] rounded-none w-10 h-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 bg-[#655410] hover:bg-[#52440b] text-white"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </footer>
  );
};

export default Footer;

