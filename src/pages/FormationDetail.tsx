import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Layers, BarChart3, Award, Lock,
  Building2, Utensils, Smartphone, Headset, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormationsAPI, type Formation } from "@/lib/api";

const PILLAR_ICONS = [Layers, BarChart3, Award, Lock];

const FormationDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: formation, isLoading, isError } = useQuery<Formation>({
    queryKey: ["formation", id],
    queryFn: () => FormationsAPI.getOne(id!),
    enabled: !!id,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRegistration = () => {
    toast({
      title: "Demande d'inscription reçue !",
      description: "Notre équipe conciergerie vous contactera sous 24h.",
    });

    const message = `Bonjour NFL Courtier & Service,\n\n` +
                    `Je souhaite m'inscrire à la formation *${formation?.title || "Formation"}*.\n\n` +
                    `Merci de me contacter avec le programme complet et les modalités d'accès.`;

    const whatsappUrl = `https://wa.me/24166692338?text=${encodeURIComponent(message)}`;
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0e11] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#e3bd51]" />
      </div>
    );
  }

  if (isError || !formation) {
    return (
      <div className="min-h-screen bg-[#0d0e11] flex flex-col text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-32 px-4 text-center">
          <h1 className="font-serif text-3xl font-bold">Formation introuvable</h1>
          <p className="text-white/60 max-w-md">Ce module n'existe plus ou a été dépublié.</p>
          <Link to="/catalogue-formations" className="inline-flex items-center gap-2 text-[#e3bd51] font-bold text-xs uppercase tracking-widest border border-[#e3bd51]/30 hover:border-[#e3bd51] px-5 py-2.5">
            <ArrowLeft className="w-4 h-4" /> Retour au catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const bullets = formation.bullets || [];
  const program = formation.program || [];
  const priceLabel = formation.price
    ? `${formation.price.toLocaleString()} ${formation.currency || "XAF"}`
    : null;

  return (
    <div className="min-h-screen bg-[#0d0e11] flex flex-col text-white">
      <Helmet>
        <title>{formation.title} | NFL Courtier & Service</title>
        <meta name="description" content={formation.description || `Découvrez le programme "${formation.title}" dispensé par NFL Courtier & Service.`} />
      </Helmet>
      <Navbar />

      {/* 1. HERO DETAIL HEADER WITH BACK BUTTON */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-24 bg-[#0d0e11] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Link
              to="/catalogue-formations"
              className="inline-flex items-center gap-2 text-[#e3bd51] hover:text-[#d4af37] font-bold text-xs uppercase tracking-widest transition-all bg-white/5 border border-[#e3bd51]/30 hover:border-[#e3bd51] px-5 py-2.5 rounded-none backdrop-blur-md shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> RETOUR AU CATALOGUE FORMATION
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              {formation.badge && (
                <span className="text-[#e3bd51] text-[10px] font-bold uppercase tracking-[0.25em] block">
                  {formation.badge}
                </span>
              )}

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                {formation.title}
              </h1>

              {formation.description && (
                <p className="text-white/70 text-sm sm:text-base leading-relaxed font-sans font-light max-w-xl">
                  {formation.description}
                </p>
              )}

              {bullets.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10 max-w-lg">
                  {bullets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#e3bd51] font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="uppercase">{b}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={handleRegistration}
                  className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-none transition-colors inline-flex items-center gap-2 shadow-lg"
                >
                  S'INSCRIRE <ArrowRight className="w-4 h-4" />
                </button>
                {priceLabel && <span className="text-white/60 text-sm font-semibold">{priceLabel}</span>}
              </div>
            </div>

            {formation.image_url && (
              <div className="lg:col-span-5">
                <div className="relative rounded-none border border-white/10 overflow-hidden shadow-2xl">
                  <img src={formation.image_url} alt={formation.title} className="w-full h-72 sm:h-96 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. PROGRAMME (si renseigné par l'admin) */}
      {program.length > 0 && (
        <section className="py-20 md:py-28 bg-[#090a0c] border-b border-white/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <span className="text-[#e3bd51] text-[10px] font-bold uppercase tracking-[0.25em] block">
                PROGRAMME
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Un parcours structuré, étape par étape
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {program.map((step: any, idx: number) => {
                const Icon = PILLAR_ICONS[idx % PILLAR_ICONS.length];
                return (
                  <div key={idx} className="bg-[#14161a] border border-white/10 p-7 rounded-none flex flex-col justify-between space-y-6 shadow-xl">
                    <div>
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-4">
                        ÉTAPE {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-[#e3bd51]/10 flex items-center justify-center mb-6">
                        <Icon className="w-5 h-5 text-[#e3bd51]" />
                      </div>
                      <h3 className="font-serif font-bold text-lg text-white mb-2">
                        {step.title || step.name}
                      </h3>
                      {step.description && (
                        <p className="text-white/60 text-xs leading-relaxed font-sans">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. POINTS CLÉS DU PROGRAMME */}
      {bullets.length > 0 && (
        <section className="py-20 bg-[#0d0e11] border-b border-white/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-[#14161a] border border-white/10 p-8 sm:p-12 rounded-none shadow-2xl">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#e3bd51] mb-8">
                POINTS CLÉS DU PROGRAMME
              </h3>
              <div className="space-y-5">
                {bullets.map((b, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-none bg-[#e3bd51]/20 text-[#e3bd51] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-sans">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#e3bd51] shrink-0" />
                      {b}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. UNE IMMERSION SIGNATURE (offre commune à toutes les formations NFL) */}
      <section className="py-20 md:py-28 bg-[#0c0d0f]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center mb-12">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                Une Immersion<br />
                <span className="italic text-[#e3bd51] font-normal">Signature</span>
              </h2>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-sans font-light">
                Chaque détail a été pensé pour favoriser une concentration absolue et un confort haut de gamme.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#e3bd51] font-bold text-xs uppercase tracking-wider">
                    <Building2 className="w-4 h-4" /> LIEU PRESTIGIEUX
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Lieu en hôtel 5 étoiles / centre VIP privatisé pour des échanges confidentiels.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#e3bd51] font-bold text-xs uppercase tracking-wider">
                    <Utensils className="w-4 h-4" /> IMMERSION GASTRONOMIQUE
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Déjeuners gastronomiques &amp; pause-café networking haut de gamme.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#e3bd51] font-bold text-xs uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" /> OUTILS DE POINTE
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Support de cours sur tablette iPad et accès à la plateforme interactive.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#e3bd51] font-bold text-xs uppercase tracking-wider">
                    <Headset className="w-4 h-4" /> CONCIERGERIE
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Intégration méthodique au Coach NFL. Concierge spécialisé aux moments de votre réservation formation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleRegistration}
              className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-none transition-colors flex items-center gap-2 shadow-xl"
            >
              RÉSERVER MA PLACE{priceLabel ? ` - ${priceLabel}` : ""} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FormationDetail;
