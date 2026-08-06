import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle2, Info, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HighlightEventCard from "@/components/HighlightEventCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";
import { cn } from "@/lib/utils";

import heroImage1 from "@/assets/nfl img 4.jpeg";
import nflImg1 from "@/assets/nfl img1.jpeg";
import nflImg2 from "@/assets/nfl img2.jpeg";
import nflImg5 from "@/assets/nfl img 5.jpeg";
import louisePhoto from "@/assets/louise2.jpeg";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EventsAPI, HomeContentAPI, SiteSettingsAPI, TestimonialsAPI, type Event, type HomeContent, type SiteSettings, type Testimonial } from "@/lib/api";
import { getIcon } from "@/lib/iconMap";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import { EditableImage } from "@/components/admin/editable/EditableImage";
import { EditableIcon } from "@/components/admin/editable/EditableIcon";
import { RemoveItemButton, AddCardButton, AddInlineButton } from "@/components/admin/editable/EditableListControls";
import { HeroImagesManager } from "@/components/admin/editable/HeroImagesManager";

const HERO_IMAGES = [heroImage1, nflImg1, nflImg5, nflImg2];

// Contenu de repli : identique à ce qui était codé en dur avant la dynamisation.
// Tant que l'admin n'a rien modifié dans "Contenu Accueil", le site affiche exactement ceci.
const DEFAULT_HOME_CONTENT: HomeContent = {
  hero: {
    badge: "Expérience Exclusive",
    titleLine1: "L'Excellence au service de vos ambitions",
    titleLine2: "& le Prestige Événementiel",
    subtitle: "Nous accompagnons les entreprises, institutions, dirigeants et personnels dans leurs projets les plus ambitieux grâce à une expertise reconnue et une satisfaction client au coeur de notre activité.",
    ctaPrimaryText: "Découvrir nos services",
    ctaPrimaryLink: "/catalogue-formations",
    ctaSecondaryText: "Prochains événements",
    ctaSecondaryLink: "#evenements",
    badgeCardTitle: "Agréé & certifié",
    badgeCardSubtitle: "Standard International",
    images: [],
  },
  featureStrip: [
    { icon: "ShieldCheck", title: "Masterclass", subtitle: "Solutions sur mesure" },
    { icon: "Star", title: "Coaching", subtitle: "Prestige Libreville" },
    { icon: "Landmark", title: "Formations sur mesure", subtitle: "Gestion de patrimoine" },
  ],
  partners: [
    { name: "BGFIBank", logo_url: "" },
    { name: "Airtel", logo_url: "" },
    { name: "Moov Africa", logo_url: "" },
    { name: "TotalEnergies", logo_url: "" },
    { name: "Gabon Telecom", logo_url: "" },
  ],
  pillars: [
    { icon: "Building2", title: "Séminaires", description: "Accompagnement stratégique et organisation de séminaires sur mesure avec rigueur.", ctaText: "En savoir plus", link: "#evenements" },
    { icon: "Users", title: "Formations", description: "Développez la performance de vos équipes en compétences concrètes et mesurables.", ctaText: "Nos experts", link: "/catalogue-formations" },
    { icon: "Landmark", title: "Académie NFL", description: "Montée en compétences continue formée aux exigences du terrain.", ctaText: "Nos experts", link: "/catalogue-formations" },
  ],
  eventsSection: {
    eyebrow: "AGENDA",
    title: "Événements d'Exception",
    ctaText: "VOIR TOUS LES ÉVÉNEMENTS",
    ctaLink: "/events",
  },
  spotlight: {
    badge: "ACADÉMIE NFL",
    titleLines: ["Le Séminaire", "Commercial", "pour Performer"],
    description: "Développez les compétences de vos équipes avec nos programmes de formation d'élite. Nous transformons le potentiel en performance réelle à travers une approche immersive et des méthodologies éprouvées.",
    bullets: ["Psychologie de la vente haut de gamme", "Maîtrise de l'argumentaire stratégique", "Closing et fidélisation de clientèle prestige"],
    ctaText: "CONSULTER LE CATALOGUE FORMATION",
    ctaLink: "/catalogue-formations",
    image: "",
  },
  about: {
    title: "C'est quoi NFL?",
    subtitle: "Une vision née de l'exigence",
    paragraph: "Animée par le désir de partager son expérience, LOUISE-AUDYLL Ongoum fonde NFL Services & Courtier en 2019. Activement développé depuis 2023, le cabinet accompagne les entreprises dans le renforcement de leur efficacité commerciale, la formation des équipes, le management, le leadership et la culture de la performance. À travers des master classes, des formations et des accompagnements sur mesure, les organisations transforment leurs ambitions en résultats concrets.",
    valuesIntro: "Notre approche repose sur trois principes :",
    values: ["Excellence", "Accompagnement", "Résultat"],
  },
  ctaSection: {
    title: "Prêt à élever vos standards ?",
    description: "Qu'il s'agisse de sécuriser vos actifs ou d'orchestrer votre prochain grand événement, notre équipe est prête à relever le défi de l'excellence.",
    primaryBtnText: "PRENDRE RENDEZ-VOUS",
    secondaryBtnText: "NOUS CONTACTER",
  },
};

