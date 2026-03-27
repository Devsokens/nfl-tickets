import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import { mockEvents } from "@/lib/mockData";
import heroImage from "@/assets/hero-nfl.jpg";
import eventSoiree from "@/assets/event-soiree.jpg";
import louiseImage from "@/assets/louise.jpeg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Building2, Ticket, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

const Index = () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);

  const homeEvents = mockEvents
    .filter((e) => new Date(e.date) >= threeDaysAgo)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="NFL Courtier & service"
          width={1920}
          height={1080}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-background" />
        <div className="relative z-10 text-center px-4 space-y-8 animate-fade-in max-w-4xl mx-auto mt-12">
          <Badge className="bg-gold/20 text-gold hover:bg-gold/30 mb-4 px-4 py-1.5 text-sm uppercase tracking-wider backdrop-blur-md border border-gold/30">
            L'excellence au Gabon
          </Badge>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-tight tracking-tight drop-shadow-xl">
            Des moments <br />
            <span className="text-gradient-gold inline-block mt-2">d'exception</span>
          </h1>
          <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Découvrez, réservez et vivez vos événements avec NFL Courtier &amp; Service. 
            L'élégance à portée de main à Libreville et partout au Gabon.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gold"
              size="lg"
              className="w-full sm:w-auto text-base rounded-full px-8 h-14"
              onClick={() =>
                document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Voir les événements <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base rounded-full px-8 h-14 bg-background/10 backdrop-blur-md text-primary-foreground border-primary-foreground/20 hover:bg-background/20"
              onClick={() =>
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-card relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-display text-4xl font-bold text-foreground">
                  À propos de <span className="text-gradient-gold">NFL</span>
                </h2>
                <div className="w-20 h-1 bg-gold rounded-full" />
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Basé à Libreville, **NFL Courtier & Service** est votre partenaire privilégié pour l'organisation 
                  et la participation à des événements d'envergure au Gabon. Nous mettons notre expertise 
                  et notre réseau local à votre disposition.
                </p>
              </div>

              {/* Key Figures */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
                <div className="text-center p-4 rounded-2xl bg-background/50 border border-border/50">
                  <p className="text-3xl font-bold text-gold font-display">1500+</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Billets vendus</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-background/50 border border-border/50">
                  <p className="text-3xl font-bold text-gold font-display">50+</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Événements</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-background/50 border border-border/50 col-span-2 md:col-span-1">
                  <p className="text-3xl font-bold text-gold font-display">100%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Satisfaction</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="p-2 rounded-full bg-gold/10 text-gold mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground italic">Organisation de classe mondiale</h4>
                    <p className="text-muted-foreground text-sm">Nous gérons tout, de la logistique à la billetterie sécurisée.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-2 rounded-full bg-gold/10 text-gold mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground italic">Réseau d'exception au Gabon</h4>
                    <p className="text-muted-foreground text-sm">Accès aux lieux les plus prestigieux de Libreville et Port-Gentil.</p>
                  </div>
                </div>
              </div>

              {/* CEO Section */}
              <div className="mt-8 p-6 bg-secondary/30 rounded-3xl border border-gold/10 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl flex-shrink-0" />
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold flex-shrink-0 shadow-lg relative z-10">
                  <img src={louiseImage} alt="Louise Odyll Ongoum" className="w-full h-full object-cover" />
                </div>
                <div className="text-center sm:text-left relative z-10">
                  <h4 className="font-display text-xl font-bold text-foreground">LOUISE ODYLL Ongoum</h4>
                  <p className="text-gold text-sm font-semibold mb-3 uppercase tracking-wider">Fondatrice & CEO</p>
                  <p className="text-muted-foreground text-sm italic">
                    "Notre mission est de redéfinir l'excellence événementielle au Gabon. Chaque détail compte pour créer des moments inoubliables pour nos partenaires et clients."
                  </p>
                </div>
              </div>

            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-border/50">
                <img src={eventSoiree} alt="NFL Expertise" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-primary-foreground p-6 glass-card rounded-xl">
                  <Ticket className="w-8 h-8 text-gold mb-3" />
                  <h3 className="font-display text-xl font-bold mb-1">Billetterie Officielle</h3>
                  <p className="text-sm text-primary-foreground/80">Réservez vos places en toute sécurité au Gabon.</p>
                </div>
              </div>
              <div className="absolute top-10 -right-10 bottom-10 -left-10 border-2 border-gold/20 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Events Scroll Section */}
      <section id="events" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-bold text-foreground">
              Événements <span className="text-gradient-gold">récents</span>
            </h2>
            <div className="w-20 h-1 bg-gold rounded-full mt-6 mb-6" />
            <p className="text-muted-foreground text-lg">
              Parcourez nos derniers événements ajoutés à Libreville.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <div className="hidden md:flex gap-2 mr-4">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className="rounded-full border-gold/20 text-gold hover:bg-gold/10 disabled:opacity-30"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className="rounded-full border-gold/20 text-gold hover:bg-gold/10 disabled:opacity-30"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            <Button variant="gold" size="lg" className="rounded-full shadow-md px-6 hidden md:flex" asChild>
              <Link to="/events">Voir tout le catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>

        {/* Embla Carousel */}
        <div className="embla px-4 md:px-8 xl:px-[calc((100vw-1280px)/2)] relative">
          <div 
            className="embla__viewport overflow-hidden cursor-grab active:cursor-grabbing" 
            ref={emblaRef}
            style={{ touchAction: 'pan-y' }}
          >
            <div className="embla__container flex gap-6 select-none">
              {homeEvents.map((event, i) => (
                <div 
                  key={event.id} 
                  className="embla__slide flex-none w-[85vw] sm:w-[350px] md:w-[400px]"
                >
                  <div className="h-full relative py-4">
                    <EventCard event={event} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8 md:hidden">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "bg-gold w-8" : "bg-gold/20"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 text-center mt-12 md:hidden">
          <Button variant="gold" size="lg" className="w-full rounded-full shadow-lg" asChild>
            <Link to="/events">Catalogue complet <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        {homeEvents.length === 0 && (
          <p className="text-center text-muted-foreground pt-4 pb-12">
            Aucun événement à afficher pour le moment au Gabon.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Index;
