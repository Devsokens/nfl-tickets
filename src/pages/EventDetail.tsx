import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { useQuery } from "@tanstack/react-query";
import { EventsAPI, TicketsAPI, type Event } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, Clock, CheckCircle2, Phone, Share2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import { Helmet } from "react-helmet-async";

import nflImg1 from "@/assets/nfl img1.jpeg";
import nflImg2 from "@/assets/nfl img2.jpeg";
import nflImg3 from "@/assets/nfl img3.jpeg";
import nflImg4 from "@/assets/nfl img 4.jpeg";
import airtelLogo from "@/assets/airtel.png";
import moovLogo from "@/assets/moov.png";

const categoryImages: Record<string, string> = {
  soirée: nflImg1,
  conférence: nflImg2,
  atelier: nflImg3,
  concert: nflImg4,
  seminaire: nflImg2,
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { toast } = useToast();
  
  const { data: event, isLoading: isEventLoading, isError } = useQuery<Event>({
    queryKey: ["event", id],
    queryFn: () => EventsAPI.getOne(id as string),
    enabled: !!id,
  });

  // Remplacer l'URL du navigateur par le slug si disponible
  useEffect(() => {
    if (event?.slug && id !== event.slug) {
      window.history.replaceState(null, '', `/event/${event.slug}`);
    }
  }, [event?.slug, id]);

  const { data: allUpcoming = [] } = useQuery<Event[]>({
    queryKey: ["upcomingEvents"],
    queryFn: () => EventsAPI.getAll(),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const quantity = 1;
  const [participants, setParticipants] = useState([{ fullName: "", email: "", phone: "" }]);
  const [paymentPending, setPaymentPending] = useState(false);

  const totalAmount = useMemo(() => (event?.price || 0) * quantity, [event?.price, quantity]);

  const updateParticipant = (index: number, field: "fullName" | "email" | "phone", value: string) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const isStep1Valid = participants[0].fullName.trim().length > 0 && participants[0].email.trim().length > 0 && participants[0].phone.trim().length > 0;

  if (isEventLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <h1 className="font-display text-4xl font-bold mb-4">Événement introuvable</h1>
          <p className="text-muted-foreground mb-8">L'événement que vous cherchez n'existe pas ou n'est plus disponible.</p>
          <Button variant="gold" asChild>
            <Link to="/events">Retour au catalogue</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const image = event.image_url || event.image || categoryImages[event.category] || nflImg1;
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

  const formattedDate = eventDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  const remaining = event?.capacity - (event?.ticketsSold || 0);

  const handleStep2 = () => {
    if (!isStep1Valid) return;
    setStep(2);
  };

  const handleShare = async () => {
    const eventLink = event?.slug ? event.slug : event?.id;
    const url = `${window.location.origin}/event/${eventLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || "Événement",
          text: `Découvrez cet événement : ${event?.title}`,
          url: url,
        });
      } catch (err) {
        console.log("Erreur de partage:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Lien copié !", description: "Le lien de l'événement a bien été copié dans votre presse-papier." });
      } catch (err) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de copier le lien." });
      }
    }
  };

  const handlePaymentDone = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const p = participants[0];
      await TicketsAPI.create({
        event_id: event.id,
        full_name: p.fullName,
        email: p.email,
        phone: p.phone,
        payer_phone: p.phone.trim(),
      });

      toast({
        title: "Réservation enregistrée !",
        description: "Redirection vers WhatsApp pour confirmer votre paiement...",
      });

      const message = `Bonjour NFL Courtier & Service,\n\n` +
                      `Je viens de réserver ma place pour l'événement : *${event.title}*.\n\n` +
                      `*Détails de ma réservation :*\n` +
                      `- *Date* : ${formattedDate}\n` +
                      `- *Montant* : ${totalAmount.toLocaleString()} FCFA\n` +
                      `- *Participant* : ${p.fullName}\n` +
                      `- *Téléphone* : ${p.phone}\n\n` +
                      `Merci de valider ma commande dès réception du transfert.`;

      const encodedMessage = encodeURIComponent(message);
      let whatsappNumber = (event as any).whatsapp_number || "24166692338";
      
      let cleanNumber = whatsappNumber.replace(/\D/g, "");
      if (cleanNumber.startsWith("2410")) {
        cleanNumber = "241" + cleanNumber.substring(4);
      } else if (cleanNumber.startsWith("0")) {
        cleanNumber = "241" + cleanNumber.substring(1);
      }

      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      setTimeout(() => {
        navigate("/");
        window.location.href = whatsappUrl;
      }, 1500);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Erreur lors de la réservation. Cet e-mail est peut-être déjà utilisé.";
      toast({
        variant: "destructive",
        title: "Réservation impossible",
        description: errorMsg,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{event ? `${event.title} | NFL Courtier & Service` : 'Événement | NFL Courtier & Service'}</title>
        <meta name="description" content={event ? `${event.description?.substring(0, 160)}...` : 'Découvrez les détails de cet événement NFL Courtier & Service au Gabon.'} />
        <meta property="og:title" content={event?.title} />
        <meta property="og:description" content={event?.description?.substring(0, 160)} />
        <meta property="og:image" content={event?.image_url || '/favicon.jpg'} />
      </Helmet>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gold font-bold hover:text-gold-dark transition-all bg-gold/5 px-4 py-2 rounded-full border border-gold/10 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Voir tous les événements
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Colonne GAUCHE : Visuel + Description */}
          <div className="flex-1 space-y-10 animate-fade-in w-full">
            <div className={`relative h-[45vh] md:h-[55vh] rounded-[2rem] overflow-hidden shadow-2xl bg-muted/20 ${isPast ? 'grayscale-[30%]' : ''}`}>
              <img src={image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              <button
                onClick={handleShare}
                className="absolute top-6 right-6 p-3.5 bg-background/80 hover:bg-background backdrop-blur-md rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 z-10 border border-border/50"
                title="Partager cet événement"
              >
                <Share2 className="h-5 w-5 text-gold" />
              </button>
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight tracking-tight">
                {event.title}
              </h1>
              <div className="text-xl text-muted-foreground leading-relaxed markdown-content">
                <ReactMarkdown 
                  components={{
                    p: ({node, ...props}) => <p className="mb-6 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-3" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-3" {...props} />,
                    li: ({node, ...props}) => <li className="pl-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />
                  }}
                >
                  {event.description}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Colonne DROITE : Actions + Infos */}
          <div className="lg:w-[480px] shrink-0 w-full lg:sticky lg:top-28 space-y-8">
            {/* Infos clés déplacées ici */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-5 p-5 rounded-3xl bg-secondary/40 border border-border/40 backdrop-blur-sm">
                <div className="p-4 bg-secondary rounded-2xl shrink-0 shadow-sm"><Calendar className="h-7 w-7 text-gold" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Date de l'événement</p>
                  <p className="text-base font-bold capitalize">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-5 rounded-3xl bg-secondary/40 border border-border/40 backdrop-blur-sm">
                <div className="p-4 bg-secondary rounded-2xl shrink-0 shadow-sm"><MapPin className="h-7 w-7 text-gold" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Lieu</p>
                  <p className="text-base font-bold">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-5 rounded-3xl bg-secondary/40 border border-border/40 backdrop-blur-sm">
                <div className="p-4 bg-secondary rounded-2xl shrink-0 shadow-sm"><Clock className="h-7 w-7 text-gold" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Heure</p>
                  <p className="text-base font-bold">{event.time}</p>
                </div>
              </div>
            </div>

            {/* Inscription / Statut */}
            {isPast ? (
              <div className="bg-muted/30 p-10 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center border border-border">
                  <Calendar className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-foreground">Événement terminé</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Les inscriptions sont closes pour cet événement. Découvrez nos prochaines sessions.
                  </p>
                </div>
                <Button variant="outline" asChild className="rounded-full px-10 h-12 font-bold">
                  <Link to="/events">Consulter l'agenda</Link>
                </Button>
              </div>
            ) : (
              <div className="bg-card p-10 rounded-[2.5rem] border border-border/50 shadow-2xl space-y-8 relative overflow-hidden ring-1 ring-gold/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-3xl font-black tracking-tight">Inscription</h3>
                  <div className="flex gap-1.5 font-mono text-[10px] font-bold">
                    <span className={`px-2 py-1 rounded-md ${step >= 1 ? 'bg-gold text-white' : 'bg-muted text-muted-foreground'}`}>1</span>
                    <span className={`px-2 py-1 rounded-md ${step >= 2 ? 'bg-gold text-white' : 'bg-muted text-muted-foreground'}`}>2</span>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-5">
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nom complet</Label>
                        <Input 
                          placeholder="Ex: Jean Mboulou" 
                          className="h-14 rounded-2xl bg-secondary/30 border-border/50 focus:ring-gold"
                          value={participants[0].fullName} 
                          onChange={(e) => updateParticipant(0, "fullName", e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
                        <Input 
                          type="email" 
                          placeholder="jean.mboulou@email.com" 
                          className="h-14 rounded-2xl bg-secondary/30 border-border/50 focus:ring-gold"
                          value={participants[0].email} 
                          onChange={(e) => updateParticipant(0, "email", e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp</Label>
                        <Input 
                          placeholder="+241 07 76 17 776" 
                          className="h-14 rounded-2xl bg-secondary/30 border-border/50 focus:ring-gold"
                          value={participants[0].phone} 
                          onChange={(e) => updateParticipant(0, "phone", e.target.value)} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="pt-4 space-y-5">
                      <div className="flex justify-between items-end px-1">
                        <span className="text-muted-foreground font-bold text-sm mb-1 uppercase tracking-tighter">Accès individuel</span>
                        <div className="text-right">
                          <span className="block text-3xl font-black text-gold leading-none">{event.price.toLocaleString()}</span>
                          <span className="text-xs font-bold text-gold/60 uppercase">{event.currency}</span>
                        </div>
                      </div>
                      <Button 
                        variant="gold" 
                        className="w-full h-16 rounded-[1.25rem] font-black text-xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all" 
                        onClick={handleStep2} 
                        disabled={!isStep1Valid}
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="p-6 rounded-3xl bg-secondary/50 border border-gold/10 space-y-3">
                      <div className="flex justify-between gap-4">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Événement</span>
                        <span className="text-sm font-bold text-right leading-tight">{event.title}</span>
                      </div>
                      <div className="pt-3 border-t border-border/50 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                        <span className="text-2xl font-black text-gold">{totalAmount.toLocaleString()} {event.currency}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-center text-muted-foreground uppercase tracking-[0.2em]">Paiement Mobile Money</p>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-secondary/30 p-5 rounded-[1.5rem] border border-border/50 flex items-center justify-between group hover:border-gold/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm overflow-hidden border border-border/40">
                              <img src={airtelLogo} alt="Airtel Money" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Airtel Money</p>
                              <p className="font-mono text-lg font-black tracking-tight text-foreground">077757383</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-gold hover:bg-gold/10 rounded-xl" onClick={() => { navigator.clipboard.writeText("077757383"); toast({ title: "Copié !" }); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-secondary/30 p-5 rounded-[1.5rem] border border-border/50 flex items-center justify-between group hover:border-gold/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm overflow-hidden border border-border/40">
                              <img src={moovLogo} alt="Moov Money" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Moov Money</p>
                              <p className="font-mono text-lg font-black tracking-tight text-foreground">066692338</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-gold hover:bg-gold/10 rounded-xl" onClick={() => { navigator.clipboard.writeText("066692338"); toast({ title: "Copié !" }); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-14 rounded-2xl font-bold border-border hover:bg-muted" onClick={() => setStep(1)}>Retour</Button>
                      <Button variant="gold" className="h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-600/20" onClick={handlePaymentDone} disabled={isSubmitting}>
                        {isSubmitting ? "Validation..." : "J'ai payé"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-center text-[11px] text-muted-foreground/60 font-medium px-10">
              En vous inscrivant, vous recevrez votre ticket par email après validation du paiement confirmée via whatsapp.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
