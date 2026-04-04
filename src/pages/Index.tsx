import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import heroImage0 from "@/assets/nfl img2.jpeg";
import heroImage1 from "@/assets/nfl img 4.jpeg";
import heroImage2 from "@/assets/nfl img 5.jpeg";
import heroImage3 from "@/assets/nfl img 6.jpeg";
import heroImage4 from "@/assets/nfl img3.jpeg";
import louisePhoto from "@/assets/louise2.jpeg";
import tourismeImage from "@/assets/nfl-tourisme.jpg";
import voyageImage from "@/assets/voyages-nfl-img.avif";
import logistiqueImage from "@/assets/logistique-nfl.webp";
import { useQuery } from "@tanstack/react-query";
import { EventsAPI, type Event } from "@/lib/api";

const Index = () => {
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const heroImages = [heroImage0, heroImage1, heroImage2, heroImage3, heroImage4];
  const { data: upcomingEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ["upcomingEvents"],
    queryFn: EventsAPI.getUpcoming,
  });

  const homeEvents = upcomingEvents.slice(0, 4);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
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
        <div className="relative z-10 text-center px-4 space-y-8 animate-fade-in max-w-5xl mx-auto mt-12">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-tight tracking-tight drop-shadow-xl">
            NFL Courtier & Service
            <br />
            <span className="text-gradient-gold inline-block mt-2">Événements, voyages et mobilité</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg md:text-xl max-w-3xl mx-auto font-light">
            Nous organisons vos séminaires et formations, gérons vos besoins de transport et développons des circuits touristiques au Gabon comme à l'étranger.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gold" size="lg" className="w-full sm:w-auto text-base rounded-full px-8 h-14" onClick={() => document.getElementById("evenements")?.scrollIntoView({ behavior: "smooth" })}>
              Découvrir nos activités <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base rounded-full px-8 h-14 bg-background/10 backdrop-blur-md text-[#32140c] border-primary-foreground/20 hover:bg-background/20 font-bold" onClick={() => document.getElementById("evenements")?.scrollIntoView({ behavior: "smooth" })}>
              Réserver un événement
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto glass-card rounded-3xl p-8 md:p-12 border border-gold/20 animate-fade-in">
            <div className="grid lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-2">
                <div className="rounded-3xl overflow-hidden border border-gold/20 shadow-xl">
                  <img src={louisePhoto} alt="LOUISE AUDYLL Ongoum" className="w-full h-[420px] object-cover" />
                </div>
              </div>
              <div className="lg:col-span-3">
                <h2 className="font-display text-4xl font-bold text-foreground">
                  Qui <span className="text-gradient-gold">sommes nous ?</span>
                </h2>
                <p className="text-muted-foreground text-lg mt-5 leading-relaxed">
                  NFL Courtier & Service accompagne les entreprises, institutions et particuliers
                  dans l'organisation d'activités professionnelles et de mobilité. Notre objectif
                  est d'offrir un service fiable, clair et bien exécuté, du cadrage initial jusqu'à la livraison finale.
                </p>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Sous l'impulsion de <strong>LOUISE AUDYLL Ongoum</strong>, l'équipe développe une
                  approche orientée terrain : écoute client, coordination rigoureuse et suivi de qualité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="evenements" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl font-bold text-foreground">Événements <span className="text-gradient-gold">à réserver</span></h2>
              <p className="text-muted-foreground text-lg mt-4">Cliquez sur un événement pour suivre le nouveau parcours de réservation en 3 étapes.</p>
            </div>
            <Button variant="gold" size="lg" className="rounded-full px-6" asChild>
              <Link to="/events">Voir le catalogue complet <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:snap-none md:mx-0 md:px-0">
              {homeEvents.map((event, i) => (
                <div key={event.id} className="animate-fade-in min-w-[85%] snap-start sm:min-w-[60%] md:min-w-0" style={{ animationDelay: `${Math.min(i * 80, 300)}ms` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="vehicules-logistique" className="py-20 bg-card relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
            <h2 className="font-display text-4xl font-bold text-foreground">Véhicules & <span className="text-gradient-gold">logistique</span></h2>
            <p className="text-muted-foreground text-lg mt-4">Mise à disposition de véhicules, location, coordination terrain et solutions logistiques adaptées à vos opérations.</p>
          </div>
          <article className="glass-card rounded-3xl p-8 md:p-10 border border-gold/20 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="font-display text-3xl font-bold">Un service opérationnel et flexible</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nous structurons les déplacements de vos équipes et de vos invités avec une exécution
                  rigoureuse : planification des itinéraires, gestion des horaires et suivi en temps réel.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  L'objectif est simple : fiabiliser votre logistique pour que vos opérations et vos
                  événements se déroulent sans friction.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm font-medium text-gold-dark shadow-sm transition-all hover:scale-105 hover:bg-gold/15 animate-fade-in animate-delay-1">Mise à disposition de véhicules</div>
                  <div className="rounded-xl border border-brown/20 bg-brown/5 p-3 text-sm font-medium text-brown-light shadow-sm transition-all hover:scale-105 hover:bg-brown/10 animate-fade-in animate-delay-2">Location courte et longue durée</div>
                  <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-sm font-medium text-gold shadow-sm transition-all hover:scale-105 hover:bg-gold/10 animate-fade-in animate-delay-3">Coordination terrain</div>
                  <div className="rounded-xl border border-brown/10 bg-brown/5 p-3 text-sm font-medium text-brown shadow-sm transition-all hover:scale-105 hover:bg-brown/10 animate-fade-in animate-delay-4">Support opérationnel</div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64 rounded-full border-2 border-gold/30 bg-gold/5 flex items-center justify-center overflow-hidden shadow-2xl animate-float">
                  <div className="absolute inset-0 w-full h-full rounded-full border border-gold/20 animate-ping opacity-30" />
                  <img 
                    src={logistiqueImage} 
                    alt="Logistique NFL" 
                    className="w-full h-full object-cover rounded-full transition-transform hover:scale-110 duration-700 animate-slow-zoom" 
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="agence-voyage" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
            <h2 className="font-display text-4xl font-bold text-foreground">Agence de <span className="text-gradient-gold">voyage</span></h2>
            <p className="text-muted-foreground text-lg mt-4">Organisation de voyages, achat et vente de titres de transport, accompagnement administratif et coordination globale.</p>
          </div>
          <article className="glass-card rounded-3xl p-8 md:p-10 border border-gold/20 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative w-64 h-64 rounded-full border-2 border-gold/30 bg-gold/5 flex items-center justify-center overflow-hidden shadow-2xl animate-float">
                  <div className="absolute inset-0 w-full h-full rounded-full border border-gold/20 animate-ping opacity-30" />
                  <img 
                    src={voyageImage} 
                    alt="Voyages NFL" 
                    className="w-full h-full object-cover rounded-full transition-transform hover:scale-110 duration-700 animate-slow-zoom" 
                  />
                </div>
              </div>
              <div className="space-y-4 order-1 lg:order-2">
                <h3 className="font-display text-3xl font-bold">Des déplacements mieux planifiés</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nous accompagnons les particuliers et les entreprises dans la préparation de leurs voyages
                  avec des solutions pratiques, transparentes et adaptées au contexte local.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  De la réservation des titres de transport à l'assistance logistique, nous veillons
                  à ce que chaque étape du trajet soit anticipée.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-brown/20 bg-brown/5 p-3 text-sm font-medium text-brown-light shadow-sm transition-all hover:scale-105 hover:bg-brown/10 animate-fade-in animate-delay-1">Billets air, mer et terre</div>
                  <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-sm font-medium text-gold-dark shadow-sm transition-all hover:scale-105 hover:bg-gold/10 animate-fade-in animate-delay-2">Conseil itinéraire</div>
                  <div className="rounded-xl border border-brown/10 bg-brown/5 p-3 text-sm font-medium text-brown shadow-sm transition-all hover:scale-105 hover:bg-brown/10 animate-fade-in animate-delay-3">Appui administratif</div>
                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm font-medium text-gold shadow-sm transition-all hover:scale-105 hover:bg-gold/15 animate-fade-in animate-delay-4">Assistance client</div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="tourisme" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
            <h2 className="font-display text-4xl font-bold text-foreground">Tourisme</h2>
            <p className="text-muted-foreground text-lg mt-4">Conception et vente de circuits touristiques au Gabon et à l'étranger, avec accueil des voyageurs et services associés.</p>
          </div>
          <article className="glass-card rounded-3xl p-8 md:p-10 border border-gold/20 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="font-display text-3xl font-bold">Expériences touristiques encadrées</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nous créons des circuits touristiques qui valorisent les destinations locales et internationales,
                  avec une expérience pensée pour le confort et la sécurité des voyageurs.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Notre équipe coordonne l'accueil, les déplacements et la logistique afin d'offrir
                  des parcours fluides et mémorables.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm font-medium text-gold-dark shadow-sm transition-all hover:scale-105 hover:bg-gold/15 animate-fade-in animate-delay-1">Circuits au Gabon</div>
                  <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-sm font-medium text-gold shadow-sm transition-all hover:scale-105 hover:bg-gold/10 animate-fade-in animate-delay-2">Destinations internationales</div>
                  <div className="rounded-xl border border-gold/10 bg-gold/5 p-3 text-sm font-medium text-gold-dark shadow-sm transition-all hover:scale-105 hover:bg-gold/10 animate-fade-in animate-delay-3">Accueil des voyageurs</div>
                  <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm font-medium text-gold shadow-sm transition-all hover:scale-105 hover:bg-gold/15 animate-fade-in animate-delay-4">Services touristiques connexes</div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64 rounded-full border-2 border-gold/30 bg-gold/5 flex items-center justify-center overflow-hidden shadow-2xl animate-float">
                  <div className="absolute inset-0 w-full h-full rounded-full border border-gold/20 animate-ping opacity-30" />
                  <img 
                    src={tourismeImage} 
                    alt="Tourisme NFL" 
                    className="w-full h-full object-cover rounded-full transition-transform hover:scale-110 duration-700 animate-slow-zoom" 
                  />
                </div>
              </div>
            </div>
          </article>
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
