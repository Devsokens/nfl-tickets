import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { mockEvents } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, MessageCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import eventSoiree from "@/assets/event-soiree.jpg";
import eventConference from "@/assets/event-conference.jpg";
import eventAtelier from "@/assets/event-atelier.jpg";
import eventConcert from "@/assets/event-concert.jpg";

const categoryImages: Record<string, string> = {
  soirée: eventSoiree,
  conférence: eventConference,
  atelier: eventAtelier,
  concert: eventConcert,
};

const EventDetail = () => {
  const { id } = useParams();
  
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);

  const event = mockEvents.find((e) => e.id === id);

  if (!event || new Date(event.date) < threeDaysAgo) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <h1 className="font-display text-4xl font-bold mb-4">Événement introuvable ou expiré</h1>
          <p className="text-muted-foreground mb-8">L'événement que vous cherchez n'existe pas ou n'est plus disponible.</p>
          <Button variant="gold" asChild>
            <Link to="/events">Retour au catalogue</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const image = event.image || categoryImages[event.category] || eventSoiree;
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

  const formattedDate = eventDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  const remaining = event.capacity - event.ticketsSold;

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);
    
    setTimeout(() => {
      const whatsappMessage = encodeURIComponent(
        `Bonjour ! Je souhaite m'inscrire à l'événement "${event.title}" du ${formattedDate}.\n\nMes informations :\nNom: ${formData.name}\nEmail: ${formData.email}\nTéléphone: ${formData.phone}`
      );
      const whatsappUrl = `https://wa.me/${event.whatsappNumber.replace("+", "")}?text=${whatsappMessage}`;
      window.open(whatsappUrl, "_blank");
      setIsRedirecting(false);
      setIsModalOpen(false);
    }, 2000); // 2 seconds delay to show the message
  };

  // Other active events for the sidebar
  const otherEvents = mockEvents
    .filter((e) => e.id !== id && new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voir tous les événements
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT: Event Details */}
          <div className="flex-1 lg:max-w-[800px] xl:max-w-[900px]">
            <div className={`relative h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden mb-8 shadow-2xl ${isPast ? 'grayscale-[30%]' : ''}`}>
              <img src={image} alt={event.title} className="w-full h-full object-cover" width={1920} height={800} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-gold text-accent-foreground border-0 px-3 py-1 text-sm">{event.category}</Badge>
                {isPast && (
                  <Badge variant="destructive" className="border-0 px-3 py-1 text-sm">Terminé</Badge>
                )}
              </div>
            </div>

            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">{event.title}</h1>
                  <p className="text-xl text-muted-foreground leading-relaxed">{event.description}</p>
                </div>
                <div className="shrink-0 text-left md:text-right">
                  <p className="text-gradient-gold font-display text-4xl font-bold mb-1">
                    {event.price.toLocaleString()} {event.currency}
                  </p>
                  {!isPast && (
                    <p className="text-sm text-muted-foreground">{remaining} places restantes / {event.capacity}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
                  <div className="p-3 bg-secondary rounded-xl shrink-0"><Calendar className="h-6 w-6 text-gold" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Date</p>
                    <p className="text-sm font-semibold capitalize">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
                  <div className="p-3 bg-secondary rounded-xl shrink-0"><MapPin className="h-6 w-6 text-gold" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Lieu</p>
                    <p className="text-sm font-semibold">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
                  <div className="p-3 bg-secondary rounded-xl shrink-0"><Clock className="h-6 w-6 text-gold" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Heure</p>
                    <p className="text-sm font-semibold">{event.time}</p>
                  </div>
                </div>
              </div>

              {!isPast && (
                <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex justify-between text-sm text-foreground font-medium mb-2">
                      <span>{event.ticketsSold} inscrits</span>
                      <span>{Math.round((event.ticketsSold / event.capacity) * 100)}% rempli</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-gold rounded-full transition-all duration-1000"
                        style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="gold" size="lg" className="w-full sm:w-auto shrink-0 rounded-full h-14 px-8 text-base shadow-lg shadow-gold/20">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Réserver ma place
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[30px] p-8">
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl text-gold text-center mb-2">Formulaire d'inscription</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleRegister} className="space-y-6 pt-4 text-left">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold">Événement choisi</Label>
                            <Input value={event.title} disabled className="bg-secondary/30 rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold">Nom du Client</Label>
                            <Input required placeholder="Ex: Marc Obiang" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-xl h-12 bg-secondary/10" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold">Email</Label>
                            <Input required type="email" placeholder="marc@email.ga" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-xl h-12 bg-secondary/10" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold">Téléphone (+241...)</Label>
                            <Input required placeholder="+241 077 12 34 56" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-12 bg-secondary/10" />
                          </div>
                        </div>
                        
                        {isRedirecting && (
                          <p className="text-sm text-gold animate-pulse text-center font-medium">
                            Vous êtes en train d'être redirigé vers WhatsApp...
                          </p>
                        )}

                        <Button 
                          type="submit" 
                          variant="gold" 
                          className="w-full h-14 text-base rounded-2xl shadow-xl font-bold uppercase tracking-wide"
                          disabled={isRedirecting}
                        >
                          {isRedirecting ? "Ouverture..." : "confirmer ma reservation"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Other Events Sidebar */}
          <div className="lg:w-[350px] xl:w-[400px] shrink-0">
            <div className="sticky top-24">
              <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                Autres événements
              </h3>
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-hide pr-2 pb-10">
                {otherEvents.map((evt) => (
                  <div key={evt.id} className="h-[320px]">
                     <EventCard event={evt} />
                  </div>
                ))}
                {otherEvents.length === 0 && (
                  <p className="text-muted-foreground text-sm">Aucun autre événement à venir.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
