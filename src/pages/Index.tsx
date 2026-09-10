import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ShieldCheck, CheckCircle2, Info, X, Award, GraduationCap, Calendar, Briefcase, TrendingUp, Users, Crown } from "lucide-react";
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
import nflImg3 from "@/assets/nfl img3.jpeg";
import nflImg5 from "@/assets/nfl img 5.jpeg";
import nflImg6 from "@/assets/nfl img 6.jpeg";
import louisePhoto from "@/assets/louise2.jpeg";
import louisePhotoFull from "@/assets/louise photo.jpeg";
import nflTourisme from "@/assets/nfl-tourisme.jpg";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EventsAPI, HomeContentAPI, SiteSettingsAPI, TestimonialsAPI, type Event, type HomeContent, type SiteSettings, type Testimonial } from "@/lib/api";
import { getIcon } from "@/lib/iconMap";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import { EditableImage } from "@/components/admin/editable/EditableImage";
import { EditableIcon } from "@/components/admin/editable/EditableIcon";
import { RemoveItemButton, AddCardButton, AddInlineButton } from "@/components/admin/editable/EditableListControls";
import { HeroImagesManager } from "@/components/admin/editable/HeroImagesManager";
import GrevyHeroSection from "@/components/GrevyHeroSection";
import ExpertisePillarsSection from "@/components/ExpertisePillarsSection";
import KeyStatsSection from "@/components/KeyStatsSection";
import EventsCarousel from "@/components/EventsCarousel";
import { InfiniteSlider } from "@/components/core/infinite-slider";

const HERO_IMAGES = [heroImage1, nflImg1, nflImg5, nflImg2];

// Contenu de repli : identique à ce qui était codé en dur avant la dynamisation.
// Tant que l'admin n'a rien modifié dans "Contenu Accueil", le site affiche exactement ceci.
const DEFAULT_HOME_CONTENT: HomeContent = {
  hero: {
    badge: "",
    titleLine1: "L'Excellence au service",
    titleLine2: "de vos ambitions",
    subtitle: "Nous accompagnons les entreprises, institutions, dirigeants et personnels dans leurs projets les plus ambitieux grâce à une expertise reconnue et une satisfaction client au coeur de notre activité.",
    ctaPrimaryText: "Découvrir nos services",
    ctaPrimaryLink: "/catalogue-formations",
    ctaSecondaryText: "& le Prestige Événementiel",
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

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    author_name: "Isabella Rodriguez",
    author_role: "Directrice Commerciale",
    author_company: "BGFIBank Gabon",
    quote: "Un accompagnement d'exception. La rigueur et le professionnalisme de l'équipe NFL ont permis de transformer la dynamique commerciale de nos équipes.",
  },
  {
    id: "2",
    author_name: "Gabrielle Williams",
    author_role: "Responsable Formation",
    author_company: "Airtel Gabon",
    quote: "Le séminaire sur le closing haut de gamme dispensé par Louise Ongoum est d'une valeur inestimable. Résultats concrets et immédiats sur le terrain.",
  },
  {
    id: "3",
    author_name: "Samantha Johnson",
    author_role: "Directrice des Ressources Humaines",
    author_company: "TotalEnergies",
    quote: "Un partenaire stratégique incontournable à Libreville. Une expertise fine, une réactivité exemplaire et un sens du détail remarquable.",
  },
  {
    id: "4",
    author_name: "Victoria Thompson",
    author_role: "Fondatrice & Dirigeante",
    author_company: "Prestige Group",
    quote: "Grâce aux modules de l'Académie NFL, nos managers ont développé un leadership affirmé et une culture de la haute performance durable.",
  },
  {
    id: "5",
    author_name: "John Peter",
    author_role: "Directeur Général",
    author_company: "Gabon Telecom",
    quote: "L'organisation clé en main de notre séminaire exécutif était tout simplement parfaite. Du prestige, de la précision et un contenu sur mesure.",
  },
  {
    id: "6",
    author_name: "Natalie Martinez",
    author_role: "Cadre Supérieur",
    author_company: "Secteur Bancaire",
    quote: "Une expérience d'apprentissage enrichissante, immersive et stimulante. Je recommande vivement les formations NFL à toute organisation ambitieuse.",
  },
];

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

