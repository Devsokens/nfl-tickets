import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Loader2, Info, ArrowRight, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventsAPI, HomeContentAPI, NewsletterAPI, type Event, type HomeContent } from "@/lib/api";
import HighlightEventCard from "@/components/HighlightEventCard";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

import nflImg1 from "@/assets/nfl img1.jpeg";

type EventsPageContent = Required<NonNullable<HomeContent["eventsPage"]>>;

const DEFAULT_EVENTS_PAGE_CONTENT: EventsPageContent = {
  hero: {
    badge: "ÉVÉNEMENT À LA UNE",
    titleLine1: "ÉVÉNEMENTS NFL",
    titleLine2: "Des expériences d'exception pour marquer les esprits",
    ctaPrimaryText: "RÉSERVER MA PLACE",
    ctaSecondaryText: "DÉCOUVRIR L'AGENDA",
    footnote: "Places limitées • Événements privés & séminaires",
  },
  stats: [
    { number: "15+", label: "Événements organisés" },
    { number: "99%", label: "Satisfaction client" },
    { number: "5+", label: "Entreprises accompagnées & conseillées" },
    { number: "35+", label: "Ans d'expertise cumulée" },
  ],
  agenda: {
    eyebrow: "AGENDA DE PRESTIGE",
    title: "Nos événements d'élite",
    subtitle: "Des expériences conçues pour apprendre, inspirer et créer des opportunités.",
    description: "Une sélection méticuleuse d'événements exclusifs pour les leaders d'aujourd'hui. Explorez nos séminaires stratégiques, galas de prestige et conférences de haut vol.",
  },
  newsletterBox: {
    title: "Restez informé de nos prochains événements",
    description: "Inscrivez-vous pour recevoir en avant-première les invitations à nos événements exclusifs et privés.",
  },
};

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
}

/* COMPOSANT VISUEL IMAGE CARRÉE FLOTTANTE PARFAITEMENT ESPACÉE SUR LA COURBE DORÉE */
interface FlipCardProps {
  imageFront: string;
  imageBack: string;
  rotation: string;
  delay: number;
}

