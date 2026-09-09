import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import {
  ChevronLeft, ArrowRight, CheckCircle2, Award, Clock, Globe,
  GraduationCap, Loader2, ShieldCheck, Users, BookOpen, Images
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormationsAPI, ContactAPI, type Formation } from "@/lib/api";

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

  // Formulaire d'inscription
  const [selectedFormule, setSelectedFormule] = useState<"individuel" | "corporate">("individuel");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nbPlaces, setNbPlaces] = useState("1 Place");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gallery = formation?.gallery || [];

  const formationPrice = formation?.price ? Number(formation.price) : 0;
  const corporatePrice = formationPrice > 0 ? Math.round(formationPrice * 5.5) : 0;

  // Inclusions standards pour les formations
  const formationIncludes = (formation?.bullets && formation.bullets.length > 0)
    ? formation.bullets
    : [
        "Support pédagogique complet et supports de cours numériques",
        "Ateliers pratiques immersifs et études de cas réels",
        "Accompagnement et feedbacks personnalisés par les experts",
        "Attestation officielle & certification professionnelle NFL",
        "Accès exclusif au réseau des Alumni NFL Courtier",
        "Déjeuners d'affaires & pauses networking VIP",
      ];

  // Programme de formation
  const defaultProgram = [
    { title: "Fondamentaux & Cadre Stratégique", time: "Jour 1", description: "Maîtrise des concepts clés, analyse des enjeux sectoriels et diagnostic initial." },
    { title: "Outils Pratiques & Études de Cas", time: "Jour 2", description: "Mises en situation réelles, simulation et élaboration de stratégies opérationnelles." },
    { title: "Optimisation, Synthèse & Certification", time: "Jour 3", description: "Restitution de projet, évaluation continue des compétences et validation finale." },
  ];

  const program = (formation?.program && formation.program.length > 0)
    ? formation.program.map((p: any, idx: number) => ({
        title: p.title || p.name || `Module ${idx + 1}`,
        time: p.time || p.category || `Module 0${idx + 1}`,
        description: p.description || "Session approfondie et méthodologie pratique.",
      }))
    : defaultProgram;

  const handleBooking = async (e: React.FormEvent) => {
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

    // Trace côté admin (module Demandes)
    ContactAPI.send({
      name: fullName,
      email,
      subject: `Inscription formation : ${formation?.title || "Formation"}`,
      message: `Formule : ${selectedFormule}\nNombre de places : ${nbPlaces}\nTéléphone WhatsApp : ${phone}`,
      type: "formation",
      formation_id: formation?.id,
    }).catch((err) => console.error("Échec de l'enregistrement de la demande formation :", err));

    const message = `Bonjour NFL Courtier & Service,\n\n` +
                    `Je souhaite m'inscrire à la formation *${formation?.title || "Formation"}*.\n\n` +
                    `*Détails du participant :*\n` +
                    `- *Nom complet* : ${fullName}\n` +
                    `- *Email* : ${email}\n` +
                    `- *Formule* : ${selectedFormule === "individuel" ? "Individuel" : "Corporate (Entreprise)"}\n` +
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
      <div className="min-h-screen bg-[#100906] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  if (isError || !formation) {
    return (
      <div className="min-h-screen bg-[#100906] flex flex-col text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-32 px-4 text-center">
          <h1 className="text-3xl font-bold text-white">Formation introuvable</h1>
          <p className="text-white/60 text-base max-w-md">Ce module n'existe plus ou a été dépublié.</p>
          <Link
            to="/catalogue-formations"
            className="inline-flex items-center gap-2 text-black bg-[#d4af37] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Retour au catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#100906] flex flex-col font-sans">
      <Helmet>
        <title>{`${formation.title} | NFL Courtier & Service`}</title>
        <meta name="description" content={formation.description || `Formation d'Excellence : ${formation.title} dispensée par NFL Courtier & Service.`} />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-20">
        
        {/* 1. HERO COVER PHOTO SECTION (IDENTIQUE À EVENT DETAIL) */}
        <section className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] bg-[#100906] overflow-hidden">
          {formation.image_url ? (
            <img
              src={formation.image_url}
              alt={formation.title}
              className="w-full h-full object-cover opacity-85 brightness-90 filter"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] flex items-center justify-center">
              <GraduationCap className="w-20 h-20 text-[#d4af37]/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#100906]/90 via-[#100906]/40 to-black/30" />

          {/* FLOATING BACK BUTTON (<) TOP LEFT */}
          <div className="absolute top-6 left-4 sm:left-8 z-20">
            <Link
              to="/catalogue-formations"
              aria-label="Retour au catalogue des formations"
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all shadow-lg hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </Link>
          </div>
          <div className="absolute bottom-6 right-4 sm:right-8 z-20 max-w-sm w-[90%] sm:w-auto">
            <div className="bg-[#100906]/90 backdrop-blur-xl border border-[#d4af37]/40 p-4 sm:p-5 rounded-[2rem] text-white shadow-2xl space-y-3">
              
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d4af37] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                  Programme Certifiant
                </span>
                <span className="text-[10px] font-bold text-white/70 uppercase">
                  {formationPrice > 0 ? `${formationPrice.toLocaleString()} FCFA` : "Sur devis"}
                </span>
              </div>

              {/* 3 Metrics Tiles */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/10 border border-white/10 p-2 rounded-xl">
                  <span className="text-xs sm:text-sm font-extrabold text-[#d4af37] block leading-tight truncate">
                    {formation.duration || "3 Jours"}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-white/70">Durée</span>
                </div>
                <div className="bg-white/10 border border-white/10 p-2 rounded-xl">
                  <span className="text-xs sm:text-sm font-extrabold text-[#d4af37] block leading-tight truncate">
                    {formation.level || "Exécutif"}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-white/70">Niveau</span>
                </div>
                <div className="bg-white/10 border border-white/10 p-2 rounded-xl">
                  <span className="text-xs sm:text-sm font-extrabold text-[#d4af37] block leading-tight truncate">
                    {formation.certification || "NFL"}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-white/70">Certif.</span>
                </div>
              </div>

              <button
                onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full bg-gradient-to-r from-[#d4af37] via-[#e3bd51] to-[#d4af37] hover:opacity-95 text-black font-extrabold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider group cursor-pointer"
              >
                <span>S'inscrire maintenant</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        </section>

        {/* 2. MAIN 2-COLUMN LAYOUT (GAUCHE : DÉTAILS FORMATION, DROITE : FORMULAIRE STICKY) */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* GAUCHE : DÉTAILS DE LA FORMATION */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* TITRE PRINCIPAL */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#100906] tracking-tight leading-snug">
                  {formation.title}
                </h1>
              </div>

              {/* DURÉE ROW WITH CLOCK ICON */}
              <div className="flex items-center gap-3 text-sm sm:text-base font-semibold text-[#333]">
                <div className="w-10 h-10 rounded-xl bg-[#8c591a]/10 border border-[#8c591a]/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#8c591a]" />
                </div>
                <div>
                  <span className="block text-[#100906]">
                    {formation.duration || "Formation intensive — 3 à 5 jours"}
                  </span>
                  <span className="text-xs text-[#666] font-normal block">
                    Horaires flexibles adaptés aux cadres et dirigeants
                  </span>
                </div>
              </div>

              {/* FORMAT ROW WITH GLOBE / LOCATION ICON */}
              <div className="flex items-center gap-3 text-sm sm:text-base font-semibold text-[#333]">
                <div className="w-10 h-10 rounded-xl bg-[#8c591a]/10 border border-[#8c591a]/20 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-[#8c591a]" />
                </div>
                <div>
                  <span className="block text-[#100906]">
                    Présentiel à Libreville &amp; Visioconférence
                  </span>
                  <span className="text-xs text-[#666] font-normal block">
                    Accès aux replays, supports numériques et plateforme e-learning
                  </span>
                </div>
              </div>

              {/* CERTIFICATION ROW */}
              <div className="flex items-center gap-3 py-3 border-y border-black/5">
                <div className="w-10 h-10 rounded-xl bg-[#8c591a]/10 border border-[#8c591a]/20 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#8c591a]" />
                </div>
                <div>
                  <span className="block text-[#100906] font-bold text-sm sm:text-base">
                    {formation.certification || "Certification Professionnelle NFL Courtier"}
                  </span>
                  <span className="text-xs text-[#666] font-normal block">
                    Attestation de compétences et validation des acquis reconnue
                  </span>
                </div>
              </div>

              {/* SECTION À PROPOS */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#100906]">
                  À propos de la formation
                </h2>
                <div className="text-sm sm:text-base text-[#444] leading-relaxed space-y-3 font-normal">
                  {formation.description ? (
                    formation.description
                      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
                      .split("\n").filter(Boolean).map((para, idx) => (
                        <p key={idx}>{para.trim()}</p>
                      ))
                  ) : (
                    <p className="italic text-[#888]">
                      Cette formation de haut niveau est conçue pour outiller les professionnels et dirigeants avec des méthodes concrètes et directement applicables.
                    </p>
                  )}
                </div>
              </div>

              {/* PROGRAMME DÉTAILLÉ DE LA FORMATION */}
              {program.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-black/5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#100906]">
                    Programme de la formation
                  </h2>
                  <div className="space-y-3">
                    {program.map((p: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start bg-[#f4f2ee] p-4 rounded-2xl border border-black/5">
                        {p.time && (
                          <span className="bg-[#8c591a] text-white text-xs font-bold px-3 py-1 rounded-full shrink-0">
                            {p.time}
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-sm text-[#100906]">{p.title}</p>
                          {p.description && <p className="text-xs text-[#666] mt-0.5">{p.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CE QUE VOTRE INSCRIPTION COMPREND */}
              <div className="space-y-4 pt-4 border-t border-black/5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#100906]">
                  Votre inscription comprend
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {formationIncludes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#f4f2ee] p-3.5 rounded-xl border border-black/5">
                      <CheckCircle2 className="w-4 h-4 text-[#8c591a] shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-[#333] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GALERIE PHOTOS (SI DISPONIBLE) */}
              {gallery.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Images className="w-5 h-5 text-[#8c591a]" />
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#100906]">
                        Galerie des sessions précédentes
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.slice(0, 6).map((src, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-black/10">
                        <img
                          src={src}
                          alt={`${formation.title} — session ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* DROITE (DESKTOP STICKY): FORMULAIRE D'INSCRIPTION — IDENTIQUE À EVENT DETAIL */}
            <div id="booking-form" className="lg:col-span-5 lg:sticky lg:top-28 scroll-mt-24">
              <div className="bg-gradient-to-br from-[#100906] via-[#1f120c] to-[#3a2012] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-6 relative overflow-hidden">
                
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-1 relative z-10">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#d4af37] block">
                    Formulaire d'Inscription
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    Réservez votre place
                  </h3>
                  <p className="text-xs text-white/70">
                    Remplissez vos informations pour réserver votre place et recevoir la documentation complète.
                  </p>
                </div>

                {/* SÉLECTEUR DE FORMULE */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/10 rounded-xl relative z-10">
                  <button
                    type="button"
                    onClick={() => setSelectedFormule("individuel")}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                      selectedFormule === "individuel"
                        ? "bg-[#d4af37] text-black shadow-md"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Individuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFormule("corporate")}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                      selectedFormule === "corporate"
                        ? "bg-[#d4af37] text-black shadow-md"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Entreprise / Groupe
                  </button>
                </div>

                {/* FORMULAIRE DES CHAMPS */}
                <form onSubmit={handleBooking} className="space-y-4 relative z-10">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/80 block">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className="w-full bg-black/40 border border-white/10 text-sm text-white px-4 py-3 rounded-xl placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/80 block">
                      Adresse Email professionnelle
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean.dupont@entreprise.com"
                      className="w-full bg-black/40 border border-white/10 text-sm text-white px-4 py-3 rounded-xl placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 block">
                        Nombre de participants
                      </label>
                      <select
                        value={nbPlaces}
                        onChange={(e) => setNbPlaces(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-sm text-white px-3 py-3 rounded-xl focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                      >
                        <option value="1 Place" className="bg-[#100906]">1 Participant</option>
                        <option value="2 Places" className="bg-[#100906]">2 Participants</option>
                        <option value="3 Places" className="bg-[#100906]">3 Participants</option>
                        <option value="5 Places" className="bg-[#100906]">5 Participants (Équipe)</option>
                        <option value="Session sur-mesure (+10)" className="bg-[#100906]">Session sur-mesure (+10)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 block">
                        Téléphone WhatsApp
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 flex items-center gap-1 text-[11px] text-white/60 font-semibold pointer-events-none">
                          <span>🇬🇦 +241</span>
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="06 00 00"
                          className="w-full bg-black/40 border border-white/10 text-sm text-white pl-[68px] pr-3 py-3 rounded-xl placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY & SUBMIT BUTTON */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/50 block">Montant</span>
                      <span className="text-xs text-white/70">
                        {selectedFormule === "individuel" ? "Tarif individuel" : "Formule Entreprise"}
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-[#d4af37]">
                      {selectedFormule === "individuel"
                        ? (formationPrice > 0 ? `${formationPrice.toLocaleString()} FCFA` : "Sur devis")
                        : (corporatePrice > 0 ? `${corporatePrice.toLocaleString()} FCFA` : "Sur devis")}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#d4af37] via-[#e3bd51] to-[#d4af37] hover:opacity-95 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      "Confirmation..."
                    ) : (
                      <>
                        <span>Confirmer mon inscription</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-1 text-white/40 text-[11px] font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                    <span>Accompagnement &amp; validation directe NFL Courtier</span>
                  </div>

                </form>

              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default FormationDetail;
