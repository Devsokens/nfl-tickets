import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { EventsAPI, TicketsAPI, TestimonialsAPI, type Event, type Testimonial } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock, CheckCircle2, ArrowRight, ArrowLeft, UserCheck, Award, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";

import nflImg1 from "@/assets/nfl img1.jpeg";
import nflImg5 from "@/assets/nfl img 5.jpeg";

function formatEventDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Fait défiler un carrousel horizontal snap vers l'item `index` et notifie `onIndexChange`.
function scrollCarouselTo(container: HTMLDivElement | null, index: number) {
  if (!container) return;
  const scrollAmount = container.clientWidth * 0.85;
  container.scrollTo({ left: index * scrollAmount, behavior: "smooth" });
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

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => TestimonialsAPI.getAll(false),
  });

  const speakers = event?.speakers || [];
  const program = event?.program || [];

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nbPlaces, setNbPlaces] = useState("1 Place");
  const [selectedFormule, setSelectedFormule] = useState<"individuel" | "corporate">("individuel");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carousel states & refs for Intervenants and Testimonials
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);
  const speakersRef = useRef<HTMLDivElement>(null);

  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // Autoscroll intervenants (seulement s'il y en a plus d'un)
  useEffect(() => {
    if (speakers.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSpeakerIndex((prev) => {
        const nextIndex = (prev + 1) % speakers.length;
        scrollCarouselTo(speakersRef.current, nextIndex);
        return nextIndex;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [speakers.length]);

  const handleSpeakersScroll = () => {
    if (!speakersRef.current || speakers.length === 0) return;
    const container = speakersRef.current;
    const scrollAmount = container.clientWidth * 0.85;
    if (scrollAmount > 0) {
      const newIndex = Math.round(container.scrollLeft / scrollAmount);
      setActiveSpeakerIndex(Math.min(speakers.length - 1, Math.max(0, newIndex)));
    }
  };

  // Autoscroll témoignages (seulement s'il y en a plus d'un)
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

  const eventTitle = event?.title || "Événement NFL Courtier & Service";
  const eventLocation = event?.location || "Libreville, Gabon";
  const eventImage = event?.image_url || event?.image || nflImg1;
  const eventPrice = event?.price || 0;
  const corporatePrice = eventPrice * 8;

  // Statistiques réelles disponibles pour cet événement (on n'affiche que ce qui est vrai)
  const infoStats = [
    event?.capacity ? `${event.capacity} places disponibles` : null,
    speakers.length > 0 ? `${speakers.length} intervenant${speakers.length > 1 ? "s" : ""}` : null,
    event?.category ? `Catégorie : ${event.category}` : null,
  ].filter(Boolean) as string[];

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
                      `*Détails du participant :*\n` +
                      `- *Nom complet* : ${fullName}\n` +
                      `- *Email* : ${email}\n` +
                      `- *Nombre de places* : ${nbPlaces}\n` +
                      `- *Téléphone WhatsApp* : ${phone}\n` +
                      `- *Formule choisie* : ${selectedFormule === "individuel" ? "Tarif individuel" : "Table Corporate (8 pers.)"} (${priceStr})\n\n` +
                      `Merci de valider ma réservation.`;

      const whatsappUrl = `https://wa.me/24166692338?text=${encodeURIComponent(message)}`;
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
    <div className="min-h-screen bg-[#0d0e11] flex flex-col text-white">
      <Helmet>
        <title>{`${eventTitle} | NFL Courtier & Service`}</title>
        <meta name="description" content={event?.description || `Découvrez les intervenants, le programme et réservez votre place pour ${eventTitle}.`} />
      </Helmet>
      <Navbar />

      {/* 1. HERO SECTION WITH IMAGE BACKGROUND & BOUTON RETOUR */}
      <section className="relative pt-20 pb-14 md:pt-28 md:pb-18 overflow-hidden border-b border-white/10 bg-[#0d0e11]">
        <img
          src={eventImage}
          alt={eventTitle}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.25] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e11] via-[#0d0e11]/85 to-[#0d0e11]/90" />

        <div className="relative z-10 container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-[#e3bd51] hover:text-[#d4af37] font-bold text-lvl-footer uppercase tracking-widest transition-all bg-white/5 border border-[#e3bd51]/30 hover:border-[#e3bd51] px-5 py-2.5 rounded-none backdrop-blur-md shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> RETOUR AUX ÉVÉNEMENTS
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.25em] block">
                {event?.category ? `• ${event.category.toUpperCase()} •` : "• ÉVÉNEMENT EXCLUSIF •"}
              </span>

              <h1 className="text-lvl-hero text-white leading-tight drop-shadow-md">
                {eventTitle}
              </h1>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-lvl-footer text-white/90 font-medium">
                {event?.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#e3bd51]" />
                    <span>{formatEventDate(event.date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#e3bd51]" />
                  <span>{eventLocation}</span>
                </div>
                {event?.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#e3bd51]" />
                    <span>À partir de {event.time}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-3">
                <button
                  onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-lvl-footer uppercase tracking-wider py-4 px-8 rounded-none transition-colors shadow-lg"
                >
                  Réserver ma place
                </button>
                <button
                  onClick={() => document.getElementById("programme-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="border border-white/30 bg-transparent hover:bg-white/10 text-white font-bold text-lvl-footer uppercase tracking-wider py-4 px-8 rounded-none transition-colors"
                >
                  Voir le programme
                </button>
              </div>
            </div>

            {infoStats.length > 0 && (
              <div className="lg:col-span-5">
                <div className="bg-[#14161a]/90 backdrop-blur-md border border-white/15 p-7 sm:p-8 rounded-none space-y-4 max-w-md mx-auto lg:mx-0 lg:ml-auto shadow-2xl">
                  {infoStats.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-center lg:justify-start gap-3 text-lvl-footer text-white/90 font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#e3bd51] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. DESCRIPTION & PROGRAMME TIMELINE */}
      <section id="programme-section" className="section-y bg-[#0d0e11] border-b border-white/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-lvl-subtitle text-white leading-tight">
                À propos de cet événement
              </h2>
              {event?.description ? (
                event.description
                  .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
                  .split("\n").filter(Boolean).map((para, idx) => (
                    <p key={idx} className="text-white/70 text-lvl-body font-light">
                      {para.trim()}
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
                    {program.map((p, idx) => (
                      <div key={idx} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        {p.time && <span className="text-[#e3bd51] font-bold text-lvl-footer shrink-0 pt-0.5">{p.time}</span>}
                        <div className="space-y-1">
                          <p className="font-bold text-lvl-footer text-white leading-snug">{p.title}</p>
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

      {/* 3. INTERVENANTS SECTION (uniquement si renseignés par l'admin) */}
      {speakers.length > 0 && (
        <section className="section-y bg-[#0d0e11] text-center border-b border-white/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-lvl-title text-[#e3bd51] mb-10 md:mb-14 tracking-wide">
              Intervenants
            </h2>

            <div className="relative">
              <div
                ref={speakersRef}
                onScroll={handleSpeakersScroll}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 md:grid md:grid-cols-3 md:gap-8 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0"
              >
                {speakers.map((speaker, idx) => (
                  <div key={idx} className="w-[85vw] max-w-[320px] md:w-auto shrink-0 snap-center bg-[#14161a] border border-white/10 rounded-xl p-6 sm:p-7 flex flex-col items-center shadow-xl group hover:border-[#e3bd51]/40 transition-colors">
                    <div className="w-full h-72 sm:h-80 rounded-lg overflow-hidden mb-6 bg-black/40 flex items-center justify-center">
                      {speaker.photo_url ? (
                        <img
                          src={speaker.photo_url}
                          alt={speaker.name}
                          className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <Users className="w-16 h-16 text-white/20" />
                      )}
                    </div>
                    <h3 className="text-lvl-subtitle text-[#e3bd51] tracking-wide">
                      {speaker.name}
                    </h3>
                    {speaker.role && (
                      <p className="text-white/80 text-lvl-footer font-bold uppercase tracking-widest mt-1">
                        {speaker.role}
                      </p>
                    )}
                    {speaker.company && (
                      <p className="text-white/50 text-lvl-footer font-semibold uppercase tracking-wider mt-0.5">
                        {speaker.company}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {speakers.length > 1 && (
                <div className="flex md:hidden justify-center items-center gap-2 mt-4">
                  {speakers.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Intervenant ${idx + 1}`}
                      onClick={() => {
                        setActiveSpeakerIndex(idx);
                        scrollCarouselTo(speakersRef.current, idx);
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        activeSpeakerIndex === idx
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

      {/* 4. RETOUR SUR L'ÉDITION PRÉCÉDENTE (bandeau décoratif de marque) */}
      <section className="relative overflow-hidden bg-black py-2 sm:py-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative min-h-[380px] sm:min-h-[460px]">
          <div className="relative h-64 md:h-auto overflow-hidden">
            <img
              src={nflImg1}
              alt="Banquet de gala"
              className="w-full h-full object-cover filter brightness-[0.75]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/80" />
          </div>

          <div className="relative h-64 md:h-auto overflow-hidden">
            <img
              src={nflImg5}
              alt="Réunion des décideurs"
              className="w-full h-full object-cover filter brightness-[0.75]"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-black/80" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-[#d4af37] text-black font-bold text-lvl-footer uppercase tracking-wider px-8 py-3.5 rounded-none shadow-2xl border border-black/20 pointer-events-auto hover:bg-[#c29c38] transition-colors">
              L'esprit NFL Courtier & Service
            </div>
          </div>
        </div>
      </section>

      {/* 5. TÉMOIGNAGES (issus des témoignages publiés sur le site) */}
      {testimonials.length > 0 && (
        <section className="section-y bg-[#0d0e11] border-b border-white/5">
          <div className="container mx-auto px-4 max-w-6xl">
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

      {/* 6. VOTRE PARTICIPATION COMPREND : (offre standard NFL, commune à tous les événements) */}
      <section className="section-y bg-[#e8e6e2] text-[#1c1c1c]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 bg-[#f0ede8] p-8 sm:p-12 border border-black/10 shadow-sm rounded-none text-center lg:text-left min-h-[220px] flex items-center justify-center">
              <h2 className="text-lvl-subtitle text-[#1c1c1c] leading-tight">
                Votre participation<br className="hidden sm:inline" /> comprend :
              </h2>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-8 sm:p-10 rounded-none shadow-2xl border border-black/10">
                <div className="space-y-4">
                  {[
                    "Accueil et badge nominatif",
                    "Networking",
                    "Accès aux conférences",
                    "Documentation",
                    "Photos officielles",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-lvl-body font-medium text-[#2c2c2c]">
                      <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#655410]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SPONSORS (bandeau défilant, valeurs de la marque) */}
      <section className="py-8 bg-black text-center border-y border-white/10 overflow-hidden">
        <span className="text-[#e3bd51] text-lvl-footer font-bold uppercase tracking-[0.3em] block mb-4">
          Sponsors
        </span>
        <div className="relative w-full overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee gap-10 items-center w-max">
            {Array.from({ length: 3 }, () => ["L'EXCELLENCE", "LA RIGUEUR", "LE PRESTIGE", "LA STRATÉGIE", "LA CONFIANCE"]).flat().map((word, idx) => (
              <span key={idx} className="flex items-center gap-10 shrink-0">
                <span className="text-white/50 text-lvl-body font-bold uppercase tracking-wider whitespace-nowrap">{word}</span>
                <span className="text-[#e3bd51]">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 8. RÉSERVEZ VOTRE PLACE (BOOKING SECTION) */}
      <section id="booking-form" className="section-y bg-[#0c0d0f] text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div>
                <h2 className="text-lvl-title text-white leading-tight mb-4">
                  Réservez votre place
                </h2>
                <p className="text-white/60 text-lvl-body font-normal">
                  L'accès à cet événement est limité pour garantir une expérience de qualité supérieure.
                </p>
              </div>

              <div className="space-y-4 pt-2 w-full">
                <div
                  onClick={() => setSelectedFormule("individuel")}
                  className={`p-6 rounded-none border cursor-pointer transition-all flex items-center gap-4 ${
                    selectedFormule === "individuel"
                      ? "border-[#e3bd51] bg-[#e3bd51]/10"
                      : "border-white/15 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#e3bd51]/20 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-[#e3bd51]" />
                  </div>
                  <div>
                    <span className="text-white/60 text-lvl-footer font-bold uppercase tracking-wider block">
                      Tarif individuel
                    </span>
                    <span className="text-lvl-subtitle font-bold text-[#e3bd51]">
                      {eventPrice.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedFormule("corporate")}
                  className={`p-6 rounded-none border cursor-pointer transition-all flex items-center gap-4 ${
                    selectedFormule === "corporate"
                      ? "border-[#e3bd51] bg-[#e3bd51]/10"
                      : "border-white/15 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#e3bd51]/20 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-[#e3bd51]" />
                  </div>
                  <div>
                    <span className="text-white/60 text-lvl-footer font-bold uppercase tracking-wider block">
                      Table Corporate (8 pers.)
                    </span>
                    <span className="text-lvl-subtitle font-bold text-[#e3bd51]">
                      {corporatePrice.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleBooking} className="bg-[#17191d] border border-white/10 p-8 sm:p-10 rounded-none space-y-5 shadow-2xl">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-white/70">
                      NOM COMPLET
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex : MOUSSAVOU ALEX"
                      className="w-full bg-[#22252b] border border-white/10 text-lvl-footer text-white px-4 py-3.5 rounded-none placeholder:text-white/30 focus:outline-none focus:border-[#e3bd51]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-white/70">
                      ADRESSE EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="moussavou@gmail.com"
                      className="w-full bg-[#22252b] border border-white/10 text-lvl-footer text-white px-4 py-3.5 rounded-none placeholder:text-white/30 focus:outline-none focus:border-[#e3bd51]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-white/70">
                      NOMBRE DE PLACES
                    </label>
                    <select
                      value={nbPlaces}
                      onChange={(e) => setNbPlaces(e.target.value)}
                      className="w-full bg-[#22252b] border border-white/10 text-lvl-footer text-white px-4 py-3.5 rounded-none focus:outline-none focus:border-[#e3bd51]"
                    >
                      <option value="1 Place">1 Place</option>
                      <option value="2 Places">2 Places</option>
                      <option value="3 Places">3 Places</option>
                      <option value="4 Places">4 Places</option>
                      <option value="Table Corporate (8 places)">Table Corporate (8 places)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-lvl-footer font-bold uppercase tracking-wider text-white/70">
                      TÉLÉPHONE (WHATSAPP)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+241 00 00 00 00"
                      className="w-full bg-[#22252b] border border-white/10 text-lvl-footer text-white px-4 py-3.5 rounded-none placeholder:text-white/30 focus:outline-none focus:border-[#e3bd51]"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#e3bd51] hover:bg-[#d4af37] text-black font-bold text-lvl-footer uppercase tracking-widest py-4 px-6 rounded-none transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? "TRAITEMENT..." : "CONFIRMER LA RÉSERVATION"} <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-lvl-footer text-white/40 text-center italic mt-3">
                    Un ticket virtuel vous sera envoyé après validation.
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

export default EventDetail;
