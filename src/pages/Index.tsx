import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronUp, Calendar, Mail, MapPin, Phone, Send, Facebook, Linkedin, Instagram } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

import heroImage0 from "@/assets/nfl img2.jpeg";
import heroImage1 from "@/assets/nfl img 4.jpeg";
import heroImage2 from "@/assets/nfl img 5.jpeg";
import heroImage3 from "@/assets/nfl img 6.jpeg";
import heroImage4 from "@/assets/nfl img3.jpeg";
import louisePhoto from "@/assets/louise2.jpeg";

import nflImg1 from "@/assets/nfl img1.jpeg";
import nflImg2 from "@/assets/nfl img2.jpeg";
import nflImg3 from "@/assets/nfl img3.jpeg";
import nflImg4 from "@/assets/nfl img 4.jpeg";

const categoryImages: Record<string, string> = {
  soirée: nflImg1,
  conférence: nflImg2,
  atelier: nflImg3,
  concert: nflImg4,
  seminaire: nflImg2,
};

import { useQuery } from "@tanstack/react-query";
import { EventsAPI, NewsletterAPI, ContactAPI, type Event } from "@/lib/api";

const Index = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [heroIndex, setHeroIndex] = useState(0);
  const [activePastIndex, setActivePastIndex] = useState(0);
  
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const heroImages = [heroImage0, heroImage1, heroImage2, heroImage3, heroImage4];
  
  // Fetch ALL events (past and upcoming)
  const { data: allEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ["allEvents"],
    queryFn: () => EventsAPI.getAll(),
  });

  const today = new Date().setHours(0, 0, 0, 0);
  const upcomingEvents = allEvents
    .filter(event => new Date(event.date).getTime() >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = allEvents
    .filter(event => new Date(event.date).getTime() < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const homeUpcomingEvents = upcomingEvents.slice(0, 4);
  const homePastEvents = pastEvents.slice(0, 3);

  const handlePastScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.scrollWidth / (homePastEvents.length + 1);
    const newIndex = Math.round(scrollLeft / itemWidth);
    setActivePastIndex(newIndex);
  };

  const scrollRefUpcoming = useRef<HTMLDivElement>(null);
  const scrollRefPast = useRef<HTMLDivElement>(null);
  const [isHoveredUpcoming, setIsHoveredUpcoming] = useState(false);
  const [isHoveredPast, setIsHoveredPast] = useState(false);

  // Auto-scroll effect for Upcoming Events
  useEffect(() => {
    if (isHoveredUpcoming || !scrollRefUpcoming.current || homeUpcomingEvents.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRefUpcoming.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRefUpcoming.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          scrollRefUpcoming.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRefUpcoming.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHoveredUpcoming, homeUpcomingEvents.length]);

  // Auto-scroll effect for Past Events
  useEffect(() => {
    if (isHoveredPast || !scrollRefPast.current || homePastEvents.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRefPast.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRefPast.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          scrollRefPast.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRefPast.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isHoveredPast, homePastEvents.length]);



  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const node = document.getElementById(id);
    if (node) node.scrollIntoView({ behavior: "smooth" });
  }, [location.hash]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsNewsletterLoading(true);
    try {
      const res = await NewsletterAPI.subscribe(newsletterEmail);
      toast({
        title: "Inscription réussie",
        description: res.message || "Vous êtes bien inscrit à la newsletter.",
      });
      setNewsletterEmail("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.response?.data?.message || "Une erreur est survenue.",
      });
    } finally {
      setIsNewsletterLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    try {
      await ContactAPI.send(contactForm);
      toast({
        title: "Message envoyé",
        description: "Nous avons bien reçu votre message. Nous vous répondrons dans les plus brefs délais.",
      });
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer votre message pour le moment.",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>NFL Courtier & Service — Accueil | Billetterie & Formations au Gabon</title>
        <meta name="description" content="Bienvenue chez NFL Courtier & Service. Découvrez nos prochains événements, masterclass et services de formation pour les entreprises au Gabon." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "NFL Courtier & Service",
              "url": "https://nfl-ga.com",
              "logo": "https://nfl-ga.com/favicon.jpg",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+241 066 69 23 38",
                "contactType": "customer service",
                "email": "seminaireslao@outlook.fr",
                "areaServed": "GA",
                "availableLanguage": "French"
              },
              "sameAs": [
                "https://www.facebook.com/nflgabon"
              ]
            }
          `}
        </script>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://nfl-ga.com",
              "name": "NFL-GA",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://nfl-ga.com/events?q={search_term_string}",
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
      <section className="relative min-h-screen lg:h-screen flex items-center justify-center overflow-hidden bg-[#150805] pt-24 lg:pt-0">
        {/* Background images slideshow with reduced opacity for texture */}
        <div className="absolute inset-0 z-0 opacity-45 pointer-events-none">
          {heroImages.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt="NFL Courtier & service background"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${heroIndex === idx ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
        
        {/* Dark overlays and rich gold lighting gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b0a06]/95 via-[#1b0a06]/85 to-background z-0 pointer-events-none" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#32140c]/40 rounded-full blur-[150px] pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 container mx-auto px-4 w-full py-12 lg:py-0">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Column Left: Louise Portrait & Event Card */}
            <div className="lg:col-span-5 relative flex flex-col items-center lg:items-start order-2 lg:order-1 w-full max-w-[500px] mx-auto lg:max-w-none animate-float">
              {/* Main portrait photo frame */}
              <div className="relative w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-gold/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] group bg-[#32140c]/20">
                <img 
                  src={louisePhoto} 
                  alt="LOUISE AUDYLL Ongoum" 
                  className="w-full h-[480px] sm:h-[580px] lg:h-[640px] object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                />
                {/* Bottom gradient fade inside image container */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#150805] via-transparent to-transparent opacity-95" />
                
                {/* Bottom Overlay Event Card */}
                <div className="absolute bottom-5 left-5 right-5 bg-[#32140c]/90 backdrop-blur-md border border-gold/20 p-4 sm:p-5 rounded-2xl text-left z-20 shadow-2xl">
                  {upcomingEvents.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">
                          Prochain Séminaire
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <h4 className="text-white font-bold text-sm sm:text-base mb-2 line-clamp-1">
                        {upcomingEvents[0].title}
                      </h4>
                      <p className="text-white/60 text-[10px] sm:text-xs mb-3 font-medium">
                        Date : {new Date(upcomingEvents[0].date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <Button 
                        variant="gold" 
                        size="sm" 
                        className="rounded-full px-4 h-8 text-[11px] font-bold w-full sm:w-auto" 
                        asChild
                      >
                        <Link to={`/event/${upcomingEvents[0].slug || upcomingEvents[0].id}`}>
                          Réserver ma place
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em] block mb-1">
                        Catalogue Formations
                      </span>
                      <h4 className="text-white font-bold text-sm sm:text-base mb-2">
                        Développez la Performance
                      </h4>
                      <p className="text-white/60 text-[10px] sm:text-xs mb-3 font-medium">
                        Parcours de montée en compétences.
                      </p>
                      <Button 
                        variant="gold" 
                        size="sm" 
                        className="rounded-full px-4 h-8 text-[11px] font-bold w-full sm:w-auto" 
                        asChild
                      >
                        <Link to="/catalogue-formations">
                          Découvrir le catalogue
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Column Right: Main Headers and descriptions */}
            <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-left order-1 lg:order-2 w-full lg:pl-4">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-xl">
                L'exigence du <span className="text-gradient-gold">Résultat.</span>
              </h1>

              <div className="space-y-4">
                <h3 className="text-gold font-semibold text-lg sm:text-xl md:text-2xl leading-snug max-w-2xl">
                  Transformez vos managers en leaders inspirants et vos commerciaux en experts du closing.
                </h3>
                <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed">
                  Louise Audyll Ongoum accompagne depuis plus de 30 ans les directions générales, directions commerciales et équipes de vente vers l'excellence. Une approche terrain, des résultats mesurables.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  variant="gold" 
                  size="lg" 
                  className="w-full sm:w-auto text-sm sm:text-base rounded-full px-8 h-12 sm:h-14 shadow-lg shadow-gold/20 font-bold hover:scale-105 transition-transform text-[#32140c]" 
                  onClick={() => {
                    const targetId = upcomingEvents.length > 0 ? "evenements" : "evenements-passes";
                    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Découvrir les Séminaires / Masterclass <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-[#32140c]" />
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Right Social Links in Hero Section */}
        <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-5 text-white/50 z-20">
          <a href="https://www.facebook.com/nflgabon" target="_blank" rel="noreferrer" className="hover:text-gold hover:scale-115 transition-all duration-300">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-gold hover:scale-115 transition-all duration-300">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-gold hover:scale-115 transition-all duration-300">
            <Instagram className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* 2. NEXT DATES */}
      {upcomingEvents.length > 0 && (
        <section id="evenements" className={`${upcomingEvents.length === 1 ? "py-12 pb-16" : "py-20"} bg-background relative z-10`}>
          <div className="container mx-auto px-4">
            {upcomingEvents.length === 1 ? (
              <div className="flex flex-col md:flex-row items-center gap-10 bg-card/30 p-8 md:p-12 rounded-[2.5rem] border border-gold/10 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-0 pointer-events-none" />
                <div className="flex-1 space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-bold uppercase tracking-widest border border-gold/20">
                    Prochaine Date
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
                    Notre prochain <span className="text-gradient-gold">rendez-vous</span>
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-md">
                    Ne manquez pas notre prochaine session de formation. Une opportunité unique de booster vos compétences.
                  </p>
                  {/* <div className="pt-2">
                    <Button variant="gold" size="lg" className="rounded-full px-8 h-12 shadow-lg shadow-gold/10" asChild>
                      <Link to="/events">Voir tous les événements <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div> */}
                </div>
                <div className="w-full md:w-[400px] shrink-0 relative z-10 transform transition-transform group-hover:scale-[1.02] duration-500">
                  <EventCard event={upcomingEvents[0]} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div className="max-w-2xl">
                    <h2 className="font-display text-4xl font-bold text-foreground">Prochaines <span className="text-gradient-gold">dates</span></h2>
                    <p className="text-muted-foreground text-lg mt-4">Inscrivez-vous à nos séminaires et masterclass à venir.</p>
                  </div>
                  {/* <Button variant="gold" size="lg" className="rounded-full px-6" asChild>
                    <Link to="/events">Voir tous les événements <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button> */}
                </div>
                {isLoading ? (
                  <div className="flex justify-center py-10 w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                  </div>
                ) : (
                  <div 
                    ref={scrollRefUpcoming}
                    onMouseEnter={() => setIsHoveredUpcoming(true)}
                    onMouseLeave={() => setIsHoveredUpcoming(false)}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 -mx-4 px-4 scrollbar-hide"
                  >
                    {homeUpcomingEvents.map((event, i) => (
                      <div 
                        key={event.id} 
                        className="animate-fade-in w-[85vw] snap-center sm:w-auto sm:min-w-[60%] md:min-w-[45%] lg:min-w-[23%] flex-shrink-0" 
                        style={{ animationDelay: `${Math.min(i * 80, 300)}ms` }}
                      >
                        <EventCard event={event} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* 3. EVENEMENTS PASSES */}
      <section id="evenements-passes" className="py-20 bg-background/50 relative overflow-hidden">
        {/* Background glow for depth */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-bold uppercase tracking-widest border border-gold/20 mb-3">
              Historique des succès
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
              Événements <span className="text-gradient-gold">passés</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mt-4 max-w-2xl mx-auto">
              Retrouvez les temps forts, les thématiques et les dynamiques de nos sessions de formation précédentes.
            </p>
          </div>

          {/* Smooth linear scroll on mobile, responsive grid on desktop */}
          <div 
            ref={scrollRefPast}
            onScroll={handlePastScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 scrollbar-hide lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0"
          >
            {homePastEvents.map((event, i) => {
              const image = event.image_url || event.image || categoryImages[event.category] || nflImg1;
              return (
                <Link
                  key={event.id}
                  to={`/event/${event.slug || event.id}`}
                  className="group relative overflow-hidden rounded-[2rem] border border-gold/15 hover:border-gold/45 bg-[#1b0a06]/20 aspect-[4/5] sm:aspect-[3/4] flex flex-col justify-end p-5 sm:p-6 shadow-xl hover:shadow-[0_20px_45px_-15px_rgba(199,157,79,0.15)] transition-all duration-500 animate-fade-in w-[80vw] sm:w-[45vw] lg:w-auto snap-center flex-shrink-0 lg:flex-shrink-1"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Background Event Image with custom hover zoom & filter */}
                  <img
                    src={image}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-[1.05] grayscale-[10%] group-hover:scale-110 group-hover:brightness-[0.8] transition-all duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                  {/* Header Badge */}
                  <div className="flex items-center justify-between mb-3 relative z-10 w-full">
                    <span className="text-[9px] font-black tracking-widest text-gold bg-[#32140c]/90 px-3 py-1 rounded-full border border-gold/20 uppercase">
                      {event.category}
                    </span>
                    <span className="text-[9px] font-black text-[#150805] bg-white border border-white/90 px-2.5 py-0.5 rounded-full uppercase tracking-widest relative z-25">
                      Clôturé
                    </span>
                  </div>

                  {/* Event Title */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-4 group-hover:text-gold transition-colors line-clamp-2 relative z-10 leading-tight">
                    {event.title}
                  </h3>

                  {/* Date & Location */}
                  <div className="flex flex-col gap-1.5 text-white/70 text-[11px] font-medium relative z-10">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Premium visual call to action at the bottom of the card */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-gold font-bold text-xs relative z-10 group-hover:text-white transition-colors">
                    <span>Revoir les détails</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}

            {/* "See All" Card styled to perfectly match the grid */}
            <div className="animate-fade-in aspect-[4/5] sm:aspect-[3/4] w-[80vw] sm:w-[45vw] lg:w-auto snap-center flex-shrink-0 lg:flex-shrink-1" style={{ animationDelay: `${homePastEvents.length * 100}ms` }}>
              <Link
                to="/events"
                className="group relative overflow-hidden rounded-[2rem] border border-gold/15 hover:border-gold/45 bg-gradient-to-br from-[#32140c]/40 to-[#1b0a06]/40 p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-6 transition-all duration-500 hover:shadow-[0_20px_45px_-15px_rgba(199,157,79,0.15)] h-full w-full"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,157,79,0.05),transparent_70%)] pointer-events-none" />
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-gold/20 transition-all duration-300">
                  <ArrowRight className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">Tous les événements</h3>
                  <p className="text-white/60 text-xs max-w-[200px] mx-auto leading-relaxed">
                    Explorez l'ensemble de notre historique et de nos réalisations.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Dots Pagination Indicators for Mobile View */}
          <div className="flex justify-center items-center gap-2 mt-6 lg:hidden">
            {Array.from({ length: homePastEvents.length + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (scrollRefPast.current) {
                    const itemWidth = scrollRefPast.current.scrollWidth / (homePastEvents.length + 1);
                    scrollRefPast.current.scrollTo({
                      left: idx * itemWidth,
                      behavior: "smooth"
                    });
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${activePastIndex === idx ? "w-6 bg-gold" : "w-2 bg-gold/30"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER */}
      <section id="newsletter" className="py-20 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-3xl mx-auto text-center glass-card p-10 md:p-14 rounded-[2.5rem] border border-gold/30 shadow-2xl bg-background/60 backdrop-blur-xl">
            <Mail className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">La Minute Excellence</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Recevez 2 fois par mois des conseils pratiques pour booster votre performance commerciale et managériale.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <Input 
                type="email" 
                placeholder="Entrez votre adresse email" 
                className="h-14 bg-background border-gold/20 focus-visible:ring-gold rounded-xl px-6 text-base shadow-sm" 
                value={newsletterEmail} 
                onChange={e => setNewsletterEmail(e.target.value)} 
                required 
              />
              <Button type="submit" variant="gold" className="h-14 px-8 rounded-xl font-bold shadow-lg shadow-gold/20" disabled={isNewsletterLoading}>
                {isNewsletterLoading ? "Inscription..." : "S'abonner"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* 5. CATALOGUE DE FORMATIONS COMMERCIALES */}
      <section id="formations" className="py-16 md:py-24 bg-background border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Image / Graphic Side */}
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gold/10 rounded-[2.5rem] transform -rotate-3 scale-105 -z-10" />
              <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-gold/20 shadow-2xl relative bg-card/80 backdrop-blur-md">
                <h3 className="text-2xl font-display font-bold text-foreground mb-6">La promesse NFL</h3>
                <ul className="space-y-6">
                  {[
                    { title: "Structuration des compétences", desc: "Bâtir des bases solides pour chaque profil." },
                    { title: "Professionnalisation des pratiques", desc: "Élever le niveau d'exigence et de maîtrise." },
                    { title: "Ancrage terrain et résultats", desc: "Des KPI mesurables et un impact business direct." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-1">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Text Content Side */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-bold uppercase tracking-widest border border-gold/20 mb-6">
                  Nouveauté
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Catalogue de <span className="text-gradient-gold">formations commerciales</span>
                </h2>
                <h3 className="text-xl md:text-2xl font-semibold text-foreground/80 mb-6 leading-snug">
                  Développer durablement la performance commerciale, à chaque étape de maturité.
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Nos formations commerciales sont conçues comme de véritables parcours de montée en
                  compétences, alignés sur les enjeux business des entreprises.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                  Elles accompagnent les équipes commerciales depuis la prise de poste jusqu'au pilotage
                  stratégique de la performance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="gold" size="lg" className="rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-gold/20 hover:scale-105 transition-transform w-full sm:w-auto" asChild>
                  <Link to="/catalogue-formations">Découvrir les parcours</Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base font-bold bg-background/50 border-gold/30 hover:bg-gold/10 w-full sm:w-auto" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                  Parcours sur mesure
                </Button>
              </div>
            </div>
            
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

      {/* 7. BIOGRAPHIE (Présentation personnelle) 
      <section id="biographie" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto glass-card rounded-[2.5rem] p-8 md:p-12 border border-gold/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -z-10" />
            
            <div className="grid lg:grid-cols-5 gap-10 items-center">
              <div className="lg:col-span-2 relative">
                <div className="absolute inset-0 bg-gold/20 rotate-[-4deg] rounded-[2rem]" />
                <div className="rounded-[2rem] overflow-hidden border border-gold/20 shadow-2xl relative z-10 transform transition-transform hover:scale-[1.02] duration-500">
                  <img src={louisePhoto} alt="LOUISE AUDYLL Ongoum" className="w-full h-[450px] object-cover object-top" />
                </div>
              </div>
              <div className="lg:col-span-3 lg:pl-6">
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  LOUISE AUDYLL <span className="text-gradient-gold">Ongoum</span>
                </h2>
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Avec plus de 30 années d'expérience accumulée sur le terrain, LOUISE AUDYLL accompagne 
                    les dirigeants, les équipes commerciales et les collaborateurs vers le dépassement d'eux-mêmes.
                  </p>
                  <p>
                    NFL Courtier & Service n'est pas qu'un simple cabinet de conseils. C'est l'aboutissement 
                    d'une trajectoire dédiée à <strong>l'excellence opérationnelle</strong>. L'objectif est clair : transformer 
                    le potentiel brut en résultats mesurables et impacter durablement les écosystèmes des entreprises.
                  </p>
                  <p>
                    <em>"Le succès n'est pas le fruit du hasard, mais de la rigueur, de l'apprentissage continu et 
                    d'une résilience sans faille."</em>
                  </p>
                </div>
                <div className="mt-8">
                  <div className="inline-flex items-center gap-4 bg-background border border-gold/20 px-6 py-3 rounded-full">
                    <span className="font-bold text-gold">Fondatrice & Experte Leadership</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* 8. CONTACT */}
      <section id="contact" className="py-24 bg-card relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Prêt à <span className="text-gradient-gold">collaborer ?</span></h2>
                  <p className="text-muted-foreground text-lg">
                    Contactez-nous pour toute demande de formation privée, d'audit de votre force de vente, ou pour toute question concernant nos masterclass.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                     <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-gold" />
                     </div>
                     <div>
                        <h4 className="font-bold text-lg">Nos bureaux</h4>
                        <p className="text-muted-foreground">Libreville, Gabon</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-gold" />
                     </div>
                     <div>
                        <h4 className="font-bold text-lg">Email direct</h4>
                        <a href="mailto:seminaireslao@outlook.fr" className="text-muted-foreground hover:text-gold transition-colors">seminaireslao@outlook.fr</a>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-gold" />
                     </div>
                     <div>
                        <h4 className="font-bold text-lg">Téléphone</h4>
                        <p className="text-muted-foreground">+241 066 69 23 38</p>
                     </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 md:p-10 rounded-3xl border border-gold/20 shadow-xl bg-background/80">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Prénom & Nom</label>
                      <Input 
                        required 
                        className="border-border/50 focus-visible:ring-gold bg-background/50 h-12" 
                        placeholder="Jean Dupont"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Email</label>
                      <Input 
                        type="email" 
                        required 
                        className="border-border/50 focus-visible:ring-gold bg-background/50 h-12" 
                        placeholder="jean@entreprise.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Sujet</label>
                    <Input 
                      required 
                      className="border-border/50 focus-visible:ring-gold bg-background/50 h-12" 
                      placeholder="Demande de devis" 
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Message</label>
                    <Textarea 
                      required 
                      className="border-border/50 focus-visible:ring-gold bg-background/50 min-h-[150px] resize-none" 
                      placeholder="Détaillez votre besoin ici..." 
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>
                  <Button type="submit" variant="gold" className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-gold/10" disabled={isSubmittingContact}>
                    {isSubmittingContact ? "Envoi en cours..." : "Envoyer le message"} <Send className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
