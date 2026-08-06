import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Download, CheckCircle2, Loader2, GraduationCap } from "lucide-react";
import { FormationsAPI, HomeContentAPI, SiteSettingsAPI, type Formation, type HomeContent } from "@/lib/api";
import { useIsEditMode } from "@/lib/EditModeContext";
import { EditableText } from "@/components/admin/editable/EditableText";
import { EditableImage } from "@/components/admin/editable/EditableImage";
import { generateFormationsCatalogPdf } from "@/lib/formationsPdf";
import { useToast } from "@/hooks/use-toast";

import nflImg5 from "@/assets/nfl img 5.jpeg";

type FormationsPageContent = Required<NonNullable<HomeContent["formationsPage"]>>;

const DEFAULT_FORMATIONS_PAGE_CONTENT: FormationsPageContent = {
  hero: {
    eyebrow: "ACADÉMIE D'ÉLITE",
    title: "Maîtrisez l'Art de l'Excellence.",
    description: "NFL Courtier & Service propose des formations de haut niveau destinées aux professionnels exigeants. Transformez votre approche et élevez vos standards de performance.",
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
    <div className="min-h-screen bg-[#0d0e11] flex flex-col text-white">
      <Helmet>
        <title>Catalogue Formations | NFL Courtier & Service</title>
        <meta name="description" content="Découvrez nos modules de formation de haut niveau destinées aux professionnels exigeants." />
      </Helmet>
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="pt-24 pb-14 md:pt-28 md:pb-16 bg-[#0d0e11] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.25em] block">
                <EditableText value={content.hero.eyebrow || ""} onSave={makeHeroFieldSaver("eyebrow")} label="Eyebrow" />
              </span>
              <h1 className="text-lvl-hero text-white leading-tight">
                <EditableText value={content.hero.title || ""} onSave={makeHeroFieldSaver("title")} label="Titre" multiline />
              </h1>
              <p className="text-white/70 text-lvl-body max-w-xl font-light">
                <EditableText value={content.hero.description || ""} onSave={makeHeroFieldSaver("description")} label="Description" multiline as="div" />
              </p>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-none border border-white/10 overflow-hidden shadow-2xl">
                <EditableImage
                  src={content.hero.image || nflImg5}
                  alt="Formation exécutive NFL Courtier"
                  className="w-full h-72 sm:h-96 object-cover filter brightness-90 contrast-110"
                  wrapperClassName="w-full h-72 sm:h-96"
                  onSave={(url) => saveFormationsPageSection({ hero: { ...content.hero, image: url } })}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NOS MODULES DE FORMATION */}
      <section className="section-y bg-[#e8e6e2] text-[#1c1c1c]">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-lvl-title text-[#1c1c1c] mb-3">
                Nos Modules de Formation
              </h2>
              <p className="text-[#555] text-lvl-body font-medium max-w-xl">
                Découvrez nos parcours exclusifs conçus pour forger les leaders de demain dans le secteur du luxe et de la finance.
              </p>
            </div>
            <button
              onClick={handleDownloadCatalog}
              disabled={isGeneratingPdf || formations.length === 0}
              className="bg-[#e3bd51] hover:bg-[#d4af37] disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-lvl-footer uppercase tracking-wider px-6 py-3.5 rounded-none flex items-center justify-center gap-2 transition-colors shadow-md shrink-0 w-fit"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> GÉNÉRATION...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> TÉLÉCHARGER PDF
                </>
              )}
            </button>
          </div>

          {/* Grid of Module Cards */}
          {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#e3bd51]" /></div>
          ) : formations.length === 0 ? (
            <div className="text-center py-24 text-[#666] flex flex-col items-center gap-3">
              <GraduationCap className="w-10 h-10 text-[#e3bd51]/50" />
              Aucune formation disponible pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {formations.map((m) => (
                <div key={m.id} className="bg-white border border-black/10 rounded-none overflow-hidden flex flex-col justify-between shadow-md group">
                  <div>
                    <Link
                      to={`/formation/${m.slug || m.id}`}
                      onClick={isEditMode ? (e) => e.preventDefault() : undefined}
                      className="relative h-56 overflow-hidden bg-black/5 block group/img"
                    >
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt={m.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/5">
                          <GraduationCap className="w-10 h-10 text-[#e3bd51]/50" />
                        </div>
                      )}
                      {m.badge && (
                        <div className="absolute top-3 left-3 bg-[#e3bd51] text-black text-lvl-footer font-bold uppercase tracking-wider px-3 py-1 rounded-none shadow-sm z-10">
                          {m.badge}
                        </div>
                      )}
                    </Link>

                    <div className="p-6 space-y-3">
                      <h3 className="text-lvl-subtitle text-[#1c1c1c] leading-snug">
                        {m.title}
                      </h3>
                      <p className="text-[#666] text-lvl-footer line-clamp-3">
                        {m.description}
                      </p>

                      {(m.bullets || []).length > 0 && (
                        <div className="pt-3 border-t border-black/5 space-y-2">
                          {(m.bullets || []).map((b, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2 text-lvl-footer font-semibold text-[#333]">
                              <div className="w-1.5 h-1.5 bg-[#e3bd51] rounded-full shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      to={`/formation/${m.slug || m.id}`}
                      onClick={isEditMode ? (e) => e.preventDefault() : undefined}
                      className="block text-center border border-black/20 bg-white hover:bg-black hover:text-white text-black font-bold text-lvl-footer uppercase tracking-widest py-3 rounded-none transition-colors"
                    >
                      VOIR LE DÉTAIL &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. PARTNERS LOGO TICKER — logos gérés depuis l'éditeur visuel (onglet Accueil) */}
      <section className="py-8 bg-[#dedcd7] text-black/70 border-t border-b border-black/10 overflow-hidden">
        <div className="flex gap-8 sm:gap-12 items-center animate-marquee w-max">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-8 sm:gap-12 items-center shrink-0">
              {partnersList.map((p, idx) =>
                p.logo_url ? (
                  <img
                    key={idx}
                    src={p.logo_url}
                    alt={p.name || "Partenaire NFL Courtier & Service"}
                    className="h-16 sm:h-20 w-auto max-w-[180px] sm:max-w-[240px] object-contain opacity-90 hover:opacity-100 transition-all shrink-0"
                  />
                ) : (
                  <span key={idx} className="font-bold text-lvl-body tracking-widest text-black/40 hover:text-black/70 uppercase shrink-0 whitespace-nowrap transition-colors">
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