// Motion design — variants réutilisés pour les animations d'apparition au scroll.
// `once: true` évite de rejouer l'animation à chaque passage, pour rester discret.
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const viewportOnce = { once: true, margin: "-80px" };

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const { data: fetchedTestimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => TestimonialsAPI.getAll(false),
  });

  const allTestimonialsList = fetchedTestimonials.length > 0 ? fetchedTestimonials : DEFAULT_TESTIMONIALS;
  const halfTestimonials = Math.ceil(allTestimonialsList.length / 2);
  const row1Testimonials = allTestimonialsList.slice(0, halfTestimonials);
  const row2Testimonials = allTestimonialsList.slice(halfTestimonials);

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

      {/* 1. HERO SECTION (Template Grevy exact) */}
      <GrevyHeroSection
        content={content.hero}
        onSaveField={async (field, val) => {
          await makeFieldSaver("hero", field)(val);
        }}
      />



      {/* 2. NOS PILIERS D'ACCOMPAGNEMENT (Présentation interactive par onglets) */}
      <ExpertisePillarsSection
        pillars={content.pillars}
        onSaveItemField={(index, field, value) => makeArrayItemFieldSaver("pillars", index, field)(value)}
        onAddPillar={async () => {
          await addListItem("pillars", {
            icon: "Star",
            title: "Nouveau pilier",
            description: "Description de votre nouveau programme d'accompagnement...",
            ctaText: "En savoir plus",
            link: "/catalogue-formations",
          });
        }}
        onRemovePillar={async (idx) => {
          await removeListItem("pillars", idx);
        }}
      />

      {/* 2.5 CHIFFRES CLÉS & VITRINE VIDÉO */}
      <KeyStatsSection />

      {/* 3. EVENEMENTS D'EXCEPTION */}
      <section id="evenements" className="section-y bg-gradient-to-b from-[#fbf5e6] via-[#f7ebd7] to-[#fbf5e6] border-y border-[#d4af37]/25 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl relative z-10">
          {isEditMode && (
            <div className="flex items-center gap-2 text-ink/60 text-lvl-footer mb-4 bg-black/5 border border-black/10 rounded-lg px-4 py-2.5 w-fit">
              <Info className="w-3.5 h-3.5 text-gold-dark shrink-0" />
              Les événements affichés ici sont gérés depuis l'onglet <strong className="text-ink/80">Événements</strong>.
            </div>
          )}
          {featuredEvents.length === 0 ? (
            <div className="text-center py-16 text-ink/50 border border-black/10 rounded-2xl">
              Aucun événement à afficher pour le moment.
            </div>
          ) : (
            <EventsCarousel events={featuredEvents} isEditMode={isEditMode} />
          )}
        </div>
      </section>

      {/* 5. TEMOIGNAGES - DUAL-ROW MARQUEE (EXACTEMENT COMME LA MAQUETTE RÉFÉRENCE) */}
      <section className="section-y bg-[#fcfbfa] overflow-hidden relative border-t border-black/5">
        <motion.div
          className="container mx-auto px-4 mb-12 sm:mb-16 text-center max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#100906]">
            Ce que disent nos clients &amp; partenaires
          </h2>
          <div className="w-20 h-[3px] bg-gradient-to-r from-[#8a4216] via-[#d4af37] to-[#8a4216] mx-auto mt-5 rounded-full" />
        </motion.div>

        <div className="w-full relative space-y-6">
          {/* Dégradés latéraux fluides pour l'effet de transition */}
          <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#fcfbfa] via-[#fcfbfa]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#fcfbfa] via-[#fcfbfa]/80 to-transparent z-10 pointer-events-none" />

          {isEditMode && (
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 text-ink/60 text-lvl-footer mb-4 bg-black/5 border border-black/10 rounded-lg px-4 py-2.5 w-fit relative z-20">
                <Info className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                Les témoignages affichés ici sont gérés depuis l'onglet <strong className="text-ink/80">Témoignages</strong>.
              </div>
            </div>
          )}

          {/* RANGÉE 1 (DÉFILEMENT VERS LA GAUCHE) */}
          <div className={`flex animate-marquee gap-6 w-max ${isEditMode ? "pointer-events-none" : ""}`}>
            {[...row1Testimonials, ...row1Testimonials, ...row1Testimonials].map((t, index) => {
              const initials = t.author_name
                ? t.author_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                : "NFL";
              return (
                <div
                  key={`r1-${t.id || index}-${index}`}
                  className="w-[300px] sm:w-[380px] bg-[#f6f4ef] border border-[#e6e1d4] p-6 sm:p-7 rounded-[1.8rem] flex flex-col justify-between shrink-0 shadow-sm hover:shadow-md transition-all duration-300 h-full"
                >
                  <div>
                    <div className="text-[#8c591a] text-3xl font-serif font-black leading-none mb-3 opacity-80">
                      “
                    </div>
                    <p className="text-[#121212] font-medium text-sm sm:text-base leading-relaxed mb-6 font-normal">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 border-t border-black/5 mt-auto">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.author_name} className="w-11 h-11 rounded-full object-cover shrink-0 border border-[#d4af37]/40 shadow-sm" />
                    ) : (
                      <div className="w-11 h-11 bg-[#100906] text-[#d4af37] font-bold text-xs flex items-center justify-center rounded-full shrink-0 border border-white/20 shadow-sm">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-[#100906] font-bold text-sm sm:text-base leading-tight">{t.author_name}</p>
                      <p className="text-[#666] text-xs font-medium mt-0.5">
                        {[t.author_role, t.author_company].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RANGÉE 2 (DÉFILEMENT INVERSE VERS LA DROITE) */}
          <div className={`flex animate-marquee-reverse gap-6 w-max ${isEditMode ? "pointer-events-none" : ""}`}>
            {[...row2Testimonials, ...row2Testimonials, ...row2Testimonials].map((t, index) => {
              const initials = t.author_name
                ? t.author_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                : "NFL";
              return (
                <div
                  key={`r2-${t.id || index}-${index}`}
                  className="w-[300px] sm:w-[380px] bg-[#f6f4ef] border border-[#e6e1d4] p-6 sm:p-7 rounded-[1.8rem] flex flex-col justify-between shrink-0 shadow-sm hover:shadow-md transition-all duration-300 h-full"
                >
                  <div>
                    <div className="text-[#8c591a] text-3xl font-serif font-black leading-none mb-3 opacity-80">
                      “
                    </div>
                    <p className="text-[#121212] font-medium text-sm sm:text-base leading-relaxed mb-6 font-normal">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 border-t border-black/5 mt-auto">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.author_name} className="w-11 h-11 rounded-full object-cover shrink-0 border border-[#d4af37]/40 shadow-sm" />
                    ) : (
                      <div className="w-11 h-11 bg-[#100906] text-[#d4af37] font-bold text-xs flex items-center justify-center rounded-full shrink-0 border border-white/20 shadow-sm">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-[#100906] font-bold text-sm sm:text-base leading-tight">{t.author_name}</p>
                      <p className="text-[#666] text-xs font-medium mt-0.5">
                        {[t.author_role, t.author_company].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. PRÊT À ÉLEVER VOS STANDARDS ? (TEMPLATE ORBITE - ACCENT SOMBRE DE LUXE) */}
      <section id="contact" className="section-y bg-[#100906] text-white relative overflow-hidden py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl relative z-10">
          <motion.div
            className="bg-[#18110d] rounded-[2.5rem] p-8 sm:p-12 lg:p-16 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* GLOW DE FOND DANS LA CARTE SOMBRE */}
            <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-[#d4af37]/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] bg-[#8c591a]/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
              
              {/* GAUCHE : TEXTE & BOUTONS D'ACTION */}
              <div className="lg:col-span-6 space-y-6 text-left">

                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  <EditableText value={content.ctaSection.title || "Prêt à élever vos standards ?"} onSave={makeFieldSaver("ctaSection", "title")} label="Titre" />
                </h2>

                <p className="text-base sm:text-lg text-white/70 font-normal leading-relaxed max-w-xl">
                  <EditableText 
                    value={content.ctaSection.description || "Qu'il s'agisse de sécuriser vos actifs ou d'orchestrer votre prochain grand événement, notre équipe est prête à relever le défi de l'excellence."} 
                    onSave={makeFieldSaver("ctaSection", "description")} 
                    label="Description" 
                    multiline 
                    as="div" 
                  />
                </p>

                <div className="flex flex-row gap-2 sm:gap-4 pt-2">
                  <button
                    onClick={isEditMode ? undefined : () => navigate("/contact")}
                    className="flex-1 sm:flex-initial gradient-gold text-accent-foreground font-bold text-[10px] sm:text-xs uppercase tracking-tight sm:tracking-wider py-3 px-3 sm:py-4 sm:px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-1 sm:gap-2 group whitespace-nowrap min-w-0"
                  >
                    <span>
                      {isEditMode ? (
                        <EditableText value={content.ctaSection.primaryBtnText || "PRENDRE RENDEZ-VOUS"} onSave={makeFieldSaver("ctaSection", "primaryBtnText")} label="Bouton principal" />
                      ) : (content.ctaSection.primaryBtnText || "PRENDRE RENDEZ-VOUS")}
                    </span>
                    <ArrowRight className="hidden sm:inline-block w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={isEditMode ? undefined : () => navigate("/contact")}
                    className="flex-1 sm:flex-initial border border-white/30 hover:border-white bg-transparent text-white font-bold text-[10px] sm:text-xs uppercase tracking-tight sm:tracking-wider py-3 px-3 sm:py-4 sm:px-8 rounded-full transition-all duration-300 inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap min-w-0"
                  >
                    <span>
                      {isEditMode ? (
                        <EditableText value={content.ctaSection.secondaryBtnText || "NOUS CONTACTER"} onSave={makeFieldSaver("ctaSection", "secondaryBtnText")} label="Bouton secondaire" />
                      ) : (content.ctaSection.secondaryBtnText || "NOUS CONTACTER")}
                    </span>
                  </button>
                </div>

              </div>

              {/* DROITE : ANIMATION DE CERCLES CONCENTRIQUES & ICÔNES EN ORBITE */}
              <div className="lg:col-span-6 flex justify-center items-center relative min-h-[340px] sm:min-h-[400px]">
                
                {/* LOGO NFL AU CENTRE AVEC PULSATION */}
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center p-3.5 z-20 relative"
                >
                  <img 
                    src="/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png" 
                    alt="NFL Logo Center" 
                    className="w-full h-full object-contain" 
                  />
                </motion.div>

                {/* ANNEAU D'ORBITE 1 (PETIT - ROTATION HORAIRE) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                  className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full border border-dashed border-white/25 pointer-events-none"
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#201611] border border-white/20 shadow-lg flex items-center justify-center text-[#e3bd51] pointer-events-auto hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-[#e3bd51]" />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#e3bd51] text-[#100906] font-bold text-xs flex items-center justify-center pointer-events-auto hover:scale-110 transition-transform shadow-lg">
                    <Crown className="w-5 h-5 text-[#100906]" />
                  </div>
                </motion.div>

                {/* ANNEAU D'ORBITE 2 (MOYEN - ROTATION ANTI-HORAIRE) */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
                  className="absolute w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full border border-dashed border-white/20 pointer-events-none"
                >
                  <div className="absolute top-1/2 -right-5 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#201611] border border-white/20 shadow-lg flex items-center justify-center text-[#e3bd51] pointer-events-auto hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5 text-[#e3bd51]" />
                  </div>
                  <div className="absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#201611] border border-white/20 shadow-lg flex items-center justify-center text-[#e3bd51] pointer-events-auto hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5 text-[#e3bd51]" />
                  </div>
                </motion.div>

                {/* ANNEAU D'ORBITE 3 (GRAND - ROTATION DOUCE HORAIRE) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                  className="absolute w-[370px] h-[370px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-white/15 pointer-events-none hidden sm:block"
                >
                  <div className="absolute -top-5 left-1/4 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#201611] border border-white/20 shadow-lg flex items-center justify-center text-[#e3bd51] pointer-events-auto hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-[#e3bd51]" />
                  </div>
                  <div className="absolute -bottom-5 right-1/4 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#201611] border border-white/20 shadow-lg flex items-center justify-center text-[#e3bd51] pointer-events-auto hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-[#e3bd51]" />
                  </div>
                </motion.div>

              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. NOTRE HISTOIRE - C'EST QUOI NFL ? (AVEC SLIDER VERTICAL INFINI À DROITE) */}
      <section className="section-y bg-[#fdfbf7] border-t border-black/5 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* COLONNE GAUCHE : TEXTE CENTRÉ ET ÉLÉGANT */}
            <motion.div
              className="lg:col-span-7 space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
            >
              <div>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#100906] mb-2">
                  <EditableText value={content.about.title || "C'est quoi NFL?"} onSave={makeFieldSaver("about", "title")} label="Titre" />
                </h2>
                <p className="text-base sm:text-lg text-[#8c591a] font-semibold mb-4">
                  <EditableText value={content.about.subtitle || "Une vision née de l'exigence"} onSave={makeFieldSaver("about", "subtitle")} label="Sous-titre" />
                </p>
              </div>

              <p className="text-[#555] text-base sm:text-lg leading-relaxed font-normal">
                <EditableText value={content.about.paragraph || ""} onSave={makeFieldSaver("about", "paragraph")} label="Paragraphe" multiline as="div" />
              </p>

              {/* VALEURS ET ENGAGEMENTS */}
              <div className="pt-2 border-t border-black/5">
                <p className="text-[#100906] text-xs font-bold uppercase tracking-wider mb-3">
                  <EditableText value={content.about.valuesIntro || "Notre approche repose sur trois principes :"} onSave={makeFieldSaver("about", "valuesIntro")} label="Intro des valeurs" />
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {(content.about.values || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative flex items-center gap-2 text-[#100906] font-semibold text-xs uppercase tracking-wider bg-white rounded-full px-4 py-2 shadow-sm border border-black/10"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8c591a] shrink-0" />
                      <span>
                        <EditableText value={item} onSave={makeStringListItemSaver("about", "values", idx)} label="Valeur" />
                      </span>
                      {isEditMode && (content.about.values || []).length > 1 && (
                        <button onClick={() => removeStringListItem("about", "values", idx)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
            </motion.div>

            {/* COLONNE DROITE : SLIDER VERTICAL INFINI (EXACTEMENT SELON LE CODE DU CLIENT) */}
            {/* COLONNE DROITE : SLIDER VERTICAL INFINI (DÉFILEMENT LIBRE SANS BOÎTE CONTENEUR) */}
            <motion.div
              className="lg:col-span-5 flex justify-center"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ZONE DE DÉFILEMENT LIBRE */}
              <div className="flex h-[360px] sm:h-[400px] space-x-4 sm:space-x-5 justify-center relative overflow-hidden w-full max-w-[320px] sm:max-w-[350px]">
                {/* DÉGRADÉS HAUT ET BAS POUR EFFET DE FONDU TRANSPARENT ET FLUIDE */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#fdfbf7] via-[#fdfbf7]/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/80 to-transparent z-10 pointer-events-none" />

                {/* COLONNE SLIDER 1 (DESCENDANTE) */}
                <InfiniteSlider direction="vertical" duration={18}>
                  <img
                    src={heroImage1}
                    alt="NFL Séminaire 1"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={nflImg1}
                    alt="NFL Formation 1"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={nflImg5}
                    alt="NFL Événement"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={louisePhoto}
                    alt="Louise Ongoum"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={nflImg3}
                    alt="Atelier NFL"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={nflTourisme}
                    alt="Tourisme NFL"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                </InfiniteSlider>

                {/* COLONNE SLIDER 2 (MONTANTE / INVERSE) */}
                <InfiniteSlider direction="vertical" reverse duration={21}>
                  <img
                    src={louisePhotoFull}
                    alt="Louise Ongoum portrait"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={nflImg2}
                    alt="Conférence NFL"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={nflImg6}
                    alt="Formation NFL"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={heroImage1}
                    alt="Masterclass"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={nflImg1}
                    alt="Accompagnement NFL"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                  <img
                    src={nflImg5}
                    alt="Séminaire d'élite"
                    className="aspect-square w-[120px] sm:w-[130px] rounded-[1.25rem] object-cover shadow-md hover:scale-105 transition-transform duration-300 border border-black/5"
                  />
                </InfiniteSlider>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 8. FAQ - DESIGN INSPIRÉ DE LA SECONDE MAQUETTE RÉFÉRENCE */}
      <section id="faq" className="section-y bg-[#fcfbfa] border-t border-black/5 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* GAUCHE : TITRE + CARTE DE CONTACT SUPPORT (STYLE MAQUETTE 2) */}
            <motion.div
              className="lg:col-span-5 space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
            >
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8c591a] mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                  FAQs
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#100906]">
                  Foire aux questions
                </h2>
              </div>

              {/* CARTE BOOK CALL / CONTACT DIRECT (STYLE MAQUETTE 2) */}
              <div className="bg-white rounded-[2.2rem] p-7 sm:p-8 border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative overflow-hidden">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4af37] mb-5 shadow-md">
                  <img src={louisePhoto} alt="Louise Ongoum" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-sans text-xl sm:text-2xl font-bold text-[#100906] mb-2">
                  Une question spécifique ?
                </h3>
                <p className="text-[#666] text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                  Échangez directement avec notre équipe pour discuter de vos besoins en formation ou accompagnement.
                </p>
                <Link
                  to="/contact"
                  className="block w-full text-center bg-[#100906] hover:bg-[#8c591a] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-colors shadow-sm"
                >
                  Prendre Rendez-vous
                </Link>
              </div>
            </motion.div>

            {/* DROITE : ACCORDÉON PILLULES (STYLE MAQUETTE 2) */}
            <motion.div
              className="lg:col-span-7"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
            >
              <Accordion type="single" collapsible className="w-full space-y-3.5">
                {[
                  { q: "Quels types de formations proposez-vous ?", a: "Nous proposons des masterclass intensives (publiques), des séminaires d'entreprise intra et inter, ainsi que des formations privées sur-mesure axées sur le leadership, le management et le closing commercial." },
                  { q: "Comment puis-je réserver ma place pour un événement ?", a: "Vous pouvez réserver directement en ligne via la section 'Prochaines dates' de notre site. Une fois le paiement validé, vous recevrez votre billet sécurisé par email avec un QR code." },
                  { q: "Avez-vous des programmes d'accompagnement spécifiques pour les cadres dirigeants ?", a: "Tout à fait. LOUISE AUDYLL Ongoum accompagne personnellement des cadres dirigeants en One-to-One pour débloquer leur potentiel de leadership et affiner leur vision stratégique." },
                  { q: "Intervenez-vous en dehors du Gabon ?", a: "Oui, nous pouvons concevoir et délivrer des formations dans toute l'Afrique francophone et à l'international, selon la demande des entreprises." },
                  { q: "Quels sont les modes de paiement acceptés pour vos formations ?", a: "Pour les séminaires publics, vous pouvez payer via Mobile Money (Airtel Money, Moov Africa) ou par carte bancaire. Pour les formations privées en entreprise, un virement bancaire classique est mis en place." },
                ].map((item, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="bg-white border border-black/10 rounded-[1.5rem] px-6 shadow-sm data-[state=open]:shadow-md data-[state=open]:border-[#d4af37]/50 transition-all duration-300 overflow-hidden">
                    <AccordionTrigger className="text-base sm:text-lg font-bold text-[#100906] hover:text-[#8c591a] hover:no-underline py-5 text-left">
                      <span>{item.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-[#555] text-sm sm:text-base leading-relaxed pb-6 pt-1 font-normal">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

          </div>
        </div>
      </section>

      {/* PARTENAIRES & SPONSORS — logos gérés depuis l'éditeur visuel */}
      <section className="py-10 bg-[#100906] border-t border-[#d4af37]/15 overflow-hidden relative">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#e3bd51] mb-6">
          Ils nous font confiance
        </p>
        {isEditMode ? (
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-white/60 text-lvl-footer mb-5 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 w-fit">
              <Info className="w-3.5 h-3.5 text-[#e3bd51] shrink-0" />
              Logos partenaires &amp; sponsors, affichés en boucle sur l'accueil et le catalogue formations.
            </div>
            <div className="flex flex-wrap gap-4">
              {content.partners.map((p, idx) => (
                <div key={idx} className="group relative w-40 h-24 bg-white border border-black/10 rounded-xl flex flex-col items-center justify-center gap-2 p-3">
                  {content.partners.length > 1 && (
                    <RemoveItemButton onClick={() => removeListItem("partners", idx)} label="Retirer ce partenaire" />
                  )}
                  <EditableImage
                    src={p.logo_url || ""}
                    alt={p.name || "Logo partenaire"}
                    className="max-w-full max-h-12 object-contain"
                    wrapperClassName={cn(
                      "w-full h-12 flex items-center justify-center",
                      !p.logo_url && "border border-dashed border-black/15 rounded"
                    )}
                    onSave={(url) => makeArrayItemFieldSaver("partners", idx, "logo_url")(url)}
                  />
                  <span className="text-ink/60 text-lvl-footer font-semibold text-center w-full truncate">
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
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#100906] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#100906] to-transparent z-10 pointer-events-none" />

            <div className="flex gap-8 sm:gap-12 w-max py-1 animate-marquee items-center">
              {Array.from({ length: 3 }).map((_, outerIdx) => (
                <div key={outerIdx} className="flex gap-8 sm:gap-12 items-center shrink-0">
                  {content.partners.map((p, idx) =>
                    p.logo_url ? (
                      <img
                        key={idx}
                        src={p.logo_url}
                        alt={p.name || "Partenaire NFL Courtier & Service"}
                        className="h-16 sm:h-20 w-auto max-w-[180px] sm:max-w-[240px] object-contain opacity-90 hover:opacity-100 hover:scale-105 transition-all shrink-0"
                      />
                    ) : (
                      <span
                        key={idx}
                        className="text-white/40 hover:text-white/80 transition-colors text-lvl-subtitle tracking-[0.2em] uppercase font-bold shrink-0 whitespace-nowrap"
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
