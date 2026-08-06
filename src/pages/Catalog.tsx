import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, ChevronDown, Loader2, Info, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventsAPI, HomeContentAPI, TestimonialsAPI, NewsletterAPI, type Event, type HomeContent, type Testimonial } from "@/lib/api";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import { AddInlineButton } from "@/components/admin/editable/EditableListControls";

import nflImg1 from "@/assets/nfl img1.jpeg";

type EventsPageContent = Required<NonNullable<HomeContent["eventsPage"]>>;

const DEFAULT_EVENTS_PAGE_CONTENT: EventsPageContent = {
  hero: {
    badge: "ÉVÉNEMENT À LA UNE",
    titleLine1: "ÉVÉNEMENTS NFL",
    titleLine2: "Nous créons des expériences qui marquent les esprits",
    ctaPrimaryText: "DÉCOUVRIR LES ÉVÉNEMENTS",
    ctaSecondaryText: "VOIR LE CALENDRIER",
    footnote: "Places limitées • Tenue de soirée exigée",
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

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
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

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => TestimonialsAPI.getAll(false),
  });
  const featuredTestimonial = testimonials[0];

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
  const updateStat = (idx: number, patch: Partial<{ number: string; label: string }>) => {
    const list = content.stats.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    return saveEventsPageSection({ stats: list });
  };
  const addStat = () => saveEventsPageSection({ stats: [...content.stats, { number: "0", label: "Nouveau chiffre" }] });
  const removeStat = (idx: number) => saveEventsPageSection({ stats: content.stats.filter((_, i) => i !== idx) });

  const today = new Date().setHours(0, 0, 0, 0);
  const upcomingEvents = allEvents
    .filter((e) => new Date(e.date).getTime() >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextEvent = upcomingEvents[0];

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allEvents, searchQuery]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribing(true);
    try {
      const res = await NewsletterAPI.subscribe(newsletterEmail);
      toast({ title: "Inscription réussie", description: res.message || "Vous êtes bien inscrit à la newsletter." });
      setNewsletterEmail("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.response?.data?.message || "Une erreur est survenue." });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0f] flex flex-col text-white">
      <Helmet>
        <title>Événements | NFL Courtier & Service</title>
        <meta name="description" content="Découvrez tous les événements exclusifs, galas et masterclass de NFL Courtier & Service au Gabon." />
      </Helmet>
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-white/10">
        <img
          src={nextEvent?.image_url || nextEvent?.image || nflImg1}
          alt="Événements NFL"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.22] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0f] via-black/40 to-[#0c0d0f]/80" />

        <div className="relative z-10 container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 border border-[#e3bd51]/40 bg-[#141517]/85 text-[#e3bd51] text-[10px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e3bd51] inline-block animate-pulse"></span>
                <span><EditableText value={content.hero.badge || ""} onSave={makeHeroFieldSaver("badge")} label="Badge" /></span>
              </div>

              <h1 className="leading-tight">
                <span className="block font-sans font-bold text-4xl sm:text-5xl uppercase tracking-tight text-white">
                  <EditableText value={content.hero.titleLine1 || ""} onSave={makeHeroFieldSaver("titleLine1")} label="Titre — ligne 1" />
                </span>
                <span className="block font-display italic text-white text-3xl sm:text-4xl mt-3 font-normal leading-snug">
                  <EditableText value={content.hero.titleLine2 || ""} onSave={makeHeroFieldSaver("titleLine2")} label="Titre — ligne 2" multiline />
                </span>
              </h1>

              {nextEvent && (
                <div className="flex flex-wrap items-center gap-6 text-xs text-white/95 font-medium pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#e3bd51]" />
                    <span>{formatEventDate(nextEvent.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#e3bd51]" />
                    <span>{nextEvent.location}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => document.getElementById("events-grid")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-7 rounded-none transition-colors shadow-sm"
                >
                  <EditableText value={content.hero.ctaPrimaryText || ""} onSave={makeHeroFieldSaver("ctaPrimaryText")} label="Bouton principal" />
                </button>
                <button
                  onClick={() => document.getElementById("events-grid")?.scrollIntoView({ behavior: "smooth" })}
                  className="border border-white/20 bg-[#1c1d21]/90 hover:bg-white/10 text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-7 rounded-none transition-colors"
                >
                  <EditableText value={content.hero.ctaSecondaryText || ""} onSave={makeHeroFieldSaver("ctaSecondaryText")} label="Bouton secondaire" />
                </button>
              </div>
            </div>

            {/* Right: Next Event Highlight */}
            <div className="lg:col-span-5">
              <div className="bg-[#121315]/80 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-none text-center space-y-4 max-w-md mx-auto shadow-2xl">
                <span className="text-[#e3bd51] text-xs sm:text-sm font-bold uppercase tracking-[0.2em] block font-sans">
                  {nextEvent ? "PROCHAIN ÉVÉNEMENT" : "AUCUN ÉVÉNEMENT PROGRAMMÉ"}
                </span>
                {nextEvent ? (
                  <>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">{nextEvent.title}</p>
                    <p className="text-white/90 text-sm">{formatEventDate(nextEvent.date)} — {nextEvent.location}</p>
                  </>
                ) : (
                  <p className="text-white/85 text-sm sm:text-base font-sans">Revenez bientôt pour découvrir nos prochains rendez-vous.</p>
                )}
                <p className="text-xs sm:text-sm text-white/70 font-semibold tracking-wide uppercase pt-2 font-display">
                  <EditableText value={content.hero.footnote || ""} onSave={makeHeroFieldSaver("footnote")} label="Petite phrase" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NFL EN QUELQUES CHIFFRES - INFINITE MARQUEE SCROLL */}
      <section className="py-12 sm:py-16 bg-[#090a0c] border-b border-white/10 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl text-center mb-8">
          <h2 className="text-[#c29c38] text-2xl sm:text-3xl font-bold uppercase tracking-[0.2em] font-sans">
            NFL EN QUELQUES CHIFFRES
          </h2>
        </div>

        {isEditMode ? (
          <div className="container mx-auto px-4 max-w-4xl space-y-3">
            {content.stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3 border border-white/10 rounded-xl p-3">
                <input
                  value={stat.number || ""}
                  onChange={(e) => updateStat(idx, { number: e.target.value })}
                  className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-sm text-[#e3bd51] font-bold"
                />
                <input
                  value={stat.label || ""}
                  onChange={(e) => updateStat(idx, { label: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                />
                {content.stats.length > 1 && (
                  <button onClick={() => removeStat(idx)} className="text-destructive shrink-0"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            <AddInlineButton onClick={addStat} label="Ajouter un chiffre" />
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <div className="flex animate-marquee gap-16 sm:gap-24 items-center w-max py-2">
              {[...content.stats, ...content.stats, ...content.stats].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center shrink-0">
                  <span className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-[#e3bd51] leading-none">
                    {stat.number}
                  </span>
                  <span className="text-white/80 text-xs sm:text-sm font-medium uppercase tracking-widest font-sans mt-2.5 whitespace-nowrap">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. NOS ÉVÉNEMENTS D'ÉLITE */}
      <section id="events-grid">
        {/* Top Dark Header */}
        <div className="bg-[#0c0d0f] pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#c29c38] text-[10px] font-bold uppercase tracking-[0.25em] mb-3">
                <span className="w-6 h-[1px] bg-[#c29c38] inline-block"></span>
                <span><EditableText value={content.agenda.eyebrow || ""} onSave={makeAgendaFieldSaver("eyebrow")} label="Eyebrow" /></span>
              </div>
              <h2 className="font-sans text-4xl sm:text-5xl font-bold text-white mb-3">
                <EditableText value={content.agenda.title || ""} onSave={makeAgendaFieldSaver("title")} label="Titre" />
              </h2>
              <p className="font-display italic text-white/95 text-3xl sm:text-4xl mb-4 font-normal leading-snug">
                <EditableText value={content.agenda.subtitle || ""} onSave={makeAgendaFieldSaver("subtitle")} label="Sous-titre" multiline />
              </p>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed font-sans max-w-2xl">
                <EditableText value={content.agenda.description || ""} onSave={makeAgendaFieldSaver("description")} label="Description" multiline as="div" />
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Light Grey Background Section for Search Toolbar and Cards Grid */}
        <div className="bg-[#f4f2ee] py-12 md:py-16 text-black">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Search & Filter Toolbar */}
            <div className="mb-6 sm:mb-10 flex flex-row items-center justify-between gap-2 sm:gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/40" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/15 text-[11px] sm:text-xs text-black pl-8 sm:pl-10 pr-2 sm:pr-4 py-2.5 sm:py-3 rounded-none focus:outline-none placeholder:text-black/40"
                />
              </div>

              <button className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-[9px] sm:text-[11px] uppercase tracking-wider px-3 sm:px-6 py-2.5 sm:py-3 rounded-none flex items-center gap-1 sm:gap-2 transition-colors shrink-0 justify-center whitespace-nowrap">
                TRIER PAR <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>

            {isEditMode && (
              <div className="flex items-center gap-2 text-black/50 text-[11px] mb-4 bg-black/5 border border-black/10 rounded-lg px-4 py-2.5 w-fit">
                <Info className="w-3.5 h-3.5 text-[#c29c38] shrink-0" />
                Les événements affichés ici sont gérés depuis l'onglet <strong className="text-black/80">Événements</strong>.
              </div>
            )}

            {/* Cards Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#c29c38]" /></div>
            ) : (
              <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 ${isEditMode ? "pointer-events-none" : ""}`}>
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white text-black rounded-none overflow-hidden border border-black/10 flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      <div className="relative h-36 sm:h-56 overflow-hidden bg-black/5">
                        {(ev.image_url || ev.image) && (
                          <img
                            src={ev.image_url || ev.image}
                            alt={ev.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>

                      <div className="p-3 sm:p-6 space-y-1.5 sm:space-y-2">
                        <span className="text-[#c29c38] text-[11px] sm:text-xs font-bold uppercase tracking-wider block">
                          {formatEventDate(ev.date)}
                        </span>
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1c1c1c] leading-tight line-clamp-2 group-hover:text-[#c29c38] transition-colors">
                          {ev.title}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-black/60 font-medium pt-0.5 sm:pt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#c29c38] shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-[#c29c38] pt-0.5 sm:pt-1">
                          🏷️ {ev.price ? `${ev.price.toLocaleString()} ${ev.currency || "FCFA"}` : "Sur invitation"}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-6 pt-0">
                      <Link
                        to={`/event/${ev.slug || ev.id}`}
                        onClick={isEditMode ? (e) => e.preventDefault() : undefined}
                        className="block text-center border border-[#c29c38] bg-white hover:bg-[#c29c38] hover:text-black text-black font-bold text-xs sm:text-sm uppercase tracking-wider py-2 sm:py-2.5 rounded-none transition-colors"
                      >
                        RÉSERVER
                      </Link>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="col-span-2 md:col-span-2 flex items-center justify-center text-black/40 text-sm py-10">
                    Aucun événement à afficher pour le moment.
                  </div>
                )}

                {/* Gold Newsletter Box */}
                <div className="col-span-2 md:col-span-1 bg-[#d4af37] text-black p-5 sm:p-10 rounded-none flex flex-col justify-between shadow-xl pointer-events-auto">
                  <div>
                    <h3 className="font-display text-xl sm:text-3xl font-bold text-black mb-2 sm:mb-4 leading-tight">
                      <EditableText value={content.newsletterBox.title || ""} onSave={makeNewsletterFieldSaver("title")} label="Titre" multiline />
                    </h3>
                    <p className="text-black/90 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 font-sans">
                      <EditableText value={content.newsletterBox.description || ""} onSave={makeNewsletterFieldSaver("description")} label="Description" multiline as="div" />
                    </p>
                  </div>

                  <form onSubmit={handleNewsletterSubmit} className="space-y-2.5 sm:space-y-3 pt-2 sm:pt-4">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Votre email"
                      required
                      disabled={isSubscribing}
                      className="w-full bg-[#c29c38]/40 border border-black/20 text-xs text-black px-3 sm:px-4 py-2.5 sm:py-3 rounded-none placeholder:text-black/60 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="w-full bg-[#3b320d] hover:bg-[#282208] text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-wider py-3 sm:py-3.5 rounded-none transition-colors shadow-sm"
                    >
                      {isSubscribing ? "..." : "S'INSCRIRE"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. CITATION TEMOIGNAGE (issue des témoignages publiés sur le site) */}
      {featuredTestimonial && (
        <section className="py-20 bg-[#090a0c] text-center border-t border-white/10">
          <div className="container mx-auto px-4 max-w-3xl space-y-6">
            {isEditMode && (
              <div className="flex items-center justify-center gap-2 text-white/50 text-[11px] mb-2">
                <Info className="w-3.5 h-3.5 text-[#c29c38] shrink-0" />
                Géré depuis l'onglet <strong className="text-white/80">Témoignages</strong>.
              </div>
            )}
            <div className="text-3xl text-[#c29c38] font-serif">”</div>
            <p className="font-serif italic text-white/90 text-lg sm:text-xl leading-relaxed">
              "{featuredTestimonial.quote}"
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="w-8 h-8 bg-[#c29c38] text-black font-bold text-xs flex items-center justify-center rounded-none">
                {featuredTestimonial.author_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-xs">{featuredTestimonial.author_name}</p>
                <p className="text-[#c29c38] text-[9px] font-semibold uppercase tracking-wider">
                  {[featuredTestimonial.author_role, featuredTestimonial.author_company].filter(Boolean).join(", ").toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Catalog;
