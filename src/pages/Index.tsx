import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronUp, Calendar, Mail, MapPin, Phone, Send } from "lucide-react";
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

import { useQuery } from "@tanstack/react-query";
import { EventsAPI, NewsletterAPI, ContactAPI, type Event } from "@/lib/api";

const Index = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  
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
  const upcomingEvents = allEvents.filter(event => new Date(event.date).getTime() >= today);
  const pastEvents = allEvents.filter(event => new Date(event.date).getTime() < today);

  const homeUpcomingEvents = upcomingEvents.slice(0, 4);
  const homePastEvents = pastEvents.slice(0, 3);

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
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <section className="relative h-[86vh] flex items-center justify-center overflow-hidden">
        {heroImages.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt="NFL Courtier & service"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${heroIndex === idx ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#32140c]/90 via-[#32140c]/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,157,79,0.28),transparent_45%)]" />
        <div className="relative z-10 text-center px-4 space-y-8 animate-fade-in max-w-5xl mx-auto mt-6">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-tight tracking-tight drop-shadow-xl mb-4">
            L'exigence du <span className="text-gradient-gold">Résultat.</span>
          </h1>
          <div className="bg-background/20 backdrop-blur-sm p-6 rounded-2xl border border-gold/10 inline-block shadow-2xl">
            <h3 className="text-gold font-semibold text-xl md:text-2xl mb-3">
              Transformez vos managers en leaders inspirants et vos commerciaux en experts du closing.
            </h3>
            <p className="text-primary-foreground/90 text-base md:text-lg max-w-4xl mx-auto font-light leading-relaxed">
              LOUISE AUDYLL Ongoum accompagne depuis plus de 30 ans les directions générales, directions commerciales et équipes de vente vers l'excellence. Une approche terrain, des résultats mesurables.
            </p>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gold" size="lg" className="w-full sm:w-auto text-base rounded-full px-8 h-14 shadow-lg shadow-gold/20" asChild>
              <Link to="/formations">Formations <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base rounded-full px-8 h-14 bg-background/30 backdrop-blur-md text-white border-gold/30 hover:bg-gold/20 font-bold" onClick={() => document.getElementById("evenements")?.scrollIntoView({ behavior: "smooth" })}>
              Séminaires / Masterclass <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 2. NEXT DATES */}
      <section id="evenements" className="py-20 bg-background relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl font-bold text-foreground">Prochaines <span className="text-gradient-gold">dates</span></h2>
              <p className="text-muted-foreground text-lg mt-4">Inscrivez-vous à nos séminaires et masterclass à venir.</p>
            </div>
            <Button variant="gold" size="lg" className="rounded-full px-6" asChild>
              <Link to="/events">Voir tous les événements <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="glass-card p-12 text-center border border-gold/20 rounded-3xl">
              <p className="text-muted-foreground text-lg">Aucune date n'est prévue pour le moment. Abonnez-vous à la newsletter pour être informé des prochaines sessions.</p>
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
        </div>
      </section>

      {/* 3. EVENEMENTS PASSES */}
      <section id="evenements-passes" className="py-20 bg-card border-t border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-foreground">Événements <span className="text-gradient-gold">passés</span></h2>
            <p className="text-muted-foreground text-lg mt-4">Retrouvez les résumés et les temps forts de nos sessions précédentes.</p>
          </div>
          <div 
            ref={scrollRefPast}
            onMouseEnter={() => setIsHoveredPast(true)}
            onMouseLeave={() => setIsHoveredPast(false)}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 -mx-4 px-4 scrollbar-hide"
          >
            {homePastEvents.map((event, i) => (
              <div 
                key={event.id} 
                className="animate-fade-in w-[85vw] snap-center sm:w-auto sm:min-w-[60%] md:min-w-[45%] lg:min-w-[23%] flex-shrink-0" 
                style={{ animationDelay: `${Math.min(i * 80, 300)}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
            <div className="animate-fade-in w-[85vw] snap-center sm:w-auto sm:min-w-[60%] md:min-w-[45%] lg:min-w-[23%] flex-shrink-0 flex items-center justify-center">
              <Link to="/events" className="w-full h-full glass-card group p-8 rounded-3xl border border-gold/10 hover:border-gold/40 flex flex-col items-center justify-center text-center gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 min-h-[350px]">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-gold/2 transition-all duration-300">
                  <ArrowRight className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-bold text-xl text-foreground">Voir tous les événements passés</h3>
              </Link>
            </div>
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

      {/* 5. FORMATIONS PRIVEES */}
      <section id="formations" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="glass-card p-6 rounded-3xl border border-gold/20 bg-background/50 shadow-lg text-center h-48 flex flex-col items-center justify-center">
                  <h4 className="text-4xl font-display font-bold text-gradient-gold mb-2">+30</h4>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ans d'expertise</p>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-border bg-card shadow-lg flex flex-col justify-center h-64 relative overflow-hidden group hover:border-gold/30 transition-all">
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h4 className="font-bold mb-2 text-gold uppercase tracking-wide">Sur-mesure</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Des programmes adaptés à la réalité de votre secteur et aux défis spécifiques de vos équipes.
                  </p>
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="glass-card p-6 rounded-3xl border border-border bg-card shadow-lg flex flex-col justify-center h-64 relative overflow-hidden group hover:border-gold/30 transition-all">
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h4 className="font-bold mb-2 text-gold uppercase tracking-wide">Excellence</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Une approche focalisée sur le résultat mesurable et la transformation comportementale.
                  </p>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-gold/20 bg-background/50 shadow-lg text-center h-48 flex flex-col items-center justify-center">
                   <h4 className="text-4xl font-display font-bold text-foreground mb-2">100%</h4>
                   <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Orientée terrain</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Formations <span className="text-gradient-gold">Privées</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Nos formations privées s'adressent aux entreprises souhaitant un accompagnement intense et ciblé : 
                  direction générale, cadres dirigeants, managers intermédiaires et forces de vente.
                </p>
              </div>

              <ul className="space-y-5">
                {[
                  "Audit des compétences et définition des objectifs",
                  "Design de modules d'apprentissage interactifs",
                  "Mises en situation réelles et jeu de rôles",
                  "Suivi post-formation et mesure des KPI"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="h-6 w-6 rounded-full bg-gold/20 flex-shrink-0 flex items-center justify-center mt-1">
                      <div className="h-2 w-2 rounded-full bg-gold" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Button variant="gold" size="lg" className="rounded-full px-10 h-14 text-base font-bold shadow-lg shadow-gold/20 hover:scale-105 transition-transform" asChild>
                  <Link to="/formations">Voir plus</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
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

      {/* 7. BIOGRAPHIE (Présentation personnelle) */}
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

      {showBackToTop && (
        <Button variant="gold" size="icon" className="fixed bottom-8 right-8 z-[60] rounded-full w-12 h-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Index;
