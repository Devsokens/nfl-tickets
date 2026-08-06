import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Layers, BarChart3, Award, Lock,
  Building2, Utensils, Smartphone, Headset, Loader2, UserCheck, Users2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormationsAPI, TestimonialsAPI, type Formation, type Testimonial } from "@/lib/api";

const PILLAR_ICONS = [Layers, BarChart3, Award, Lock];

// Fait défiler un carrousel horizontal snap vers l'item `index` et notifie `onIndexChange`.
function scrollCarouselTo(container: HTMLDivElement | null, index: number) {
  if (!container) return;
  const scrollAmount = container.clientWidth * 0.85;
  container.scrollTo({ left: index * scrollAmount, behavior: "smooth" });
}

const FormationDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: formation, isLoading, isError } = useQuery<Formation>({
    queryKey: ["formation", id],
    queryFn: () => FormationsAPI.getOne(id!),
    enabled: !!id,
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => TestimonialsAPI.getAll(false),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Carrousel témoignages
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveTestimonialIndex((prev) => {
        const nextIndex = (prev + 1) % testimonials.length;
        scrollCarouselTo(testimonialsRef.current, nextIndex);
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleTestimonialsScroll = () => {
    if (!testimonialsRef.current || testimonials.length === 0) return;
    const container = testimonialsRef.current;
    const scrollAmount = container.clientWidth * 0.85;
    if (scrollAmount > 0) {
      const newIndex = Math.round(container.scrollLeft / scrollAmount);
      setActiveTestimonialIndex(Math.min(testimonials.length - 1, Math.max(0, newIndex)));
    }
  };

  // Formulaire d'inscription
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nbPlaces, setNbPlaces] = useState("1 Place");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs du formulaire.",
      });
      return;
    }

    setIsSubmitting(true);
    toast({
      title: "Demande d'inscription reçue !",
      description: "Redirection vers WhatsApp pour finaliser votre inscription...",
    });

    const message = `Bonjour NFL Courtier & Service,\n\n` +
                    `Je souhaite m'inscrire à la formation *${formation?.title || "Formation"}*.\n\n` +
                    `*Détails du participant :*\n` +
                    `- *Nom complet* : ${fullName}\n` +
                    `- *Email* : ${email}\n` +
                    `- *Nombre de places* : ${nbPlaces}\n` +
                    `- *Téléphone WhatsApp* : ${phone}\n\n` +
                    `Merci de me contacter avec le programme complet et les modalités d'accès.`;

    const whatsappUrl = `https://wa.me/24166692338?text=${encodeURIComponent(message)}`;
    setTimeout(() => {
      window.location.href = whatsappUrl;
      setIsSubmitting(false);
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
          <h1 className="text-lvl-title">Formation introuvable</h1>
          <p className="text-white/60 text-lvl-body max-w-md">Ce module n'existe plus ou a été dépublié.</p>
          <Link to="/catalogue-formations" className="inline-flex items-center gap-2 text-[#e3bd51] font-bold text-lvl-footer uppercase tracking-widest border border-[#e3bd51]/30 hover:border-[#e3bd51] px-5 py-2.5">
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
      <section className="pt-20 pb-14 md:pt-28 md:pb-16 bg-[#0d0e11] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <Link
              to="/catalogue-formations"
              className="inline-flex items-center gap-2 text-[#e3bd51] hover:text-[#d4af37] font-bold text-lvl-footer uppercase tracking-widest transition-all bg-white/5 border border-[#e3bd51]/30 hover:border-[#e3bd51] px-5 py-2.5 rounded-none backdrop-blur-md shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> RETOUR AU CATALOGUE FORMATION
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              {formation.badge && (
                <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.25em] block">
                  {formation.badge}
                </span>
              )}

              <h1 className="text-lvl-hero text-white leading-tight">
                {formation.title}
              </h1>

              {formation.description && (
                <p className="text-white/70 text-lvl-body font-light max-w-xl">
                  {formation.description}
                </p>
              )}

              {bullets.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10 max-w-lg">
                  {bullets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-lvl-footer text-[#e3bd51] font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="uppercase">{b}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-lvl-footer uppercase tracking-widest py-4 px-8 rounded-none transition-colors inline-flex items-center gap-2 shadow-lg"
                >
                  S'INSCRIRE <ArrowRight className="w-4 h-4" />
                </button>
                {priceLabel && <span className="text-white/60 text-lvl-body font-semibold">{priceLabel}</span>}
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

      {/* 2. DESCRIPTION & PROGRAMME (même structure que la page événement) */}
      <section id="programme-section" className="section-y bg-[#090a0c] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-lvl-subtitle text-white leading-tight">
                À propos de cette formation
              </h2>
              {formation.description ? (
                formation.description.split("\n").filter(Boolean).map((para, idx) => (
                  <p key={idx} className="text-white/70 text-lvl-body font-light">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-white/50 text-lvl-body font-light italic">
                  Description à venir.
                </p>
              )}
            </div>

            <div className="lg:col-span-5 w-full">
              <div className="bg-[#14161a] border border-white/10 p-7 sm:p-8 rounded-none space-y-6 w-full shadow-2xl">
                <h3 className="text-lvl-subtitle text-white border-b border-white/10 pb-3">
                  Programme
                </h3>

                {program.length > 0 ? (
                  <div className="space-y-6">
                    {program.map((p: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <span className="text-[#e3bd51] font-bold text-lvl-footer shrink-0 pt-0.5">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="space-y-1">
                          <p className="font-bold text-lvl-footer text-white leading-snug">{p.title || p.name}</p>
                          {p.description && <p className="text-lvl-footer text-white/60">{p.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 text-lvl-footer italic">Programme communiqué prochainement.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POINTS CLÉS DU PROGRAMME */}
      {bullets.length > 0 && (
        <section className="section-y bg-[#0d0e11] border-b border-white/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-[#14161a] border border-white/10 p-8 sm:p-12 rounded-none shadow-2xl">
              <h3 className="text-lvl-footer font-bold uppercase tracking-[0.25em] text-[#e3bd51] mb-8">
                POINTS CLÉS DU PROGRAMME
              </h3>
              <div className="space-y-5">
                {bullets.map((b, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-none bg-[#e3bd51]/20 text-[#e3bd51] font-bold text-lvl-footer flex items-center justify-center shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="text-lvl-body text-white/80 flex items-center gap-2">
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

      {/* 4. TÉMOIGNAGES (issus des témoignages publiés sur le site) */}
      {testimonials.length > 0 && (
        <section className="section-y bg-[#0d0e11] border-b border-white/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
              <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.2em] block">NFL Impact</span>
              <h2 className="text-lvl-title text-white mt-3">Ils en parlent</h2>
            </div>

            <div className="relative">
              <div
                ref={testimonialsRef}
                onScroll={handleTestimonialsScroll}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 md:grid md:grid-cols-3 md:gap-6 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0"
              >
                {testimonials.map((t) => {
                  const initials = t.author_name
                    ? t.author_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                    : "NFL";
                  return (
                    <div key={t.id} className="w-[85vw] max-w-[340px] md:w-auto shrink-0 snap-center bg-[#15171b] border border-white/5 p-7 sm:p-8 rounded-none flex flex-col justify-between shadow-xl">
                      <p className="italic text-white/90 text-lvl-body mb-8">
                        "{t.quote}"
                      </p>
                      <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                        <div className="w-9 h-9 bg-[#e3bd51] text-black font-bold text-lvl-footer flex items-center justify-center rounded-none shrink-0">
                          {initials}
                        </div>
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

              {testimonials.length > 1 && (
                <div className="flex md:hidden justify-center items-center gap-2 mt-4">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Témoignage ${idx + 1}`}
                      onClick={() => {
                        setActiveTestimonialIndex(idx);
                        scrollCarouselTo(testimonialsRef.current, idx);
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        activeTestimonialIndex === idx
                          ? "w-6 h-2.5 bg-[#e3bd51]"
                          : "w-2.5 h-2.5 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. UNE IMMERSION SIGNATURE (offre commune à toutes les formations NFL) */}
      <section className="section-y bg-[#0c0d0f]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center mb-10">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-lvl-title text-white leading-tight">
                Une Immersion<br />
                <span className="italic text-[#e3bd51] font-normal">Signature</span>
              </h2>
              <p className="text-white/60 text-lvl-body font-light">
                Chaque détail a été pensé pour favoriser une concentration absolue et un confort haut de gamme.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#e3bd51] font-bold text-lvl-footer uppercase tracking-wider">
                    <Building2 className="w-4 h-4" /> LIEU PRESTIGIEUX
                  </div>
                  <p className="text-white/60 text-lvl-footer">
                    Lieu en hôtel 5 étoiles / centre VIP privatisé pour des échanges confidentiels.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#e3bd51] font-bold text-lvl-footer uppercase tracking-wider">
                    <Utensils className="w-4 h-4" /> IMMERSION GASTRONOMIQUE
                  </div>
                  <p className="text-white/60 text-lvl-footer">
                    Déjeuners gastronomiques &amp; pause-café networking haut de gamme.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#e3bd51] font-bold text-lvl-footer uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" /> OUTILS DE POINTE
                  </div>
                  <p className="text-white/60 text-lvl-footer">
                    Support de cours sur tablette iPad et accès à la plateforme interactive.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#e3bd51] font-bold text-lvl-footer uppercase tracking-wider">
                    <Headset className="w-4 h-4" /> CONCIERGERIE
                  </div>
                  <p className="text-white/60 text-lvl-footer">
                    Intégration méthodique au Coach NFL. Concierge spécialisé aux moments de votre réservation formation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-lvl-footer uppercase tracking-widest py-4 px-8 rounded-none transition-colors flex items-center gap-2 shadow-xl"
            >
              RÉSERVER MA PLACE{priceLabel ? ` - ${priceLabel}` : ""} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. RÉSERVEZ VOTRE PLACE (BOOKING SECTION — même structure que la page événement) */}
      <section id="booking-form" className="section-y bg-[#e8e6e2] text-[#1c1c1c]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-lvl-title text-[#1c1c1c] leading-tight mb-4">
                  Inscrivez-vous
                </h2>
                <p className="text-[#555] text-lvl-body font-normal">
                  Les places sont limitées pour garantir un accompagnement de qualité supérieure à chaque participant.
                </p>
              </div>

              <div className="bg-white border border-black/10 p-6 rounded-none shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#655410]/10 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-[#655410]" />
                </div>
                <div>
                  <span className="text-[#666] text-lvl-footer font-bold uppercase tracking-wider block">
                    Tarif de la formation
                  </span>
                  <span className="text-lvl-subtitle font-bold text-[#655410]">
                    {priceLabel || "Sur devis"}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-black/10 p-6 rounded-none shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#655410]/10 flex items-center justify-center shrink-0">
                  <Users2 className="w-5 h-5 text-[#655410]" />
                </div>
                <div>
                  <span className="text-[#666] text-lvl-footer font-bold uppercase tracking-wider block">
                    Accompagnement
                  </span>
                  <span className="text-lvl-body font-semibold text-[#1c1c1c]">
                    Individuel & groupes en entreprise
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleBooking} className="bg-white border border-black/10 p-8 sm:p-10 rounded-none space-y-5 shadow-2xl">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-black/60">
                      NOM COMPLET
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex : MOUSSAVOU ALEX"
                      className="w-full bg-[#f4f2ee] border border-black/10 text-lvl-footer text-black px-4 py-3.5 rounded-none placeholder:text-black/30 focus:outline-none focus:border-[#655410]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-black/60">
                      ADRESSE EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="moussavou@gmail.com"
                      className="w-full bg-[#f4f2ee] border border-black/10 text-lvl-footer text-black px-4 py-3.5 rounded-none placeholder:text-black/30 focus:outline-none focus:border-[#655410]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-black/60">
                      NOMBRE DE PLACES
                    </label>
                    <select
                      value={nbPlaces}
                      onChange={(e) => setNbPlaces(e.target.value)}
                      className="w-full bg-[#f4f2ee] border border-black/10 text-lvl-footer text-black px-4 py-3.5 rounded-none focus:outline-none focus:border-[#655410]"
                    >
                      <option value="1 Place">1 Place</option>
                      <option value="2 Places">2 Places</option>
                      <option value="3 Places">3 Places</option>
                      <option value="4 Places">4 Places</option>
                      <option value="Groupe entreprise (5+ places)">Groupe entreprise (5+ places)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-black/60">
                      TÉLÉPHONE (WHATSAPP)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+241 00 00 00 00"
                      className="w-full bg-[#f4f2ee] border border-black/10 text-lvl-footer text-black px-4 py-3.5 rounded-none placeholder:text-black/30 focus:outline-none focus:border-[#655410]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#655410] hover:bg-[#52440b] text-white font-bold text-lvl-footer uppercase tracking-widest py-4 px-6 rounded-none transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? "TRAITEMENT..." : "CONFIRMER L'INSCRIPTION"} <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-lvl-footer text-black/40 text-center italic mt-3">
                    Notre équipe conciergerie vous contactera sous 24h.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FormationDetail;
