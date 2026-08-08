import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Layers, BarChart3, Award, Lock,
  Building2, Utensils, Smartphone, Headset, Loader2, UserCheck, Users2,
  FileText, Sparkles, TrendingUp, Briefcase, Scale, Globe, Quote, Download, Images, X as XIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormationsAPI, TestimonialsAPI, type Formation, type Testimonial } from "@/lib/api";

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

  // Formulaire d'inscription
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nbPlaces, setNbPlaces] = useState("1 Place");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gallery = formation?.gallery || [];

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
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#e3bd51]" />
      </div>
    );
  }

  if (isError || !formation) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex flex-col text-white">
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

  // Split title for gold accent styling
  const titleParts = formation.title ? formation.title.split(" ") : ["Masterclass", "en", "Ingénierie", "Financière"];
  const titleMain = titleParts.length > 2 ? titleParts.slice(0, -2).join(" ") : titleParts[0] || "Masterclass";
  const titleAccent = titleParts.length > 2 ? titleParts.slice(-2).join(" ") : titleParts.slice(1).join(" ") || "Ingénierie Financière";

  const priceLabel = formation.price
    ? `${formation.price.toLocaleString()} ${formation.currency || "XAF"}`
    : null;

  // Piliers de programme dynamiques ou de repli scrupuleux
  const defaultPillars = [
    {
      code: "01 / ANALYSE",
      icon: BarChart3,
      title: "Ingénierie de Marché",
      description: "Décryptage des flux de capitaux mondiaux et modélisation de volatilité avancée."
    },
    {
      code: "02 / GESTION",
      icon: TrendingUp,
      title: "Stratégie d'Actifs",
      description: "Optimisation de portefeuilles institutionnels sous contraintes de risque dynamique."
    },
    {
      code: "03 / NÉGOCIATION",
      icon: Briefcase,
      title: "Closing de Prestige",
      description: "L'art de la négociation de haut niveau et protocoles de finalisation d'accords."
    },
    {
      code: "04 / GAINS",
      icon: Scale,
      title: "Ingénierie Fiscale",
      description: "Cadre réglementaire international et optimisation des structures de financement."
    }
  ];

  const programPillars = (formation.program && formation.program.length > 0)
    ? formation.program.map((item: any, idx: number) => ({
        code: `0${idx + 1} / ${item.category || "MODULE"}`,
        icon: [BarChart3, TrendingUp, Briefcase, Scale][idx % 4],
        title: item.title || item.name || `Module ${idx + 1}`,
        description: item.description || "Contenu stratégique approfondi."
      }))
    : defaultPillars;

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex flex-col text-white font-sans selection:bg-[#e3bd51] selection:text-black">
      <Helmet>
        <title>{formation.title} | NFL Courtier & Service</title>
        <meta name="description" content={formation.description || `Masterclass d'Excellence : ${formation.title} dispensée par NFL Courtier & Service.`} />
      </Helmet>
      
      <Navbar />

      {/* 1. HERO SECTION (image de la formation en arrière-plan + dégradé noir) */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-[#0a0b0d] overflow-hidden border-b border-white/10">
        {formation.image_url && (
          <>
            <img
              src={formation.image_url}
              alt={formation.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-[#0a0b0d]/85 to-[#0a0b0d]/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0d]/70 via-transparent to-transparent" />
          </>
        )}
        {/* Diamond Geometric Wireframe Overlay */}
        <div className="absolute top-16 right-8 md:right-24 w-64 h-64 md:w-96 md:h-96 border border-white/10 rotate-45 pointer-events-none hidden sm:block opacity-40" />
        <div className="absolute top-24 right-16 md:right-32 w-48 h-48 md:w-72 md:h-72 border border-[#e3bd51]/20 rotate-45 pointer-events-none hidden sm:block opacity-30" />

        <div className="relative z-10 container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              to="/catalogue-formations"
              className="inline-flex items-center gap-2 text-white/60 hover:text-[#e3bd51] font-bold text-lvl-footer uppercase tracking-widest transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-[#e3bd51]" /> RETOUR AU CATALOGUE FORMATION
            </Link>
          </div>

          <div className="max-w-3xl mx-auto lg:mx-0 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Top Eyebrow Badge */}
            <div className="flex items-center justify-center lg:justify-start gap-3 text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.25em]">
              <span className="w-8 h-[1px] bg-[#e3bd51] inline-block" />
              <span>{formation.badge || "EXCELLENCE ACADÉMIQUE"}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-lvl-hero leading-[1.15]">
              <span className="block text-white">{titleMain}</span>
              <span className="inline-block italic text-[#e3bd51] relative pb-2 mt-1">
                {titleAccent}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#e3bd51] via-[#c29c38] to-transparent" />
              </span>
            </h1>

            {/* Metadata Cards Row (Niveau, Durée, Certification) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-2 w-full max-w-xl">
              <div className="min-w-0 bg-white/[0.03] border border-white/15 p-2.5 sm:p-5 rounded-none">
                <span className="text-white/40 text-lvl-footer font-bold uppercase tracking-widest block mb-1 truncate">NIVEAU</span>
                <span className="text-white font-bold text-lvl-body sm:text-lvl-subtitle break-words">{formation.level || "Expert"}</span>
              </div>
              <div className="min-w-0 bg-white/[0.03] border border-white/15 p-2.5 sm:p-5 rounded-none">
                <span className="text-white/40 text-lvl-footer font-bold uppercase tracking-widest block mb-1 truncate">DURÉE</span>
                <span className="text-white font-bold text-lvl-body sm:text-lvl-subtitle break-words">{formation.duration || "3 Jours"}</span>
              </div>
              <div className="min-w-0 bg-white/[0.03] border border-white/15 p-2.5 sm:p-5 rounded-none">
                <span className="text-white/40 text-lvl-footer font-bold uppercase tracking-widest block mb-1 truncate">CERTIF.</span>
                <span className="text-[#e3bd51] font-bold text-lvl-body sm:text-lvl-subtitle break-words">{formation.certification || "NFL Élite"}</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-lvl-footer uppercase tracking-widest py-4 px-9 rounded-none transition-all flex items-center gap-3 shadow-xl hover:shadow-[#e3bd51]/20 active:scale-95"
              >
                S'INSCRIRE <ArrowRight className="w-4 h-4" />
              </button>
              {priceLabel && (
                <span className="text-white/60 text-lvl-body font-semibold">{priceLabel}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION HIGHLIGHT / STANDARDS */}
      <section className="section-y bg-[#0a0b0d] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left Title */}
            <div className="lg:col-span-5 text-center lg:text-left">
              <h2 className="text-lvl-title leading-snug">
                <span className="block text-white">Redéfinir les</span>
                <span className="block text-white">standards de la</span>
                <span className="inline-block italic text-[#e3bd51] relative pb-1 mt-1">
                  haute finance.
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#e3bd51]" />
                </span>
              </h2>
            </div>

            {/* Right Paragraph & Key Badges */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
              <p className="text-white/80 text-lvl-body font-light">
                {formation.description ||
                  "Cette Masterclass immersive est conçue pour l'élite financière. Elle transcende la théorie conventionnelle pour explorer les mécanismes complexes des marchés mondiaux et les stratégies de structuration de capital les plus sophistiquées."}
              </p>

              <p className="text-white/60 text-lvl-body font-light">
                Notre objectif est de forger des leaders capables de naviguer dans l'incertitude avec une précision chirurgicale, en maîtrisant les outils de l'ingénierie moderne au service de la performance durable.
              </p>

              {/* Highlights List */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4 border-t border-white/10 w-full">
                <div className="flex items-center gap-3 text-lvl-footer font-bold uppercase tracking-wider text-white">
                  <div className="w-7 h-7 rounded-full bg-[#e3bd51]/10 border border-[#e3bd51]/40 flex items-center justify-center text-[#e3bd51]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>PRATIQUE INTENSIVE</span>
                </div>
                <div className="flex items-center gap-3 text-lvl-footer font-bold uppercase tracking-wider text-white">
                  <div className="w-7 h-7 rounded-full bg-[#e3bd51]/10 border border-[#e3bd51]/40 flex items-center justify-center text-[#e3bd51]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>RÉSULTATS MESURABLES</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURE PÉDAGOGIQUE (4 Piliers Fondamentaux) */}
      <section className="section-y bg-[#07080a] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Centered Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 space-y-3">
            <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.25em] block">
              ARCHITECTURE PÉDAGOGIQUE
            </span>
            <h2 className="text-lvl-title text-white leading-tight">
              Un Programme Structuré en 4 <br />
              <span className="italic text-white/90">Piliers Fondamentaux</span>
            </h2>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programPillars.slice(0, 4).map((pillar: any, idx: number) => {
              const IconComp = pillar.icon || BarChart3;
              return (
                <div
                  key={idx}
                  className="bg-[#121418] border border-white/10 p-7 rounded-none flex flex-col justify-between space-y-5 hover:border-[#e3bd51]/50 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <span className="text-white/35 text-lvl-footer font-bold tracking-[0.2em] uppercase block">
                      {pillar.code}
                    </span>

                    <div className="w-10 h-10 rounded-full bg-[#e3bd51]/10 border border-[#e3bd51]/30 flex items-center justify-center text-[#e3bd51] group-hover:bg-[#e3bd51] group-hover:text-black transition-colors">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <h3 className="text-lvl-subtitle text-white group-hover:text-[#e3bd51] transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-white/60 text-lvl-footer font-light">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. QUOTE & EXPERTISE SECTION */}
      <section className="section-y bg-[#0a0b0d] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Quote */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-[#e3bd51] text-lvl-title">
                "
              </div>

              <blockquote className="italic text-lvl-title text-white/95 leading-snug">
                "L'excellence n'est pas un acte, c'est une habitude. En finance, c'est la différence entre le hasard et la maîtrise."
              </blockquote>

              <div className="pt-2">
                <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-wider block">
                  DIRECTRICE DU PROGRAMME
                </span>
                <span className="text-white/50 text-lvl-footer block mt-0.5">
                  Senior Investment Strategist, NFL Courtier
                </span>
              </div>
            </div>

            {/* Right Expertise Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#14161b] border border-white/10 p-8 sm:p-10 rounded-none space-y-6 shadow-2xl">
                <h3 className="text-[#e3bd51] text-lvl-footer font-bold tracking-[0.2em] uppercase border-b border-white/10 pb-4">
                  EXPERTISE & PARCOURS
                </h3>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <span className="text-[#e3bd51] font-bold text-lvl-body shrink-0">01</span>
                    <p className="text-white/80 text-lvl-footer font-light">
                      Plus de 15 ans d'expérience dans les banques d'affaires internationales à Londres et Singapour.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="text-[#e3bd51] font-bold text-lvl-body shrink-0">02</span>
                    <p className="text-white/80 text-lvl-footer font-light">
                      Architecte de la structuration de dettes complexes pour des projets d'infrastructure majeurs.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="text-[#e3bd51] font-bold text-lvl-body shrink-0">03</span>
                    <p className="text-white/80 text-lvl-footer font-light">
                      Membre du Cercle d'Excellence Financière et conseillère stratégique auprès de fonds souverains.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALERIE PHOTOS (cohortes précédentes, alimentée depuis l'admin) */}
      {gallery.length > 0 && (
        <section className="section-y bg-[#07080a] border-b border-white/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <Images className="w-5 h-5 text-[#e3bd51]" />
              <h2 className="text-white text-xl md:text-2xl font-bold">Galerie photos</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                >
                  <img
                    src={src}
                    alt={`${formation?.title || "Formation"} — photo ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {lightboxIndex !== null && (
            <div
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
              onClick={() => setLightboxIndex(null)}
            >
              <button
                className="absolute top-5 right-5 text-white/70 hover:text-white"
                onClick={() => setLightboxIndex(null)}
                aria-label="Fermer"
              >
                <XIcon className="w-7 h-7" />
              </button>
              <img
                src={gallery[lightboxIndex]}
                alt={`${formation?.title || "Formation"} — photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </section>
      )}

      {/* 6. BOOKING FORM SECTION */}
      <section id="booking-form" className="section-y bg-[#e8e6e2] text-[#1c1c1c]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-lvl-title text-[#1c1c1c] leading-tight mb-4">
                  Inscrivez-vous
                </h2>
                <p className="text-[#555] text-lvl-body font-light">
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
                    {priceLabel || "Sur devis / Inscription sur-mesure"}
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
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-black/70">
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
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-black/70">
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
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-black/70">
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
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-black/70">
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
