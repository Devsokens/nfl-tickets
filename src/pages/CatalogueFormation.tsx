import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, Download, CheckCircle2, Loader2, GraduationCap, Sparkles, Award } from "lucide-react";
import { FormationsAPI, HomeContentAPI, SiteSettingsAPI, type Formation, type HomeContent } from "@/lib/api";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import { generateFormationsCatalogPdf } from "@/lib/formationsPdf";
import { useToast } from "@/hooks/use-toast";
import FormationStackCards from "@/components/FormationStackCards";
import HighlightFormationCard from "@/components/HighlightFormationCard";

type FormationsPageContent = Required<NonNullable<HomeContent["formationsPage"]>>;

const DEFAULT_FORMATIONS_PAGE_CONTENT: FormationsPageContent = {
  hero: {
    eyebrow: "ACADÉMIE D'ÉLITE & FORMATION PROFESSIONNELLE",
    title: "Maîtrisez l'Art de l'Excellence.",
    description: "NFL Courtier & Service conçoit des parcours de formation certifiants de très haut niveau, alliant rigueur académique et immersion opérationnelle pour propulser vos standards de performance.",
    image: "",
  },
};

const CatalogueFormation = () => {
  const navigate = useNavigate();
  const isEditMode = useIsEditMode();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { data: formations = [], isLoading } = useQuery<Formation[]>({
    queryKey: ["formations"],
    queryFn: () => FormationsAPI.getAll(false),
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: SiteSettingsAPI.get,
  });

  const handleDownloadCatalog = async () => {
    if (isGeneratingPdf || formations.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      await generateFormationsCatalogPdf(formations, siteSettings);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le catalogue PDF pour le moment.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleScrollToFormations = () => {
    const el = document.getElementById("formations-catalogue");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { data: homeContentRaw } = useQuery<HomeContent>({
    queryKey: ["homeContent"],
    queryFn: HomeContentAPI.get,
  });
  const merged: FormationsPageContent = {
    hero: { ...DEFAULT_FORMATIONS_PAGE_CONTENT.hero, ...homeContentRaw?.formationsPage?.hero },
  };
  const [override, setOverride] = useState<FormationsPageContent | null>(null);
  useEffect(() => setOverride(null), [homeContentRaw]);
  const content = override || merged;

  // Logos partenaires & sponsors : gérés une seule fois depuis l'éditeur
  // visuel (onglet Accueil), partagés ici en lecture seule.
  const partnersList = homeContentRaw?.partners?.length
    ? homeContentRaw.partners
    : [
        { name: "SMAG", logo_url: "" },
        { name: "ODILLON", logo_url: "" },
        { name: "OGOUUE LABS", logo_url: "" },
        { name: "GMT", logo_url: "" },
        { name: "CANAL BOX", logo_url: "" },
        { name: "TRANSFO...", logo_url: "" },
      ];

  const saveFormationsPageSection = async (patch: Partial<FormationsPageContent>) => {
    const next = { ...content, ...patch };
    setOverride(next);
    const updated = await HomeContentAPI.update({ formationsPage: next });
    queryClient.setQueryData(["homeContent"], (prev: HomeContent | undefined) => ({ ...(prev || {}), ...updated }));
  };
  const makeHeroFieldSaver = (fieldKey: string) => async (value: any) => {
    await saveFormationsPageSection({ hero: { ...content.hero, [fieldKey]: value } });
  };

  return (
    <div className="min-h-screen bg-[#100906] flex flex-col text-white">
      <Helmet>
        <title>Catalogue Formations | NFL Courtier & Service</title>
        <meta name="description" content="Découvrez nos modules de formation de haut niveau destinées aux professionnels exigeants." />
      </Helmet>
      <Navbar />

      {/* 1. HERO SECTION — Suite de la Navbar (#100906) avec cartes empilées animées */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 bg-[#100906] border-b border-[#d4af37]/20 overflow-hidden">
        {/* Subtle Ambient Luxury Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-[420px] h-[420px] bg-[#8c591a]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: Animated Stacking Cards (Deck Animation with 6s interval) */}
            <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col items-center lg:items-start">
              <FormationStackCards className="w-full" />
            </div>

            {/* RIGHT COLUMN: Text & 2 Action Buttons */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 sm:space-y-7 text-left">
              {/* Title with font-display (same as other hero sections) */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight">
                <EditableText value={content.hero.title || ""} onSave={makeHeroFieldSaver("title")} label="Titre" multiline />
              </h1>

              {/* Description */}
              <div className="text-white/80 text-sm sm:text-base lg:text-lg max-w-xl font-light leading-relaxed">
                <EditableText value={content.hero.description || ""} onSave={makeHeroFieldSaver("description")} label="Description" multiline as="div" />
              </div>

              {/* 2 ACTION BUTTONS — Style exact des autres herosections */}
              <div className="pt-2 flex flex-row items-center gap-2 sm:gap-4">
                {/* Button 1: Scroll to formations */}
                <button
                  onClick={handleScrollToFormations}
                  className="flex-1 sm:flex-initial bg-gradient-to-r from-[#d4af37] via-[#e3bd51] to-[#d4af37] hover:opacity-95 text-black font-extrabold text-[9px] sm:text-sm uppercase tracking-wider py-2.5 px-3 sm:py-4 sm:px-8 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-1 sm:gap-2 shrink-0 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <span>DÉCOUVRIR LES FORMATIONS</span>
                  <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                </button>

                {/* Button 2: Download PDF catalog */}
                <button
                  onClick={handleDownloadCatalog}
                  disabled={isGeneratingPdf || formations.length === 0}
                  className="flex-1 sm:flex-initial rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white font-semibold text-[9px] sm:text-sm uppercase tracking-wider py-2.5 px-3 sm:py-4 sm:px-8 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1 sm:gap-2 shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-[#d4af37] shrink-0" />
                      <span>GÉNÉRATION...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span>TÉLÉCHARGER LE CATALOGUE</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. NOS MODULES DE FORMATION — STYLE IDENTIQUE AUX ÉVÉNEMENTS */}
      <section id="formations-catalogue" className="py-12 md:py-20 bg-gradient-to-b from-[#fbf5e6] via-[#f7ebd7] to-[#fbf5e6] border-y border-[#d4af37]/25 text-black scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#100906]">
                Nos Modules de Formation
              </h2>
              <p className="text-[#555] text-xs sm:text-base font-medium max-w-xl mt-2">
                Découvrez nos parcours exclusifs conçus pour forger les leaders de demain dans le secteur du management, du luxe et de la finance.
              </p>
            </div>
            <button
              onClick={handleDownloadCatalog}
              disabled={isGeneratingPdf || formations.length === 0}
              className="bg-gradient-to-r from-[#d4af37] via-[#e3bd51] to-[#d4af37] hover:opacity-95 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-6 rounded-full transition-all shadow-md flex items-center justify-center gap-2 shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>GÉNÉRATION...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>TÉLÉCHARGER LE CATALOGUE (PDF)</span>
                </>
              )}
            </button>
          </div>

          {/* Grid of Formation Cards — EXACTEMENT COMME LES ÉVÉNEMENTS (2 sur mobile grid-cols-2, 3 sur desktop) */}
          {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#8c591a]" /></div>
          ) : formations.length === 0 ? (
            <div className="text-center py-24 text-black/50 flex flex-col items-center gap-3 font-medium">
              <GraduationCap className="w-10 h-10 text-[#8c591a]/50" />
              Aucune formation disponible pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {formations.map((m) => (
                <div key={m.id} className="h-full">
                  <HighlightFormationCard formation={m} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. PARTNERS LOGO TICKER — logos gérés depuis l'éditeur visuel (onglet Accueil) */}
      <section className="py-10 bg-[#100906] text-white/70 border-t border-[#d4af37]/15 overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#e3bd51] mb-6">
          Ils nous font confiance
        </p>
        <div className="flex gap-8 sm:gap-12 items-center animate-marquee w-max">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-8 sm:gap-12 items-center shrink-0">
              {partnersList.map((p, idx) =>
                p.logo_url ? (
                  <img
                    key={idx}
                    src={p.logo_url}
                    alt={p.name || "Partenaire NFL Courtier & Service"}
                    className="h-16 sm:h-20 w-auto max-w-[180px] sm:max-w-[240px] object-contain opacity-80 hover:opacity-100 transition-all shrink-0"
                  />
                ) : (
                  <span key={idx} className="font-bold text-lvl-body tracking-widest text-white/40 hover:text-white/80 uppercase shrink-0 whitespace-nowrap transition-colors">
                    {p.name}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CatalogueFormation;