function mergeHomeContent(fetched?: HomeContent): Required<HomeContent> {
  const f = fetched || {};
  return {
    hero: { ...DEFAULT_HOME_CONTENT.hero, ...f.hero },
    featureStrip: f.featureStrip?.length ? f.featureStrip : DEFAULT_HOME_CONTENT.featureStrip!,
    pillars: f.pillars?.length ? f.pillars : DEFAULT_HOME_CONTENT.pillars!,
    partners: f.partners?.length ? f.partners : DEFAULT_HOME_CONTENT.partners!,
    eventsSection: { ...DEFAULT_HOME_CONTENT.eventsSection, ...f.eventsSection },
    spotlight: { ...DEFAULT_HOME_CONTENT.spotlight, ...f.spotlight },
    about: { ...DEFAULT_HOME_CONTENT.about, ...f.about },
    ctaSection: { ...DEFAULT_HOME_CONTENT.ctaSection, ...f.ctaSection },
  } as Required<HomeContent>;
}

// Un lien de section commence par "#" (ancre sur la page) ; sinon c'est une route.
function isAnchor(link?: string) {
  return !!link && link.startsWith("#");
}

const Index = () => {
  const location = useLocation();
  const isEditMode = useIsEditMode();
  const queryClient = useQueryClient();

  // Hero slideshow state
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Fetch ALL events (past and upcoming)
  const { data: allEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ["allEvents"],
    queryFn: () => EventsAPI.getAll(),
  });

  const { data: homeContentRaw } = useQuery<HomeContent>({
    queryKey: ["homeContent"],
    queryFn: HomeContentAPI.get,
  });
  const mergedContent = mergeHomeContent(homeContentRaw);

  // En mode édition uniquement : état local optimiste, pour que les ajouts/
  // suppressions d'éléments (piliers, bullets...) s'affichent instantanément
  // sans attendre l'aller-retour réseau. Sur le site public, jamais utilisé :
  // `content` reste alors la simple dérivation des données serveur.
  const [editableOverride, setEditableOverride] = useState<Required<HomeContent> | null>(null);
  useEffect(() => { setEditableOverride(null); }, [homeContentRaw]);
  const content = editableOverride || mergedContent;

  // Persiste une section entière (fusion côté serveur au premier niveau) et
  // met à jour l'aperçu local immédiatement.
  const saveHomeSection = async (patch: Partial<Required<HomeContent>>) => {
    const next = { ...content, ...patch } as Required<HomeContent>;
    setEditableOverride(next);
    const updated = await HomeContentAPI.update(patch as HomeContent);
    queryClient.setQueryData(["homeContent"], (prev: HomeContent | undefined) => ({ ...(prev || {}), ...updated }));
  };

  // Champ scalaire imbriqué dans une section objet, ex. hero.titleLine1
  const makeFieldSaver = <K extends keyof Required<HomeContent>>(sectionKey: K, fieldKey: string) =>
    async (value: any) => {
      await saveHomeSection({ [sectionKey]: { ...(content as any)[sectionKey], [fieldKey]: value } } as any);
    };

  // Champ d'un item dans une liste d'objets, ex. pillars[2].title
  const makeArrayItemFieldSaver = (sectionKey: "pillars" | "featureStrip" | "partners", index: number, fieldKey: string) =>
    async (value: any) => {
      const list = [...(content[sectionKey] as any[])];
      list[index] = { ...list[index], [fieldKey]: value };
      await saveHomeSection({ [sectionKey]: list } as any);
    };

  const addListItem = (sectionKey: "pillars" | "featureStrip" | "partners", newItem: any) =>
    saveHomeSection({ [sectionKey]: [...(content[sectionKey] as any[]), newItem] } as any);
  const removeListItem = (sectionKey: "pillars" | "featureStrip" | "partners", index: number) =>
    saveHomeSection({ [sectionKey]: (content[sectionKey] as any[]).filter((_, i) => i !== index) } as any);

  // Liste de chaînes simples imbriquée dans une section, ex. spotlight.bullets[1] / about.values[0]
  const makeStringListItemSaver = (sectionKey: "spotlight" | "about", listKey: string, index: number) =>
    async (value: string) => {
      const list = [...((content as any)[sectionKey][listKey] as string[])];
      list[index] = value;
      await saveHomeSection({ [sectionKey]: { ...(content as any)[sectionKey], [listKey]: list } } as any);
    };
  const addStringListItem = (sectionKey: "spotlight" | "about", listKey: string, defaultValue = "Nouvel élément") => {
    const list = [...((content as any)[sectionKey][listKey] as string[]), defaultValue];
    return saveHomeSection({ [sectionKey]: { ...(content as any)[sectionKey], [listKey]: list } } as any);
  };
  const removeStringListItem = (sectionKey: "spotlight" | "about", listKey: string, index: number) => {
    const list = ((content as any)[sectionKey][listKey] as string[]).filter((_, i) => i !== index);
    return saveHomeSection({ [sectionKey]: { ...(content as any)[sectionKey], [listKey]: list } } as any);
  };

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: SiteSettingsAPI.get,
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => TestimonialsAPI.getAll(false),
  });
  // Le marquee a besoin de plusieurs cartes pour tourner en continu :
  // on répète les témoignages disponibles jusqu'à un minimum visuel de 6.
  const marqueeTestimonials = testimonials.length
    ? Array.from({ length: Math.max(6, testimonials.length) }, (_, i) => testimonials[i % testimonials.length])
    : [];

  const heroImages = content.hero.images?.length ? content.hero.images : HERO_IMAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const today = new Date().setHours(0, 0, 0, 0);
  const upcomingEvents = allEvents
    .filter(event => new Date(event.date).getTime() >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = allEvents
    .filter(event => new Date(event.date).getTime() < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Curated highlight row: soonest upcoming events first, filled out with the
  // most recent past ones so the section always has content to show.
  const featuredEvents = [...upcomingEvents, ...pastEvents].slice(0, 3);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const node = document.getElementById(id);
    if (node) node.scrollIntoView({ behavior: "smooth" });
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{siteSettings?.site_name || "NFL Courtier & Service"} — Accueil | Billetterie & Formations au Gabon</title>
        <meta name="description" content={siteSettings?.meta_description_default || "Bienvenue chez NFL Courtier & Service. Découvrez nos prochains événements, masterclass et services de formation pour les entreprises au Gabon."} />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "${siteSettings?.site_name || "NFL Courtier & Service"}",
              "url": "${siteSettings?.site_url || "https://nfl-ga.com"}",
              "logo": "${siteSettings?.logo_url || "https://nfl-ga.com/favicon.jpg"}",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "${siteSettings?.phone || "+241 066 69 23 38"}",
                "contactType": "customer service",
                "email": "${siteSettings?.contact_email || "seminaireslao@outlook.fr"}",
                "areaServed": "GA",
                "availableLanguage": "French"
              },
              "sameAs": [
                "${siteSettings?.facebook_url || "https://www.facebook.com/nflgabon"}"
              ]
            }
          `}
        </script>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "${siteSettings?.site_url || "https://nfl-ga.com"}",
              "name": "NFL-GA",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "${siteSettings?.site_url || "https://nfl-ga.com"}/events?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </Helmet>

      {/* 1. TOP BANNER */}
      {/* <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-primary font-bold text-center py-2.5 text-sm uppercase tracking-[0.2em] animate-fade-in shadow-md relative z-50">
        SEMINAIRES LAO devient "NFL"
      </div> */}

      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0c0705] pt-24 pb-14 lg:pt-32 lg:pb-16">
        {/* Rich gold lighting gradients */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#32140c]/40 rounded-full blur-[150px] pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* Column Left: Headline & CTAs */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="inline-flex px-4 py-1.5 border border-gold/40 rounded-full text-lvl-footer font-bold uppercase tracking-[0.2em] text-gold">
                <EditableText value={content.hero.badge || ""} onSave={makeFieldSaver("hero", "badge")} label="Badge du hero" />
              </div>

              <h1 className="text-lvl-hero text-balance">
                <span className="block text-white">
                  <EditableText value={content.hero.titleLine1 || ""} onSave={makeFieldSaver("hero", "titleLine1")} label="Titre — ligne 1" multiline />
                </span>
                <span className="block italic text-gold mt-1">
                  <EditableText value={content.hero.titleLine2 || ""} onSave={makeFieldSaver("hero", "titleLine2")} label="Titre — ligne 2 (accent)" multiline />
                </span>
              </h1>

              <p className="text-white/70 text-lvl-body max-w-xl font-light">
                <EditableText value={content.hero.subtitle || ""} onSave={makeFieldSaver("hero", "subtitle")} label="Sous-titre" multiline as="div" />
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                <Button variant="gold" size="lg" className="uppercase text-lvl-footer font-bold tracking-widest px-8" asChild={!isEditMode}>
                  {isEditMode ? (
                    <EditableText value={content.hero.ctaPrimaryText || ""} onSave={makeFieldSaver("hero", "ctaPrimaryText")} label="Texte du bouton principal" />
                  ) : (
                    <Link to={content.hero.ctaPrimaryLink || "/catalogue-formations"}>{content.hero.ctaPrimaryText}</Link>
                  )}
                </Button>
                <Button
                  variant="gold-outline"
                  size="lg"
                  className="uppercase text-lvl-footer font-bold tracking-widest px-8"
                  onClick={isEditMode ? undefined : () => {
                    const link = content.hero.ctaSecondaryLink || "#evenements";
                    if (isAnchor(link)) document.getElementById(link.slice(1))?.scrollIntoView({ behavior: "smooth" });
                    else window.location.href = link;
                  }}
                >
                  {isEditMode ? (
                    <EditableText value={content.hero.ctaSecondaryText || ""} onSave={makeFieldSaver("hero", "ctaSecondaryText")} label="Texte du bouton secondaire" />
                  ) : content.hero.ctaSecondaryText}
                </Button>
              </div>
            </div>

            {/* Column Right: Auto-Animated Image Slideshow */}
            <div className="lg:col-span-6 relative mb-8 lg:mb-6">
              <div className="relative rounded-[2rem] overflow-hidden border border-gold/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
                {/* Crossfade Slides */}
                {heroImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`NFL Courtier & Service — image ${idx + 1}`}
                    className={`w-full h-[320px] sm:h-[420px] lg:h-[480px] object-cover absolute inset-0 transition-opacity duration-1000 ${
                      idx === heroSlideIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    } ${idx === 0 ? "static" : "absolute"}`}
                    style={{ position: idx === 0 ? "relative" : "absolute" }}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0705]/50 via-transparent to-transparent z-20" />

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Image ${idx + 1}`}
                      onClick={() => setHeroSlideIndex(idx)}
                      className={`transition-all duration-300 rounded-full ${
                        idx === heroSlideIndex
                          ? "w-5 h-2 bg-[#e3bd51]"
                          : "w-2 h-2 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>

                {isEditMode && (
                  <HeroImagesManager
                    images={heroImages}
                    onSave={(images) => saveHomeSection({ hero: { ...content.hero, images } })}
                  />
                )}
              </div>

              <div className="absolute -bottom-6 left-6 bg-[#150805] border border-gold/20 rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3 max-w-[280px] z-30">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-lvl-footer uppercase tracking-widest text-white/50 font-bold">
                    <EditableText value={content.hero.badgeCardTitle || ""} onSave={makeFieldSaver("hero", "badgeCardTitle")} label="Encart — titre" />
                  </p>
                  <p className="text-white font-semibold text-lvl-body">
                    <EditableText value={content.hero.badgeCardSubtitle || ""} onSave={makeFieldSaver("hero", "badgeCardSubtitle")} label="Encart — sous-titre" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature strip (Static centered on Desktop) */}
          <div className="border-t border-white/10 mt-10 lg:mt-14 pt-8 w-full pointer-events-auto">
            <div className="flex flex-wrap justify-center lg:justify-between gap-8 lg:gap-12 py-2">
              {content.featureStrip.map(({ icon, title, subtitle }, idx) => (
                <div key={idx} className="group relative flex items-center gap-4 shrink-0">
                  {isEditMode && content.featureStrip.length > 1 && (
                    <RemoveItemButton onClick={() => removeListItem("featureStrip", idx)} label="Retirer cet item" />
                  )}
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <EditableIcon value={icon} onSave={makeArrayItemFieldSaver("featureStrip", idx, "icon")} className="w-4.5 h-4.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lvl-footer whitespace-nowrap">
                      <EditableText value={title || ""} onSave={makeArrayItemFieldSaver("featureStrip", idx, "title")} label="Titre" />
                    </p>
                    <p className="text-white/50 text-lvl-footer whitespace-nowrap">
                      <EditableText value={subtitle || ""} onSave={makeArrayItemFieldSaver("featureStrip", idx, "subtitle")} label="Sous-titre" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {isEditMode && (
              <div className="flex items-center pt-8 justify-center w-full">
                <button
                  onClick={() => addListItem("featureStrip", { icon: "Star", title: "Nouvel item", subtitle: "Sous-titre" })}
                  className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-wider hover:text-[#d4af37] transition-colors"
                >
                  + Ajouter un item
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
 
      {/* 2. NOS PILIERS D'ACCOMPAGNEMENT */}
      <section className="section-y bg-[#E5E2E1]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="text-gold-dark text-lvl-footer font-bold uppercase tracking-[0.2em]">Expertise</span>
            <h2 className="text-lvl-title text-foreground mt-3">
              Nos Piliers d'Accompagnement
            </h2>
            <div className="w-16 h-[3px] gradient-gold mx-auto mt-5 rounded-full" />
          </div>

          {/* Stacked on Mobile & Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {content.pillars.map((pillar, idx) => {
              const link = pillar.link || "";
              return (
                <div
                  key={idx}
                  className="group relative bg-[#DEDAD7] rounded-md p-6 sm:p-7 md:p-9 flex flex-col justify-between shadow-sm border border-black/5 min-h-[220px] sm:min-h-[360px] md:min-h-[400px]"
                >
                  {isEditMode && content.pillars.length > 1 && (
                    <RemoveItemButton onClick={() => removeListItem("pillars", idx)} label="Retirer ce pilier" />
                  )}
                  <div>
                    <EditableIcon value={pillar.icon} onSave={makeArrayItemFieldSaver("pillars", idx, "icon")} className="w-4 h-4 sm:w-8 sm:h-8 text-gold-dark mb-1 sm:mb-5 shrink-0" />
                    <h3 className="text-lvl-subtitle text-[#1c1c1c] mb-1 sm:mb-3">
                      <EditableText value={pillar.title || ""} onSave={makeArrayItemFieldSaver("pillars", idx, "title")} label="Titre" />
                    </h3>
                    <p className="text-[#555] text-lvl-body mb-2 sm:mb-6 font-normal">
                      <EditableText value={pillar.description || ""} onSave={makeArrayItemFieldSaver("pillars", idx, "description")} label="Description" multiline as="div" />
                    </p>
                  </div>
                  {isEditMode ? (
                    <span className="text-lvl-footer font-bold uppercase tracking-wider text-gold-dark inline-flex items-center gap-2 mt-auto pt-1">
                      <EditableText value={pillar.ctaText || ""} onSave={makeArrayItemFieldSaver("pillars", idx, "ctaText")} label="Texte du bouton" /> <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </span>
                  ) : !isAnchor(link) ? (
                    <Link
                      to={link}
                      className="text-lvl-footer font-bold uppercase tracking-wider text-gold-dark hover:text-gold inline-flex items-center gap-2 transition-colors mt-auto pt-1"
                    >
                      <span>{pillar.ctaText}</span> <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => document.getElementById(link.slice(1))?.scrollIntoView({ behavior: "smooth" })}
                      className="text-lvl-footer font-bold uppercase tracking-wider text-gold-dark hover:text-gold inline-flex items-center gap-2 transition-colors w-fit text-left mt-auto pt-1"
                    >
                      <span>{pillar.ctaText}</span> <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  )}
                </div>
              );
            })}
            {isEditMode && (
              <AddCardButton
                onClick={() => addListItem("pillars", { icon: "Star", title: "Nouveau pilier", description: "Description...", ctaText: "En savoir plus", link: "/" })}
                label="Ajouter un pilier"
              />
            )}
          </div>
        </div>
      </section>

      {/* 3. EVENEMENTS D'EXCEPTION */}
      <section id="evenements" className="section-y bg-[#4c5462] relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-[#c29c38] text-lvl-footer font-bold uppercase tracking-[0.2em]">
                <EditableText value={content.eventsSection.eyebrow || ""} onSave={makeFieldSaver("eventsSection", "eyebrow")} label="Eyebrow" />
              </span>
              <h2 className="text-lvl-title text-white mt-1">
                <EditableText value={content.eventsSection.title || ""} onSave={makeFieldSaver("eventsSection", "title")} label="Titre de section" />
              </h2>
            </div>
            <Link
              to={content.eventsSection.ctaLink || "/events"}
              className="inline-flex items-center gap-2 bg-white text-black text-lvl-footer font-bold uppercase tracking-wider px-5 py-2.5 rounded-none hover:bg-white/90 transition-colors w-fit shadow-sm"
              onClick={isEditMode ? (e) => e.preventDefault() : undefined}
            >
              {isEditMode ? (
                <EditableText value={content.eventsSection.ctaText || ""} onSave={makeFieldSaver("eventsSection", "ctaText")} label="Texte du bouton" />
              ) : content.eventsSection.ctaText}
            </Link>
          </div>

          <div className="relative">
            {isEditMode && (
              <div className="flex items-center gap-2 text-white/50 text-lvl-footer mb-4 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 w-fit">
                <Info className="w-3.5 h-3.5 text-[#e3bd51] shrink-0" />
                Les événements affichés ici sont gérés depuis l'onglet <strong className="text-white/80">Événements</strong>.
              </div>
            )}
            {featuredEvents.length === 0 ? (
              <div className="text-center py-16 text-white/50 border border-white/10">
                Aucun événement à afficher pour le moment.
              </div>
            ) : (
              <div className={`flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-3 md:gap-6 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 ${isEditMode ? "pointer-events-none" : ""}`}>
                {featuredEvents.map((event) => (
                  <div key={event.id} className="w-[85vw] max-w-[320px] md:w-auto shrink-0 snap-center">
                    <HighlightEventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. SPOTLIGHT - ACADÉMIE NFL */}
      <section className="section-y bg-[#e6e4e0] relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-center relative">
            {/* Left Composition (3 Layers: Wireframe, White Mat, Photo) */}
            <div className="relative shrink-0 z-0">
              {/* Layer 1: Top-Left Wireframe Box */}
              <div className="hidden lg:block absolute -top-12 -left-12 w-[320px] h-[340px] border border-[#a8a59e] pointer-events-none" />

              {/* Layer 2 & 3: White Frame Mat + Photo */}
              <div className="relative bg-[#f5f3ef] p-4 sm:p-6 shadow-md rounded-none border border-black/5 w-full max-w-[480px] sm:w-[480px]">
                <div className="relative overflow-hidden shadow-sm w-full h-[360px] sm:h-[480px]">
                  <EditableImage
                    src={content.spotlight.image || heroImage1}
                    alt="Séminaire commercial NFL Courtier & Service"
                    className="w-full h-full object-cover block"
                    wrapperClassName="w-full h-full"
                    onSave={(url) => saveHomeSection({ spotlight: { ...content.spotlight, image: url } })}
                  />
                </div>
              </div>
            </div>

            {/* Right Floating Content Card (Side-by-side horizontally overlapping photo) */}
            <div className="relative z-10 -mt-16 lg:mt-0 lg:-ml-24 w-full max-w-[500px]">
              <div className="bg-white text-[#1c1c1c] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] rounded-none border border-black/5">
                <span className="text-[#a28229] text-lvl-footer font-bold uppercase tracking-[0.25em] block text-right mb-3">
                  <EditableText value={content.spotlight.badge || ""} onSave={makeFieldSaver("spotlight", "badge")} label="Badge" />
                </span>
                <h2 className="text-lvl-title text-[#1c1c1c] mb-4">
                  {isEditMode ? (
                    [0, 1, 2].map((i) => (
                      <span key={i} className="block">
                        <EditableText
                          value={(content.spotlight.titleLines || [])[i] || ""}
                          onSave={async (v) => {
                            const lines = [...(content.spotlight.titleLines || ["", "", ""])];
                            lines[i] = v;
                            await saveHomeSection({ spotlight: { ...content.spotlight, titleLines: lines } });
                          }}
                          label={`Titre — ligne ${i + 1}`}
                        />
                      </span>
                    ))
                  ) : (
                    (content.spotlight.titleLines || []).map((line, i, arr) => (
                      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                    ))
                  )}
                </h2>
                <p className="text-[#666666] text-lvl-body mb-6">
                  <EditableText value={content.spotlight.description || ""} onSave={makeFieldSaver("spotlight", "description")} label="Description" multiline as="div" />
                </p>
                <ul className="space-y-3 mb-8">
                  {(content.spotlight.bullets || []).map((item, idx) => (
                    <li key={idx} className="group relative flex items-start gap-3 text-lvl-body text-[#333333] font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#655410] shrink-0 mt-0.5" />
                      <span className="flex-1">
                        <EditableText value={item} onSave={makeStringListItemSaver("spotlight", "bullets", idx)} label="Point clé" as="div" />
                      </span>
                      {isEditMode && (content.spotlight.bullets || []).length > 1 && (
                        <button onClick={() => removeStringListItem("spotlight", "bullets", idx)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {isEditMode && (
                  <AddInlineButton onClick={() => addStringListItem("spotlight", "bullets", "Nouveau point clé")} label="Ajouter un point clé" />
                )}
                <Link
                  to={content.spotlight.ctaLink || "/catalogue-formations"}
                  className="block text-center bg-[#655410] hover:bg-[#52440b] text-white font-bold text-lvl-footer uppercase tracking-wider py-3.5 px-6 rounded-none transition-colors shadow-sm mt-4"
                  onClick={isEditMode ? (e) => e.preventDefault() : undefined}
                >
                  {isEditMode ? (
                    <EditableText value={content.spotlight.ctaText || ""} onSave={makeFieldSaver("spotlight", "ctaText")} label="Texte du bouton" />
                  ) : content.spotlight.ctaText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TEMOIGNAGES - Linear Infinite Marquee */}
      <section className="section-y bg-[#0a0b0d] overflow-hidden relative">
        <div className="container mx-auto px-4 mb-10 md:mb-14 text-center">
          <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.2em] block">NFL Impact</span>
          <h2 className="text-lvl-title text-white mt-3">
            Témoignages
          </h2>
          <div className="w-16 h-[3px] bg-gradient-to-r from-[#b89535] via-[#e3bd51] to-[#b89535] mx-auto mt-5 rounded-full" />
        </div>

        <div className="w-full relative">
          {/* Subtle edge fade overlays for smooth scrolling transition */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0a0b0d] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0a0b0d] to-transparent z-10 pointer-events-none" />

          {isEditMode && (
            <div className="flex items-center gap-2 text-white/50 text-lvl-footer mb-4 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 w-fit relative z-20">
              <Info className="w-3.5 h-3.5 text-[#e3bd51] shrink-0" />
              Les témoignages affichés ici sont gérés depuis l'onglet <strong className="text-white/80">Témoignages</strong>.
            </div>
          )}
          {/* Marquee Track */}
          {marqueeTestimonials.length > 0 && (
            <div className={`flex animate-marquee gap-6 w-max ${isEditMode ? "pointer-events-none" : ""}`}>
              {marqueeTestimonials.map((t, index) => {
                const initials = t.author_name
                  ? t.author_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                  : "NFL";
                return (
                  <div
                    key={`${t.id}-${index}`}
                    className="w-[280px] sm:w-[320px] min-h-[300px] bg-[#282a2e] border border-white/5 p-6 sm:p-7 rounded-none flex flex-col justify-between shrink-0 shadow-2xl h-auto"
                  >
                    <p className="italic text-white/90 text-lvl-body tracking-wide">
                      "{t.quote}"
                    </p>

                    <div className="flex items-end gap-3.5 mt-auto pt-6">
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt={t.author_name} className="w-10 h-10 rounded-none object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-[#e3bd51] text-black font-bold text-lvl-footer flex items-center justify-center rounded-none shrink-0">
                          {initials}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold text-lvl-body leading-tight">{t.author_name}</p>
                        <p className="text-[#e3bd51] text-lvl-footer font-semibold uppercase tracking-wider mt-0.5">
                          {[t.author_role, t.author_company].filter(Boolean).join(", ").toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. PRÊT À ÉLEVER VOS STANDARDS ? (CTA) */}
      <section id="contact" className="section-y bg-[#e2dfdb] text-center border-t border-black/10">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-lvl-title text-[#1c1c1c] mb-4">
            <EditableText value={content.ctaSection.title || ""} onSave={makeFieldSaver("ctaSection", "title")} label="Titre" />
          </h2>
          <p className="text-[#555] text-lvl-body mb-8 max-w-xl mx-auto font-normal">
            <EditableText value={content.ctaSection.description || ""} onSave={makeFieldSaver("ctaSection", "description")} label="Description" multiline as="div" />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={isEditMode ? undefined : () => document.getElementById("footer-contact")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#655410] hover:bg-[#52440b] text-white font-bold text-lvl-footer uppercase tracking-wider py-3.5 px-8 rounded-none shadow-sm transition-colors"
            >
              {isEditMode ? (
                <EditableText value={content.ctaSection.primaryBtnText || ""} onSave={makeFieldSaver("ctaSection", "primaryBtnText")} label="Bouton principal" />
              ) : content.ctaSection.primaryBtnText}
            </button>
            <button
              onClick={isEditMode ? undefined : () => document.getElementById("footer-contact")?.scrollIntoView({ behavior: "smooth" })}
              className="border border-black/30 bg-transparent hover:bg-black/5 text-[#1c1c1c] font-bold text-lvl-footer uppercase tracking-wider py-3.5 px-8 rounded-none transition-colors"
            >
              {isEditMode ? (
                <EditableText value={content.ctaSection.secondaryBtnText || ""} onSave={makeFieldSaver("ctaSection", "secondaryBtnText")} label="Bouton secondaire" />
              ) : content.ctaSection.secondaryBtnText}
            </button>
          </div>
        </div>
      </section>

      {/* 7. C'EST QUOI NFL ? */}
      <section className="section-y bg-[#e8e6e2] border-t-8 border-black text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-lvl-title text-[#1c1c1c] mb-6">
            <EditableText value={content.about.title || ""} onSave={makeFieldSaver("about", "title")} label="Titre" />
          </h2>
          <p className="text-[#444] text-lvl-subtitle font-normal mb-6">
            <EditableText value={content.about.subtitle || ""} onSave={makeFieldSaver("about", "subtitle")} label="Sous-titre" />
          </p>
          <p className="text-[#555] text-lvl-body mb-8 max-w-2xl mx-auto font-normal">
            <EditableText value={content.about.paragraph || ""} onSave={makeFieldSaver("about", "paragraph")} label="Paragraphe" multiline as="div" />
          </p>
          <p className="text-[#333] text-lvl-body font-medium mb-4">
            <EditableText value={content.about.valuesIntro || ""} onSave={makeFieldSaver("about", "valuesIntro")} label="Intro des valeurs" />
          </p>
          <div className="flex flex-col items-start gap-3 max-w-xs mx-auto">
            {(content.about.values || []).map((item, idx) => (
              <div
                key={idx}
                className="group relative flex items-center gap-3 text-[#333] font-medium text-lvl-body w-full"
              >
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#655410]/10 border border-[#655410]/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#655410] shrink-0" />
                </span>
                <span className="font-semibold tracking-wide">
                  <EditableText value={item} onSave={makeStringListItemSaver("about", "values", idx)} label="Valeur" />
                </span>
                {isEditMode && (content.about.values || []).length > 1 && (
                  <button onClick={() => removeStringListItem("about", "values", idx)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <AddInlineButton onClick={() => addStringListItem("about", "values", "Nouvelle valeur")} label="Ajouter une valeur" />
            )}
          </div>
        </div>
      </section>

      {/* 6. FAQ 
      <section id="faq" className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-bold text-foreground mb-4">Foire aux <span className="text-gradient-gold">questions</span></h2>
              <p className="text-muted-foreground text-lg">Tout ce que vous devez savoir sur nos services d'accompagnement.</p>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
                { q: "Quels types de formations proposez-vous ?", a: "Nous proposons des masterclass intensives (publiques), des séminaires d'entreprise intra et inter, ainsi que des formations privées sur-mesure axées sur le leadership, le management et le closing commercial." },
                { q: "Comment puis-je réserver ma place pour un événement ?", a: "Vous pouvez réserver directement en ligne via la section 'Prochaines dates' de notre site. Une fois le paiement validé, vous recevrez votre billet sécurisé par email avec un QR code." },
                { q: "Avez-vous des programmes d'accompagnement spécifiques pour les cadres dirigeants ?", a: "Tout à fait. LOUISE AUDYLL Ongoum accompagne personnellement des cadres dirigeants en One-to-One pour débloquer leur potentiel de leadership et affiner leur vision stratégique." },
                { q: "Intervenez-vous en dehors du Gabon ?", a: "Oui, nous pouvons concevoir et délivrer des formations dans toute l'Afrique francophone et à l'international, selon la demande des entreprises." },
                { q: "Quels sont les modes de paiement acceptés pour vos formations ?", a: "Pour les séminaires publics, vous pouvez payer via Mobile Money (Airtel Money, Moov Africa) ou par carte bancaire. Pour les formations privées en entreprise, un virement bancaire classique est mis en place." }
              ].map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="glass-card border border-border bg-background rounded-2xl px-6 data-[state=open]:border-gold/40 transition-colors">
                  <AccordionTrigger className="text-lg font-semibold hover:text-gold hover:no-underline py-5 text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
      */}

      {/* PARTENAIRES & SPONSORS — logos gérés depuis l'éditeur visuel */}
      <section className="py-10 bg-[#0a0b0d] border-y border-white/5 overflow-hidden relative">
        {isEditMode ? (
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-white/50 text-lvl-footer mb-5 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 w-fit">
              <Info className="w-3.5 h-3.5 text-[#e3bd51] shrink-0" />
              Logos partenaires &amp; sponsors, affichés en boucle sur l'accueil et le catalogue formations.
            </div>
            <div className="flex flex-wrap gap-4">
              {content.partners.map((p, idx) => (
                <div key={idx} className="group relative w-40 h-24 bg-white/5 border border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 p-3">
                  {content.partners.length > 1 && (
                    <RemoveItemButton onClick={() => removeListItem("partners", idx)} label="Retirer ce partenaire" />
                  )}
                  <EditableImage
                    src={p.logo_url || ""}
                    alt={p.name || "Logo partenaire"}
                    className="max-w-full max-h-12 object-contain"
                    wrapperClassName={cn(
                      "w-full h-12 flex items-center justify-center",
                      !p.logo_url && "border border-dashed border-white/20 rounded"
                    )}
                    onSave={(url) => makeArrayItemFieldSaver("partners", idx, "logo_url")(url)}
                  />
                  <span className="text-white/60 text-lvl-footer font-semibold text-center w-full truncate">
                    <EditableText value={p.name || ""} onSave={makeArrayItemFieldSaver("partners", idx, "name")} label="Nom du partenaire" />
                  </span>
                </div>
              ))}
              <AddCardButton
                onClick={() => addListItem("partners", { name: "Nouveau partenaire", logo_url: "" })}
                label="Ajouter"
                className="w-40 h-24 min-h-0"
              />
            </div>
          </div>
        ) : (
          <div className="w-full relative">
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0a0b0d] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0a0b0d] to-transparent z-10 pointer-events-none" />

            <div className="flex gap-16 w-max py-1 animate-marquee items-center">
              {Array.from({ length: 3 }).map((_, outerIdx) => (
                <div key={outerIdx} className="flex gap-16 items-center shrink-0">
                  {content.partners.map((p, idx) =>
                    p.logo_url ? (
                      <img
                        key={idx}
                        src={p.logo_url}
                        alt={p.name || "Partenaire NFL Courtier & Service"}
                        className="h-16 sm:h-20 w-auto max-w-[180px] sm:max-w-[240px] object-contain opacity-90 hover:opacity-100 transition-all shrink-0"
                      />
                    ) : (
                      <span
                        key={idx}
                        className="text-white/40 hover:text-white/70 transition-colors text-lvl-subtitle tracking-[0.2em] uppercase font-bold shrink-0 whitespace-nowrap"
                      >
                        {p.name}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Index;
