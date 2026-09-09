import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { EventsAPI, TicketsAPI, SiteSettingsAPI, type Event, type SiteSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock, CheckCircle2, ArrowRight, ChevronLeft, ShieldCheck, Ticket, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";

import nflImg1 from "@/assets/nfl img1.jpeg";

function formatEventDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function useCountdown(targetDateStr?: string) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDateStr) return;
    const target = new Date(targetDateStr).getTime();
    if (isNaN(target)) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}

const EventDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: event } = useQuery<Event>({
    queryKey: ["event", id],
    queryFn: () => EventsAPI.getOne(id as string),
    enabled: !!id,
  });

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: SiteSettingsAPI.get,
  });

  const speakers = event?.speakers || [];
  const program = event?.program || [];
  const timeLeft = useCountdown(event?.date);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nbPlaces, setNbPlaces] = useState("1 Place");
  const [selectedFormule, setSelectedFormule] = useState<"individuel" | "corporate">("individuel");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTitle = event?.title || "Événement NFL Courtier & Service";
  const eventLocation = event?.location || "Libreville, Gabon";
  const eventImage = event?.image_url || event?.image || nflImg1;
  const eventPrice = event?.price || 0;
  const corporatePrice = eventPrice > 0 ? eventPrice * 8 : 100000;
  const isPast = event?.date ? new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0)) : false;

  const DEFAULT_INCLUDES = [
    "Accueil VIP et badge nominatif sécurisé",
    "Accès complet aux conférences et ateliers",
    "Kit de documentation & support de présentation",
    "Accès à l'espace de Networking avec les experts",
    "Photos et souvenirs officiels de l'événement",
  ];
  const eventIncludes = event?.includes?.length ? event.includes : DEFAULT_INCLUDES;

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
    try {
      if (event?.id) {
        await TicketsAPI.create({
          event_id: event.id,
          full_name: fullName,
          email,
          phone,
          payer_phone: phone,
        });
      }

      toast({
        title: "Demande reçue !",
        description: "Redirection vers WhatsApp pour finaliser votre ticket...",
      });

      const priceStr = selectedFormule === "individuel"
        ? `${eventPrice.toLocaleString()} FCFA`
        : `${corporatePrice.toLocaleString()} FCFA`;
      const message = `Bonjour NFL Courtier & Service,\n\n` +
                      `Je souhaite réserver pour l'événement : *${eventTitle}*.\n\n` +
                      `*Détails de la réservation :*\n` +
                      `- *Nom complet* : ${fullName}\n` +
                      `- *Email* : ${email}\n` +
                      `- *Nombre de places* : ${nbPlaces}\n` +
                      `- *Téléphone WhatsApp* : ${phone}\n` +
                      `- *Formule choisie* : ${selectedFormule === "individuel" ? "Tarif individuel" : "Table Corporate (8 pers.)"} (${priceStr})\n\n` +
                      `Merci de valider ma réservation.`;

      const whatsappNumber = (event?.whatsapp_number || siteSettings?.whatsapp_number || "24166692338").replace(/[^\d]/g, "");
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 1000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#100906] flex flex-col">
      <Helmet>
        <title>{`${eventTitle} | NFL Courtier & Service`}</title>
        <meta name="description" content={event?.description || `Réservez votre place pour ${eventTitle}.`} />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-20">
        
        {/* 1. HERO COVER PHOTO SECTION (FLOATING BACK BUTTON LEFT + COUNTDOWN & ACTION BUTTON RIGHT) */}
        <section className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] bg-[#100906] overflow-hidden">
          <img
            src={eventImage}
            alt={eventTitle}
            className="w-full h-full object-cover opacity-85 brightness-90 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100906]/90 via-[#100906]/40 to-black/30" />

          {/* FLOATING BACK BUTTON (<) TOP LEFT */}
          <div className="absolute top-6 left-4 sm:left-8 z-20">
            <Link
              to="/events"
              aria-label="Retour aux événements"
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all shadow-lg hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </Link>
          </div>

          {/* COMPTE À REBOURS & BOUTON D'ACTION (S'INSCRIRE) À DROITE SUR LA COUVERTURE */}
          <div className="absolute bottom-6 right-4 sm:right-8 z-20 max-w-sm w-[90%] sm:w-auto">
            <div className="bg-[#100906]/85 backdrop-blur-xl border border-[#d4af37]/40 p-4 sm:p-5 rounded-[2rem] text-white shadow-2xl space-y-3">
              
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d4af37] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                  {isPast ? "Événement Terminé" : "Compte à Rebours"}
                </span>
                <span className="text-[10px] font-bold text-white/60 uppercase">
                  {eventPrice > 0 ? `${eventPrice.toLocaleString()} FCFA` : "Sur invitation"}
                </span>
              </div>

              {!isPast && timeLeft && (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white/10 border border-white/10 p-2 rounded-xl">
                    <span className="text-lg sm:text-2xl font-extrabold text-[#d4af37] block leading-tight">{timeLeft.days}</span>
                    <span className="text-[9px] uppercase font-bold text-white/70">Jours</span>
                  </div>
                  <div className="bg-white/10 border border-white/10 p-2 rounded-xl">
                    <span className="text-lg sm:text-2xl font-extrabold text-[#d4af37] block leading-tight">{timeLeft.hours}</span>
                    <span className="text-[9px] uppercase font-bold text-white/70">Heures</span>
                  </div>
                  <div className="bg-white/10 border border-white/10 p-2 rounded-xl">
                    <span className="text-lg sm:text-2xl font-extrabold text-[#d4af37] block leading-tight">{timeLeft.minutes}</span>
                    <span className="text-[9px] uppercase font-bold text-white/70">Min</span>
                  </div>
                  <div className="bg-white/10 border border-white/10 p-2 rounded-xl">
                    <span className="text-lg sm:text-2xl font-extrabold text-[#d4af37] block leading-tight">{timeLeft.seconds}</span>
                    <span className="text-[9px] uppercase font-bold text-white/70">Sec</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full bg-gradient-to-r from-[#d4af37] via-[#e3bd51] to-[#d4af37] hover:opacity-95 text-black font-extrabold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider group"
              >
                <span>S'inscrire maintenant</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        </section>

        {/* 2. MAIN 2-COLUMN LAYOUT (LEFT: EVENT DETAILS & TEXT, RIGHT: DESKTOP STICKY FORM) */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* GAUCHE (DESKTOP): DÉTAILS DE L'ÉVÉNEMENT ET TEXTES */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* TITRE ET CATÉGORIE */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8c591a] bg-[#8c591a]/10 px-3 py-1 rounded-full border border-[#8c591a]/20">
                    {event?.category || "Événement d'Excellence"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#100906] tracking-tight leading-snug">
                  {eventTitle}
                </h1>
              </div>

              {/* DATE ROW WITH CALENDAR ICON */}
              <div className="flex items-center gap-3 text-sm sm:text-base font-semibold text-[#333]">
                <div className="w-10 h-10 rounded-xl bg-[#8c591a]/10 border border-[#8c591a]/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#8c591a]" />
                </div>
                <div>
                  <span className="block text-[#100906] capitalize">
                    {event?.date ? formatEventDate(event.date) : "Date à venir"}
                  </span>
                  {event?.time && (
                    <span className="text-xs text-[#666] font-normal block">
                      À partir de {event.time}
                    </span>
                  )}
                </div>
              </div>

              {/* LOCATION ROW WITH MAP PIN ICON */}
              <div className="flex items-center gap-3 text-sm sm:text-base font-semibold text-[#333]">
                <div className="w-10 h-10 rounded-xl bg-[#8c591a]/10 border border-[#8c591a]/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#8c591a]" />
                </div>
                <div>
                  <span className="block text-[#100906]">
                    {eventLocation}
                  </span>
                  <span className="text-xs text-[#666] font-normal block">
                    Libreville &amp; Visioconférence
                  </span>
                </div>
              </div>

              {/* PARTICIPANTS / NOMBRE D'INSCRITS (DESIGN SANS LISTE DE NOMS AVATARS) */}
              <div className="flex items-center gap-3 py-3 border-y border-black/5">
                <div className="w-10 h-10 rounded-xl bg-[#8c591a]/10 border border-[#8c591a]/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#8c591a]" />
                </div>
                <div>
                  <span className="block text-[#100906] font-bold text-sm sm:text-base">
                    {event?.capacity ? `${event.capacity} places disponibles` : "35 personnes inscrites"}
                  </span>
                  <span className="text-xs text-[#666] font-normal block">
                    Rejoignez les participants à cet événement d'exception
                  </span>
                </div>
              </div>

              {/* SECTION À PROPOS */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#100906]">
                  À propos
                </h2>
                <div className="text-sm sm:text-base text-[#444] leading-relaxed space-y-3 font-normal">
                  {event?.description ? (
                    event.description
                      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
                      .split("\n").filter(Boolean).map((para, idx) => (
                        <p key={idx}>{para.trim()}</p>
                      ))
                  ) : (
                    <p className="italic text-[#888]">
                      Rejoignez NFL Courtier & Service pour une expérience d'exception réunissant décideurs et leaders d'entreprises.
                    </p>
                  )}
                </div>
              </div>

              {/* PROGRAMME DÉTAILLÉ (SI RENSEIGNÉ) */}
              {program.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-black/5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#100906]">
                    Programme de l'événement
                  </h2>
                  <div className="space-y-3">
                    {program.map((p, idx) => (
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

              {/* INTERVENANTS / SPEAKERS (SI RENSEIGNÉS) */}
              {speakers.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-black/5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#100906]">
                    Intervenants
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {speakers.map((s, idx) => (
                      <div key={idx} className="bg-[#f4f2ee] p-4 rounded-2xl border border-black/5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/10 shrink-0">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#100906] font-bold text-lg">
                              {s.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-[#100906] truncate">{s.name}</h4>
                          {s.role && <p className="text-xs text-[#8c591a] font-semibold truncate">{s.role}</p>}
                          {s.company && <p className="text-[11px] text-[#666] truncate">{s.company}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CE QUE VOTRE PARTICIPATION COMPREND */}
              <div className="space-y-4 pt-4 border-t border-black/5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#100906]">
                  Votre participation comprend
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {eventIncludes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#f4f2ee] p-3.5 rounded-xl border border-black/5">
                      <CheckCircle2 className="w-4 h-4 text-[#8c591a] shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-[#333] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* DROITE (DESKTOP STICKY): FORMULAIRE DE RÉSERVATION / INSCRIPTION */}
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
                    Remplissez vos informations pour valider votre participation et recevoir votre ticket virtuel instantané.
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
                    Corporate (8 pers.)
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
                      Adresse Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean.dupont@example.com"
                      className="w-full bg-black/40 border border-white/10 text-sm text-white px-4 py-3 rounded-xl placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 block">
                        Nombre de places
                      </label>
                      <select
                        value={nbPlaces}
                        onChange={(e) => setNbPlaces(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-sm text-white px-3 py-3 rounded-xl focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                      >
                        <option value="1 Place" className="bg-[#100906]">1 Place</option>
                        <option value="2 Places" className="bg-[#100906]">2 Places</option>
                        <option value="3 Places" className="bg-[#100906]">3 Places</option>
                        <option value="4 Places" className="bg-[#100906]">4 Places</option>
                        <option value="Table Corporate (8 places)" className="bg-[#100906]">Table Corporate (8 pers.)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 block">
                        Téléphone
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
                      <span className="text-[10px] uppercase font-bold text-white/50 block">Montant Total</span>
                      <span className="text-xs text-white/70">
                        {selectedFormule === "individuel" ? "Tarif unitaire" : "Formule Entreprise"}
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-[#d4af37]">
                      {selectedFormule === "individuel"
                        ? (eventPrice > 0 ? `${eventPrice.toLocaleString()} FCFA` : "Gratuit")
                        : `${corporatePrice.toLocaleString()} FCFA`}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#d4af37] via-[#e3bd51] to-[#d4af37] hover:opacity-95 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "Confirmation..."
                    ) : (
                      <>
                        <span>Confirmer ma réservation</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-1 text-white/40 text-[11px] font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                    <span>Validation directe avec NFL Courtier &amp; Service</span>
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

export default EventDetail;
