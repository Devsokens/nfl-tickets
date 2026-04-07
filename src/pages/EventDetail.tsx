import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { useQuery } from "@tanstack/react-query";
import { EventsAPI, TicketsAPI, type Event } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, Clock, CheckCircle2, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';

import nflImg1 from "@/assets/nfl img1.jpeg";
import nflImg2 from "@/assets/nfl img2.jpeg";
import nflImg3 from "@/assets/nfl img3.jpeg";
import nflImg4 from "@/assets/nfl img 4.jpeg";

const categoryImages: Record<string, string> = {
  soirée: nflImg1,
  conférence: nflImg2,
  atelier: nflImg3,
  concert: nflImg4,
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

  const { data: allUpcoming = [] } = useQuery<Event[]>({
    queryKey: ["upcomingEvents"],
    queryFn: EventsAPI.getUpcoming,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [quantity, setQuantity] = useState(1);
  const [payerPhone, setPayerPhone] = useState("");
  const [payerName, setPayerName] = useState("");
  const [participants, setParticipants] = useState([{ fullName: "", email: "" }]);
  const [paymentPending, setPaymentPending] = useState(false);

  const totalAmount = useMemo(() => (event?.price || 0) * quantity, [event?.price, quantity]);

  // Gére la taille du tableau des participants
  useEffect(() => {
    setParticipants((prev) => {
      if (prev.length === quantity) return prev;
      return Array.from({ length: quantity }, (_, idx) => ({
        fullName: prev[idx]?.fullName ?? "",
        email: prev[idx]?.email ?? "",
      }));
    });
  }, [quantity]);

  const handleStep2 = () => {
    // Pré-remplit le 1er participant avec le nom du payeur s'il est encore vide
    if (payerName.trim() && !participants[0]?.fullName.trim()) {
      setParticipants(prev => {
        const next = [...prev];
        next[0].fullName = payerName.trim();
        return next;
      });
    }
    setStep(2);
  };

  const updateParticipant = (index: number, field: "fullName" | "email", value: string) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const isStep2Valid = payerName.trim().length > 0 && payerPhone.trim().length > 0 && participants.every((p) => p.fullName.trim().length > 0 && p.email.trim().length > 0);

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

  const handleStep3 = () => {
    if (!isStep2Valid) return;
    setStep(3);
  };

  const handlePaymentDone = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await Promise.all(
        participants.map((p) =>
          TicketsAPI.create({
            event_id: event.id,
            full_name: p.fullName,
            email: p.email,
            phone: p.email,
            payer_phone: payerPhone.trim(),
          })
        )
      );

      toast({
        title: "Réservation enregistrée ! ✅",
        description: "Redirection vers WhatsApp pour confirmer votre paiement...",
      });

      const participantList = participants.map((p) => `  - ${p.fullName}`).join("\n");
      const message = `Bonjour NFL Courtier & Service,\n\n` +
                      `Je viens de réserver ${quantity} place(s) pour l'événement : *${event.title}*.\n\n` +
                      `*Détails de ma réservation :*\n` +
                      `- *Date* : ${formattedDate}\n` +
                      `- *Montant total* : ${totalAmount.toLocaleString()} FCFA\n` +
                      `- *Numéro de paiement* : ${payerPhone}\n\n` +
                      `*Participants :*\n${participantList}\n\n` +
                      `Merci de valider ma commande dès réception du transfert.`;

      const encodedMessage = encodeURIComponent(message);
      let whatsappNumber = (event as any).whatsapp_number || "24166692338";
      
      // Nettoyage : si ça commence par 2410, on enlève le 0
      let cleanNumber = whatsappNumber.replace(/\D/g, "");
      if (cleanNumber.startsWith("2410")) {
        cleanNumber = "241" + cleanNumber.substring(4);
      } else if (cleanNumber.startsWith("0")) {
        cleanNumber = "241" + cleanNumber.substring(1);
      }

      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      // Redirection après un léger délai pour laisser le toast s'afficher
      setTimeout(() => {
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

  const otherEvents = allUpcoming
    .filter((e) => e.id !== id && new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gold font-bold hover:text-gold-dark transition-all bg-gold/5 px-4 py-2 rounded-full border border-gold/10 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir tous les événements
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 lg:max-w-[800px] xl:max-w-[900px]">
            <div className={`relative h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden mb-8 shadow-2xl bg-muted/20 ${isPast ? 'grayscale-[30%]' : ''}`}>
              <img src={image} alt={event.title} className="w-full h-full object-contain" width={1920} height={800} />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
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
                  <div className="text-xl text-muted-foreground leading-relaxed markdown-content">
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />
                      }}
                    >
                      {event.description}
                    </ReactMarkdown>
                  </div>
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

              {isPast ? (
                <div className="bg-muted/30 p-8 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center gap-4 animate-fade-in shadow-inner">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">Événement terminé</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Cet événement a déjà eu lieu. Les inscriptions ne sont plus disponibles, mais vous pouvez consulter nos prochaines dates.
                    </p>
                  </div>
                  <Button variant="outline" asChild className="rounded-full px-8 mt-2">
                    <Link to="/events">Voir le catalogue complet</Link>
                  </Button>
                </div>
              ) : (
                <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${step >= n ? "bg-gold text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                        Étape {n}
                      </div>
                    ))}
                  </div>

                  {step === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold">Étape 1 : Événement + nombre de places</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Détails de l'événement</Label>
                          <Input value={`${event.title} - ${event.location}`} disabled className="bg-secondary/40" />
                        </div>
                        <div className="space-y-2">
                          <Label>Prix par place</Label>
                          <Input value={`${event.price.toLocaleString()} ${event.currency}`} disabled className="bg-secondary/40" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qty">Nombre de places (1 à 10)</Label>
                        <Input id="qty" type="number" min={1} max={10} value={quantity} onChange={(e) => setQuantity(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} className="max-w-[120px]" />
                      </div>
                      <div className="glass-card border border-gold/10 rounded-2xl p-4 space-y-3 bg-[#32140c]/5">
                        <p className="text-sm uppercase tracking-wide text-gold font-semibold text-center sm:text-left font-display">Informations du payeur</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nom complet du payeur</Label>
                            <Input placeholder="Ex: Jean Mboulou" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Numéro WhatsApp du payeur *</Label>
                            <Input placeholder="+241 07 76 17 776" value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} required />
                          </div>
                        </div>
                      </div>
                      <Button variant="gold" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-gold/20" onClick={handleStep2}>
                        Continuer vers les participants
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold">Étape 2 : Participants</h3>
                      <div className="glass-card border border-gold/20 rounded-2xl p-4 space-y-3">
                        <p className="text-sm uppercase tracking-wide text-gold font-semibold">Bénéficiaires des places</p>
                        <p className="text-sm text-muted-foreground">Vous avez choisi <strong>{quantity}</strong> place(s).</p>
                        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                          {participants.map((participant, index) => (
                            <div key={index} className="grid sm:grid-cols-2 gap-3 p-3 bg-background/70 rounded-xl border border-border/60">
                              <div className="space-y-2">
                                <Label>Nom complet participant {index + 1} *</Label>
                                <Input placeholder="Prénom + Nom" value={participant.fullName} onChange={(e) => updateParticipant(index, "fullName", e.target.value)} required />
                              </div>
                              <div className="space-y-2">
                                <Label>Email du participant (Obligatoire) *</Label>
                                <Input type="email" placeholder="participant@email.com" value={participant.email} onChange={(e) => updateParticipant(index, "email", e.target.value)} required />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Button variant="outline" className="h-12 rounded-xl" onClick={() => setStep(1)}>Retour</Button>
                        <Button variant="gold" className="h-12 rounded-xl" onClick={handleStep3} disabled={!isStep2Valid}>Payer maintenant</Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5 animate-fade-in">
                      <h3 className="font-display text-2xl font-bold">Étape 3 : Paiement + confirmation</h3>
                      <div className="rounded-2xl border border-gold/20 p-4 bg-secondary/30 space-y-2">
                        <p><strong>Événement :</strong> {event.title}</p>
                        <p><strong>Nombre de places :</strong> {quantity}</p>
                        <p><strong>Montant total :</strong> {totalAmount.toLocaleString()} {event.currency}</p>
                        <p><strong>Numéro du payeur :</strong> {payerPhone}</p>
                        <div className="pt-2">
                          <p className="font-semibold">Participants :</p>
                          <ul className="text-sm text-muted-foreground mt-1">
                            {participants.map((p, idx) => (
                              <li key={idx}>• {p.fullName || `Participant ${idx + 1}`}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gold/20 p-4 bg-card space-y-2">
                        <p className="font-semibold">Instructions de paiement</p>
                        <p className="text-sm text-muted-foreground">Veuillez effectuer le paiement du montant total via Airtel Money ou Moov Money.</p>
                        <p className="text-sm"><strong>Numéro Airtel (Paiement) :</strong> 077 57 73 83</p>
                        <p className="text-sm"><strong>Numéro Moov (Paiement) :</strong> 066 69 23 38</p>
                      </div>
                      {paymentPending && (
                        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 flex items-start gap-3">
                          <CheckCircle2 className="text-gold mt-0.5 h-5 w-5" />
                          <p className="text-sm">
                            Réservation enregistrée avec le statut <strong>"Paiement en cours de vérification"</strong>.
                            Finalisez maintenant sur WhatsApp pour validation.
                          </p>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Button variant="outline" className="h-12 rounded-xl" onClick={() => setStep(2)}>Retour</Button>
                        <Button variant="gold" className="h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white" onClick={handlePaymentDone} disabled={isSubmitting}>
                          <Phone className="h-4 w-4 mr-2" /> {isSubmitting ? "Enregistrement..." : "J'ai effectué le paiement"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-[350px] xl:w-[400px] shrink-0">
            <div className="sticky top-24">
              <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                Autres événements
              </h3>
              <div className="flex flex-col md:flex-col lg:flex-col gap-6 overflow-y-auto lg:max-h-[calc(100vh-160px)] scrollbar-hide pr-2 pb-10 sm:flex-row sm:overflow-x-auto">
                <div className="flex flex-row lg:flex-col gap-6 w-full overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
                  {otherEvents.map((evt) => (
                    <div key={evt.id} className="min-w-[280px] lg:min-w-full h-[320px] flex-shrink-0">
                       <EventCard event={evt} />
                    </div>
                  ))}
                </div>
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