const FlipCard = ({ imageFront, imageBack, rotation, delay }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 3200 + delay * 700);
    return () => clearInterval(timer);
  }, [delay]);

  return (
    <motion.div
      animate={{ y: [0, delay % 2 === 0 ? -12 : 12, 0] }}
      transition={{ duration: 3.5 + delay * 0.4, repeat: Infinity, ease: "easeInOut" }}
      className={`relative w-28 sm:w-36 lg:w-40 h-28 sm:h-36 lg:h-40 ${rotation} rounded-2xl z-20 pointer-events-none`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full relative rounded-2xl shadow-[0_20px_45px_-15px_rgba(0,0,0,0.85)] border-2 border-[#d4af37]/45"
      >
        {/* RECTO : SIMPLE IMAGE CARRÉE 1 */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-[#100906]"
        >
          <img src={imageFront} alt="Visuel Événement NFL" className="w-full h-full object-cover filter brightness-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* VERSO : SIMPLE IMAGE CARRÉE 2 (RETOURNE) */}
        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-[#100906]"
        >
          <img src={imageBack} alt="Visuel NFL Événement" className="w-full h-full object-cover filter brightness-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      </motion.div>
    </motion.div>
  );
};

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = useIsEditMode();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: allEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ["allEvents"],
    queryFn: () => EventsAPI.getAll(),
  });

  const { data: homeContentRaw } = useQuery<HomeContent>({
    queryKey: ["homeContent"],
    queryFn: HomeContentAPI.get,
  });
  const merged: EventsPageContent = {
    hero: { ...DEFAULT_EVENTS_PAGE_CONTENT.hero, ...homeContentRaw?.eventsPage?.hero },
    stats: homeContentRaw?.eventsPage?.stats?.length ? homeContentRaw.eventsPage.stats : DEFAULT_EVENTS_PAGE_CONTENT.stats,
    agenda: { ...DEFAULT_EVENTS_PAGE_CONTENT.agenda, ...homeContentRaw?.eventsPage?.agenda },
    newsletterBox: { ...DEFAULT_EVENTS_PAGE_CONTENT.newsletterBox, ...homeContentRaw?.eventsPage?.newsletterBox },
  };
  const [override, setOverride] = useState<EventsPageContent | null>(null);
  useEffect(() => setOverride(null), [homeContentRaw]);
  const content = override || merged;

  const saveEventsPageSection = async (patch: Partial<EventsPageContent>) => {
    const next = { ...content, ...patch };
    setOverride(next);
    const updated = await HomeContentAPI.update({ eventsPage: next });
    queryClient.setQueryData(["homeContent"], (prev: HomeContent | undefined) => ({ ...(prev || {}), ...updated }));
  };
  const makeHeroFieldSaver = (fieldKey: keyof EventsPageContent["hero"]) => async (value: string) => {
    await saveEventsPageSection({ hero: { ...content.hero, [fieldKey]: value } });
  };
  const makeAgendaFieldSaver = (fieldKey: keyof EventsPageContent["agenda"]) => async (value: string) => {
    await saveEventsPageSection({ agenda: { ...content.agenda, [fieldKey]: value } });
  };
  const makeNewsletterFieldSaver = (fieldKey: keyof EventsPageContent["newsletterBox"]) => async (value: string) => {
    await saveEventsPageSection({ newsletterBox: { ...content.newsletterBox, [fieldKey]: value } });
  };

  const today = new Date().setHours(0, 0, 0, 0);
  const upcomingEvents = allEvents
    .filter((e) => new Date(e.date).getTime() >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Liste d'images pour alimenter les recto/verso des cartes d'images carrées
  const eventImagesList = useMemo(() => {
    const imgs = allEvents.map((e) => e.image_url || e.image).filter(Boolean) as string[];
    if (imgs.length === 0) return Array(16).fill(nflImg1);
    while (imgs.length < 16) {
      imgs.push(...imgs);
    }
    return imgs;
  }, [allEvents]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    allEvents.forEach((e) => {
      const d = new Date(e.date);
      if (!isNaN(d.getTime())) {
        months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    return Array.from(months).sort();
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents
      .filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((e) => {
        if (!monthFilter || monthFilter === "all") return true;
        const eDate = new Date(e.date);
        const eStr = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}`;
        return eStr === monthFilter;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents, searchQuery, monthFilter]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribing(true);
    try {
      const res = await NewsletterAPI.subscribe(newsletterEmail);
      toast({ title: "Inscription réussie", description: res.message || "Vous êtes bien inscrit à la newsletter." });
      setNewsletterEmail("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue.";
      toast({ variant: "destructive", title: "Erreur", description: (err as { response?: { data?: { message?: string } } }).response?.data?.message || errorMsg });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#100906] flex flex-col text-white">
      <Helmet>
        <title>Événements | NFL Courtier & Service</title>
        <meta name="description" content="Découvrez tous les événements exclusifs, galas et masterclass de NFL Courtier & Service au Gabon." />
      </Helmet>
      <Navbar />

      {/* 1. HERO SECTION : DISPOSITION DES CARTES SUIVANT EXACTEMENT LE SCHÉMA EN TRAIT JAUNE */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-28 bg-[#100906] overflow-hidden">
        {/* LIGHT GLOW ACCENTS */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* GAUCHE : TEXTE & ACTIONS */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
                <span className="block">
                  <EditableText value={content.hero.titleLine1 || ""} onSave={makeHeroFieldSaver("titleLine1")} label="Titre — ligne 1" />
                </span>
                <span className="block text-[#d4af37] italic font-normal text-2xl sm:text-4xl mt-2">
                  <EditableText value={content.hero.titleLine2 || ""} onSave={makeHeroFieldSaver("titleLine2")} label="Titre — ligne 2" multiline />
                </span>
              </h1>

              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                Explorez notre sélection d'événements stratégiques, conférences de haut niveau et galas de prestige organisés pour les dirigeants et leaders d'entreprises au Gabon.
              </p>

              <div className="flex flex-row items-center justify-start gap-2 sm:gap-4 pt-2 w-full max-w-full">
                <button
                  onClick={() => document.getElementById("events-grid")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-fit bg-gradient-to-r from-[#d4af37] via-[#e3bd51] to-[#d4af37] hover:opacity-95 text-black font-extrabold text-[10px] sm:text-sm uppercase tracking-wider py-2.5 px-4 sm:py-4 sm:px-8 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <EditableText value={content.hero.ctaSecondaryText || ""} onSave={makeHeroFieldSaver("ctaSecondaryText")} label="Bouton" />
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                </button>
              </div>
            </motion.div>

            {/* DROITE : DISPOSITION DES CARTES LE LONG DE LA COURBE DORÉE (REGROUPÉES SUR MOBILE) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 relative min-h-[350px] sm:min-h-[520px] flex items-center justify-center pt-2 sm:pt-4"
            >
              {/* COURBE DE CONNEXION SVG DORÉE AVEC POINTS LUMINEUX (VISIBLE AUSSI SUR MOBILE) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 block" viewBox="0 0 520 500" fill="none">
                {/* GRAND ARC DORÉ PRINCIPAL */}
                <path
                  d="M 60 210 C 60 50, 460 50, 460 210 C 460 380, 100 420, 260 470"
                  stroke="#d4af37"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  className="opacity-80"
                />
                {/* LIGNE DE CONNEXION VERTICALE DORÉE AVEC PASTILLE */}
                <line x1="260" y1="110" x2="260" y2="370" stroke="#d4af37" strokeWidth="2" strokeDasharray="4 4" className="opacity-60" />
                <circle cx="260" cy="240" r="7" fill="#d4af37" className="animate-ping opacity-75" />
                <circle cx="260" cy="240" r="6" fill="#e3bd51" />
                <circle cx="460" cy="210" r="6" fill="#d4af37" />
              </svg>

              {/* CARTES REGROUPÉES AVEC ESPACEMENT COMPACT SUR MOBILE ET FLUIDE SUR DESKTOP */}
              <div className="relative w-full max-w-[340px] sm:max-w-lg mx-auto h-[340px] sm:h-[500px] flex items-center justify-center">
                
                {/* 1. HAUT GAUCHE */}
                <div className="absolute top-0 left-1 sm:top-2 sm:left-6 z-20">
                  <FlipCard
                    imageFront={eventImagesList[0]}
                    imageBack={eventImagesList[1]}
                    rotation="rotate-[-6deg]"
                    delay={0}
                  />
                </div>

                {/* 2. HAUT DROIT */}
                <div className="absolute top-1 right-1 sm:top-4 sm:right-8 z-20">
                  <FlipCard
                    imageFront={eventImagesList[2]}
                    imageBack={eventImagesList[3]}
                    rotation="rotate-[6deg]"
                    delay={0.4}
                  />
                </div>

                {/* 3. MILIEU GAUCHE */}
                <div className="absolute top-20 left-0 sm:top-44 sm:-left-2 z-20">
                  <FlipCard
                    imageFront={eventImagesList[4]}
                    imageBack={eventImagesList[5]}
                    rotation="rotate-[5deg]"
                    delay={0.8}
                  />
                </div>

                {/* 4. MILIEU CENTRE (AFFICHE UNIQUEMENT SUR MOBILE POUR COMBLER LE VIDE DU MILIEU) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 block sm:hidden scale-90">
                  <FlipCard
                    imageFront={eventImagesList[12]}
                    imageBack={eventImagesList[13]}
                    rotation="rotate-[-3deg]"
                    delay={2.4}
                  />
                </div>

                {/* 5. MILIEU DROIT */}
                <div className="absolute top-20 right-0 sm:top-40 sm:-right-2 z-20">
                  <FlipCard
                    imageFront={eventImagesList[6]}
                    imageBack={eventImagesList[7]}
                    rotation="rotate-[-5deg]"
                    delay={1.2}
                  />
                </div>

                {/* 6. BAS GAUCHE */}
                <div className="absolute bottom-1 left-3 sm:bottom-4 sm:left-16 z-20">
                  <FlipCard
                    imageFront={eventImagesList[8]}
                    imageBack={eventImagesList[9]}
                    rotation="rotate-[-4deg]"
                    delay={1.6}
                  />
                </div>

                {/* 7. BAS DROITE */}
                <div className="absolute bottom-0 right-3 sm:bottom-2 sm:right-16 z-20">
                  <FlipCard
                    imageFront={eventImagesList[10]}
                    imageBack={eventImagesList[11]}
                    rotation="rotate-[5deg]"
                    delay={2.0}
                  />
                </div>

              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. SECTION GRILLE DES ÉVÉNEMENTS (ARRIÈRE-PLAN DORÉ EXACTEMENT COMME LA PAGE D'ACCUEIL) */}
      <section id="events-grid" className="py-12 md:py-18 bg-gradient-to-b from-[#fbf5e6] via-[#f7ebd7] to-[#fbf5e6] border-y border-[#d4af37]/25 text-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl">
          
          {/* BARRE DE RECHERCHE ULTRA MODERNE & INTUITIVE */}
          <div className="mb-8 sm:mb-12 bg-white/80 backdrop-blur-xl border border-black/10 shadow-xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
            
            {/* INPUT RECHERCHE DYNAMIQUE AVEC BADGE DE RÉSULTATS */}
            <div className="relative flex-1 w-full flex items-center">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Search className="w-4 h-4 text-[#8c591a]" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par titre, ville ou mot-clé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/90 border border-black/10 text-xs sm:text-sm text-black pl-11 pr-24 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl focus:outline-none focus:bg-white focus:border-[#8c591a] focus:ring-2 focus:ring-[#8c591a]/20 shadow-inner placeholder:text-black/40 transition-all font-medium"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 text-black/50 hover:text-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#8c591a] bg-[#d4af37]/20 px-2.5 py-1 rounded-full border border-[#d4af37]/30">
                  {filteredEvents.length} {filteredEvents.length > 1 ? "événements" : "événement"}
                </span>
              )}
            </div>

            {/* SÉLECTEUR DE MOIS INTUITIF */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-[#100906] to-[#26140b] hover:from-[#1a0e09] hover:to-[#321a0e] text-[#d4af37] font-extrabold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl sm:rounded-2xl flex items-center justify-between gap-3 transition-all shrink-0 border border-[#d4af37]/30 shadow-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    <SelectValue placeholder="TRIER PAR MOIS" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#100906] text-white border-[#d4af37]/30 rounded-2xl shadow-2xl">
                  <SelectItem value="all" className="uppercase text-xs font-bold focus:bg-white/10 text-white cursor-pointer rounded-xl py-2.5">
                    TOUS LES MOIS
                  </SelectItem>
                  {availableMonths.map((m) => {
                    const [y, mo] = m.split("-");
                    const dateObj = new Date(parseInt(y), parseInt(mo) - 1, 1);
                    const label = format(dateObj, "MMMM yyyy", { locale: fr }).toUpperCase();
                    return (
                      <SelectItem key={m} value={m} className="uppercase text-xs font-bold focus:bg-white/10 text-white cursor-pointer rounded-xl py-2.5">
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {(searchQuery || monthFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setMonthFilter("all");
                  }}
                  className="bg-black/10 hover:bg-black/20 text-black text-xs font-bold px-3 py-3.5 rounded-xl sm:rounded-2xl transition-all whitespace-nowrap shrink-0"
                >
                  Réinitialiser
                </button>
              )}
            </div>

          </div>

          {isEditMode && (
            <div className="flex items-center gap-2 text-black/60 text-xs mb-6 bg-black/5 border border-black/10 rounded-xl px-4 py-3 w-fit">
              <Info className="w-4 h-4 text-[#8c591a] shrink-0" />
              Les événements affichés ici sont gérés depuis l'onglet <strong className="text-black/90">Événements</strong>.
            </div>
          )}

          {/* GRILLE DES CARTES : 2 CARTES PAR LIGNE SUR MOBILE (grid-cols-2) */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#8c591a]" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {filteredEvents.map((ev) => (
                <div key={ev.id} className="h-full">
                  <HighlightEventCard event={ev} />
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="col-span-full flex items-center justify-center text-black/50 text-sm py-16 font-medium">
                  Aucun événement à afficher pour le moment.
                </div>
              )}
            </div>
          )}

          {/* BANDEAU NEWSLETTER MARRON LUXE */}
          <div className="mt-14 bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] text-white p-8 sm:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl space-y-2 relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d4af37] block">
                Privilège & Exclusivement
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                <EditableText value={content.newsletterBox.title || ""} onSave={makeNewsletterFieldSaver("title")} label="Titre" multiline />
              </h3>
              <p className="text-white/80 text-xs sm:text-sm font-normal">
                <EditableText value={content.newsletterBox.description || ""} onSave={makeNewsletterFieldSaver("description")} label="Description" multiline as="div" />
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 relative z-10">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Votre adresse email..."
                required
                disabled={isSubscribing}
                className="bg-black/40 border border-white/15 text-sm text-white px-5 py-3.5 rounded-xl placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] min-w-[260px]"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="bg-gradient-to-r from-[#d4af37] via-[#e3bd51] to-[#d4af37] hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 px-7 rounded-xl transition-all shadow-lg shrink-0"
              >
                {isSubscribing ? "..." : "S'INSCRIRE"}
              </button>
            </form>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Catalog;
