import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, EventsAPI, TicketsAPI, type Event, type Ticket } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Calendar,
  Ticket as TicketIcon,
  Plus,
  Pencil,
  Trash2,
  Download,
  QrCode,
  Search,
  Sparkles,
  Users,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Filter,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Menu,
  UploadCloud,
  ImagePlus,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Html5QrcodeScanner } from "html5-qrcode";

type Tab = "dashboard" | "events" | "tickets" | "scanner";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  
  const { data: events = [], refetch: refetchEvents } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: EventsAPI.getAll,
  });

  const { data: tickets = [], refetch: refetchTickets } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: TicketsAPI.getAll,
  });

  const [searchTicket, setSearchTicket] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState("");
  const [scanMode, setScanMode] = useState<"manual" | "camera">("camera");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Filters
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Ticket generation (Backend-only)
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Scanner initialization
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    // Pequeno delay para garantir que o elemento #reader existe no DOM
    const timer = setTimeout(() => {
      if (activeTab === "scanner" && scanMode === "camera") {
        const readerElement = document.getElementById("reader");
        if (readerElement) {
          scanner = new Html5QrcodeScanner(
            "reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              supportedScanTypes: [0] // 0 = QR CODE
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              handleScanLogic(decodedText);
              if (scanner) scanner.clear();
              setScanMode("manual");
            },
            (error) => {
              // ignore scan errors (they happen every frame if no QR is found)
            }
          );
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, [activeTab, scanMode]);

  const downloadTicket = async (id: string) => {
    setIsDownloading(id);
    try {
      // We fetch via axios to include the JWT token
      const response = await TicketsAPI.getDownloadUrl(id); 
      // But getDownloadUrl just returns a string. We need a real fetch with auth.
      // I'll use axios directly for the blob.
      const res = await api.get(`/tickets/${id}/pdf`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${id.split('-')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Billet téléchargé !");
    } catch (err) {
      console.error("Download error", err);
      toast.error("Erreur de téléchargement.");
    } finally {
      setIsDownloading(null);
    }
  };

  // Stats
  const totalTickets = tickets.length;
  const totalRevenue = tickets
    .filter((t) => t.status !== "annulé" && t.status !== "soumis")
    .reduce((sum, t) => {
      const event = events.find((e) => e.id === t.event_id || e.id === t.eventId);
      return sum + (event?.price || 0);
    }, 0);
  const activeEventsCount = events.filter((e) => new Date(e.date) >= new Date()).length;

  // Event form state
  const [eventForm, setEventForm] = useState<Partial<Event>>({});
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await EventsAPI.uploadImage(formData);
      setEventForm(p => ({ ...p, image_url: res.imageUrl, image: res.imageUrl }));
      toast.success("Image chargée avec succès !");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Échec de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEvent = async () => {
    try {
      const payload: any = {
        title: eventForm.title || "Nouvel événement",
        description: eventForm.description || "",
        date: eventForm.date || new Date().toISOString().split("T")[0],
        time: eventForm.time || "20:00",
        location: eventForm.location || "",
        price: eventForm.price || 0,
        currency: "FCFA",
        image_url: eventForm.image || eventForm.image_url || "",
        category: eventForm.category || "soirée",
        capacity: eventForm.capacity || 100,
        whatsapp_number: eventForm.whatsapp_number || "+241077617776",
      };

      if (editingEventId) {
        await EventsAPI.update(editingEventId, payload);
        toast.success("Événement mis à jour.");
      } else {
        await EventsAPI.create(payload);
        toast.success("Nouvel événement créé.");
      }
      refetchEvents();
      setEventForm({});
      setEditingEventId(null);
      setEventDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la sauvegarde.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await EventsAPI.delete(id);
      toast.info("Événement supprimé.");
      refetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de suppression.");
    }
  };

  const handleEditEvent = (event: Event) => {
    setEventForm(event);
    setEditingEventId(event.id);
    setEventDialogOpen(true);
  };

  // Ticket actions
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [confirmValidateOpen, setConfirmValidateOpen] = useState(false);
  
  const validateTicket = async (id: string) => {
    try {
      await TicketsAPI.updateStatus(id, "validé");
      const ticket = tickets.find(t => t.id === id);
      const evt = events.find(e => e.id === (ticket?.event_id || ticket?.eventId));
      if (ticket && evt) {
         // No local generation, the email is sent by the backend
      }
      refetchTickets();
      setConfirmValidateOpen(false);
      setShowTicketModal(false);
      toast.success("Réservation validée ! Le client va recevoir son billet par mail.");
    } catch (err: any) {
       toast.error(err.response?.data?.message || "Erreur de validation.");
    }
  };

  const cancelTicket = async (id: string) => {
    try {
      await TicketsAPI.updateStatus(id, "annulé");
      refetchTickets();
      toast.info("Réservation annulée.");
      setShowTicketModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'annulation.");
    }
  };

  // Ticket form
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", phone: "", eventId: "" });

  const handleAddTicket = async () => {
    try {
      const payload = {
        event_id: ticketForm.eventId,
        full_name: ticketForm.name,
        email: ticketForm.email,
        phone: ticketForm.phone,
        payer_phone: ticketForm.phone,
      };
      
      const newTicket = await TicketsAPI.create(payload);
      // Automatically validate it to send email
      await TicketsAPI.updateStatus(newTicket.id, "validé");
      
      refetchTickets();
      
      const evt = events.find(e => e.id === ticketForm.eventId);
      if (evt) {
        // No local generation
        toast.success("Réservation créée !");
      }

      setTicketForm({ name: "", email: "", phone: "", eventId: "" });
      setTicketDialogOpen(false);
    } catch (err: any) {
       toast.error(err.response?.data?.message || "Erreur de création du ticket externe");
    }
  };

  const handleScanLogic = async (code: string) => {
    setScanResult("⏳ Vérification...");
    try {
      const response = await TicketsAPI.validate(code);
      
      if (response.valid) {
        const ticket = response.ticket;
        const evt = ticket.events; // Le backend renvoie events si inclus
        setScanResult(`✅ ACCÈS VALIDE — ${ticket.full_name || ticket.name}\n${evt?.title || "Événement"}`);
        toast.success("Validation d'entrée réussie ! 🎟️");
        
        // Rafraîchir la liste pour voir le statut "utilisé"
        refetchTickets();
        
        // Optionnel : masquer le résultat après 5s
        setTimeout(() => setScanResult(null), 5000);
      } else {
        setScanResult(`❌ ${response.message}`);
        toast.error(response.message);
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      const msg = err.response?.data?.message || "Format de QR Code invalide ou erreur réseau.";
      setScanResult(`❌ ${msg}`);
      toast.error(msg);
    }
  };

  const handleScanQR = () => {
    handleScanLogic(scanInput);
    setScanInput("");
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const nameMatch = t.full_name || t.name || "";
      const matchesSearch = nameMatch.toLowerCase().includes(searchTicket.toLowerCase()) ||
                           t.id.toLowerCase().includes(searchTicket.toLowerCase()) ||
                           (t.qr_code_data || t.qrCode || "").toLowerCase().includes(searchTicket.toLowerCase());
      const eventIdMatch = t.event_id || t.eventId;
      const matchesEvent = filterEvent === "all" || eventIdMatch === filterEvent;
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      return matchesSearch && matchesEvent && matchesStatus;
    }).reverse();
  }, [tickets, searchTicket, filterEvent, filterStatus]);

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: "dashboard", icon: <BarChart3 className="h-5 w-5" />, label: "Dashboard" },
    { key: "events", icon: <Calendar className="h-5 w-5" />, label: "Événements" },
    { key: "tickets", icon: <TicketIcon className="h-5 w-5" />, label: "Réservations" },
    { key: "scanner", icon: <QrCode className="h-5 w-5" />, label: "Scanner QR" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row shadow-inner overflow-hidden">
      
      {/* Ticket design now unified on backend */}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex flex-col transition-transform duration-300 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen md:sticky md:top-0`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border bg-sidebar-accent/10">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-6 w-6 text-gold" />
            <span className="font-display font-bold text-xl text-gold">NFL Admin</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
              }`}
            >
              <div className={activeTab === tab.key ? "text-gold" : ""}>{tab.icon}</div>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-sidebar-border space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:bg-destructive/10 border-0 rounded-2xl h-12" 
            onClick={() => navigate("/admin/login")}
          >
            <LogOut className="h-5 w-5 mr-3"/> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen bg-background/50 overflow-hidden">
        <header className="h-20 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
             </Button>
             <h1 className="font-display text-2xl font-bold flex items-center gap-3 text-foreground">
                <span className="text-gold">{tabs.find(t => t.key === activeTab)?.icon}</span>
                {tabs.find(t => t.key === activeTab)?.label}
             </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4">
             <Badge variant="outline" className="h-8 px-3 border-gold/10 text-gold bg-gold/5">Statut: En ligne</Badge>
             <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border border-gold/20 text-gold font-bold">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
          
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="glass-card rounded-3xl p-8 border border-gold/10 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all" />
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">Billets émis</span>
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary"><TicketIcon className="h-6 w-6 text-gold" /></div>
                  </div>
                  <p className="text-5xl font-display font-bold text-foreground tracking-tighter">{totalTickets}</p>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-gold/10 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">Volume (Gabon)</span>
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary"><DollarSign className="h-6 w-6 text-gold" /></div>
                  </div>
                  <p className="text-5xl font-display font-bold text-foreground tracking-tighter">
                    {totalRevenue.toLocaleString()} <span className="text-sm text-muted-foreground font-sans uppercase tracking-widest ml-1">FCFA</span>
                  </p>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-gold/10 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all" />
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">Événements</span>
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary"><Calendar className="h-6 w-6 text-gold" /></div>
                  </div>
                  <p className="text-5xl font-display font-bold text-foreground tracking-tighter">{activeEventsCount}</p>
                </div>
              </div>

              {/* Recent tickets section refined */}
              <div className="glass-card rounded-3xl p-8 border border-border/50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display text-2xl font-bold">Dernières réservations</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("tickets")} className="text-gold hover:text-gold/80 flex items-center gap-1 font-semibold">
                    Voir tout <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tickets.slice(-6).reverse().map((ticket) => {
                    const event = events.find((e) => e.id === (ticket.event_id || ticket.eventId));
                    return (
                      <div key={ticket.id} className="p-5 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all cursor-pointer" onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}>
                        <div className="flex justify-between items-start mb-3">
                           <p className="font-bold text-foreground truncate max-w-[150px]">{ticket.full_name || ticket.name}</p>
                           <Badge className={
                              ticket.status === "validé" ? "bg-green-500/10 text-green-600" :
                              ticket.status === "soumis" ? "bg-orange-500/10 text-orange-600" :
                              ticket.status === "utilisé" ? "bg-slate-500/10 text-slate-500" : "bg-destructive/10 text-destructive"
                            } variant="outline">
                             {ticket.status}
                           </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest truncate">{event?.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Events CRUD - (Skip large changes but ensured responsiveness) */}
          {activeTab === "events" && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Catalogue d'événements</h2>
                  <p className="text-muted-foreground text-sm">Gestion des événements au Gabon.</p>
                </div>
                <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                   <DialogTrigger asChild>
                    <Button variant="gold" className="rounded-2xl h-12 px-6 shadow-xl shadow-gold/10">
                      <Plus className="h-5 w-5 mr-2" /> Créer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px] rounded-3xl p-8 border-gold/10">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl text-gold">
                        {editingEventId ? "Modifier l'événement" : "Créer un événement"}
                      </DialogTitle>
                      <DialogDescription className="sr-only">Formulaire d'événement</DialogDescription>
                    </DialogHeader>
                    {/* Event Form Content ... same as before but prettier inputs */}
                     <div className="space-y-5 pt-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold">Titre de l'événement</Label>
                        <Input value={eventForm.title || ""} onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl h-12 bg-secondary/20" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold">Description</Label>
                        <Textarea rows={3} value={eventForm.description || ""} onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))} className="rounded-xl bg-secondary/20" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest font-bold">Date</Label>
                          <Input type="date" value={eventForm.date || ""} onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))} className="rounded-xl h-12 bg-secondary/20" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest font-bold">Heure</Label>
                          <Input type="time" value={eventForm.time || ""} onChange={(e) => setEventForm((p) => ({ ...p, time: e.target.value }))} className="rounded-xl h-12 bg-secondary/20" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold">Lieu (Cité, Ville)</Label>
                        <Input value={eventForm.location || ""} onChange={(e) => setEventForm((p) => ({ ...p, location: e.target.value }))} className="rounded-xl h-12 bg-secondary/20" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest font-bold">Prix unitaire (FCFA)</Label>
                          <Input type="number" value={eventForm.price || ""} onChange={(e) => setEventForm((p) => ({ ...p, price: Number(e.target.value) }))} className="rounded-xl h-12 bg-secondary/20" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest font-bold">Capacité max</Label>
                          <Input type="number" value={eventForm.capacity || ""} onChange={(e) => setEventForm((p) => ({ ...p, capacity: Number(e.target.value) }))} className="rounded-xl h-12 bg-secondary/20" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                         <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest font-bold">Catégorie</Label>
                          <Select value={eventForm.category || ""} onValueChange={(v) => setEventForm((p) => ({ ...p, category: v as Event["category"] }))}>
                            <SelectTrigger className="rounded-xl h-12 bg-secondary/20"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="soirée">Soirée</SelectItem>
                              <SelectItem value="conférence">Conférence</SelectItem>
                              <SelectItem value="atelier">Atelier</SelectItem>
                              <SelectItem value="concert">Concert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest font-bold">WhatsApp (+241...)</Label>
                          <Input value={eventForm.whatsapp_number || ""} onChange={(e) => setEventForm((p) => ({ ...p, whatsapp_number: e.target.value }))} className="rounded-xl h-12 bg-secondary/20" />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs uppercase tracking-widest font-bold">Affiche de l'événement</Label>
                         <div className="relative group w-full h-48 border-2 border-dashed border-gold/40 rounded-3xl overflow-hidden hover:border-gold hover:bg-gold/5 transition-all text-center flex flex-col items-center justify-center cursor-pointer">
                           <Input 
                             type="file" 
                             accept="image/*" 
                             onChange={handleImageUpload} 
                             disabled={isUploading} 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                           />
                           
                           {isUploading ? (
                             <div className="flex flex-col items-center text-gold animate-pulse">
                               <UploadCloud className="w-10 h-10 mb-2" />
                               <span className="font-semibold text-sm">Upload en cours...</span>
                             </div>
                           ) : eventForm.image_url ? (
                             <>
                               <img src={eventForm.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white z-0 pointer-events-none">
                                 <ImagePlus className="w-8 h-8 mb-2 drop-shadow-lg" />
                                 <span className="font-semibold text-sm drop-shadow-lg">Changer l'image</span>
                               </div>
                             </>
                           ) : (
                             <div className="flex flex-col items-center text-muted-foreground p-4">
                               <UploadCloud className="w-10 h-10 mb-3 text-gold/60" />
                               <span className="font-semibold text-sm">Cliquez ou glissez une image ici</span>
                               <span className="text-xs mt-1 opacity-70">JPEG, PNG recommandés</span>
                             </div>
                           )}
                         </div>
                      </div>
                      <Button disabled={isUploading} variant="gold" className="w-full h-14 text-base rounded-2xl mt-6 shadow-xl shadow-gold/20 font-bold" onClick={handleSaveEvent}>
                        {editingEventId ? "Enregistrer les modifications" : "Valider la création"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {events.map((event) => (
                  <div key={event.id} className="glass-card rounded-3xl p-6 flex flex-col gap-6 border border-border/50 hover:border-gold/30 transition-all hover:shadow-xl hover:-translate-y-1">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg px-3" variant="outline">{event.category}</Badge>
                        <p className="text-gold font-bold text-lg">{event.price.toLocaleString()} F</p>
                      </div>
                      <p className="font-display font-bold text-xl leading-tight mb-2">{event.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4 text-gold" /> {new Date(event.date).toLocaleDateString("fr-FR")} à {event.time}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground italic">
                        <MapPin className="w-4 h-4 text-gold" /> {event.location}
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <span>{event.ticketsSold} réservés</span>
                        <span>{event.capacity} places</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }} />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="flex-1 rounded-2xl h-11" onClick={() => handleEditEvent(event)}>
                          <Pencil className="h-4 w-4 mr-2" /> Éditer
                        </Button>
                         <Button variant="destructive" size="sm" className="rounded-2xl w-11 h-11 px-0 flex items-center justify-center shrink-0" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets - Refined with Filters & Modals */}
          {activeTab === "tickets" && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold">Gestion des Réservations</h2>
                  <p className="text-muted-foreground text-sm">Contrôlez et validez les demandes d'inscription.</p>
                </div>
                <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gold" className="rounded-2xl h-12 shadow-xl shadow-gold/20 px-6 font-bold">
                      <Plus className="h-5 w-5 mr-3" /> Nouvel Inscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px] rounded-3xl p-8">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl text-gold">Émettre un Billet</DialogTitle>
                      <DialogDescription className="sr-only">Formulaire pour créer un ticket</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-4 text-left">
                       <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold">Événement</Label>
                        <Select value={ticketForm.eventId} onValueChange={(v) => setTicketForm((p) => ({ ...p, eventId: v }))}>
                          <SelectTrigger className="rounded-xl h-12 bg-secondary/10"><SelectValue placeholder="Choisir un événement" /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {events.map((e) => (
                              <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                       <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold">Nom du Client</Label>
                        <Input value={ticketForm.name} onChange={(e) => setTicketForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl h-12 bg-secondary/10" placeholder="Ex: Marc Obiang" />
                      </div>
                       <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold">Email</Label>
                        <Input type="email" value={ticketForm.email} onChange={(e) => setTicketForm((p) => ({ ...p, email: e.target.value }))} className="rounded-xl h-12 bg-secondary/10" placeholder="marc@email.ga" />
                      </div>
                       <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold">Téléphone (+241...)</Label>
                        <Input value={ticketForm.phone} onChange={(e) => setTicketForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl h-12 bg-secondary/10" placeholder="077123456" />
                      </div>
                      <Button variant="gold" className="w-full h-14 text-base rounded-2xl mt-4 shadow-xl shadow-gold/20 font-bold" onClick={handleAddTicket} disabled={!ticketForm.eventId || !ticketForm.name}>
                        Générer & Télécharger
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters Bar */}
              <div className="glass-card rounded-3xl p-5 border border-border/50 flex flex-wrap gap-4 items-center">
                 <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher par nom, ID..." value={searchTicket} onChange={(e) => setSearchTicket(e.target.value)} className="pl-12 rounded-2xl h-12 border-none bg-background/50" />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-gold hidden sm:block" />
                  <Select value={filterEvent} onValueChange={setFilterEvent}>
                    <SelectTrigger className="w-[180px] rounded-2xl h-12 bg-background/50 border-none"><SelectValue placeholder="Événement" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       <SelectItem value="all">Tous les événements</SelectItem>
                       {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                   <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px] rounded-2xl h-12 bg-background/50 border-none"><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       <SelectItem value="all">Tous statuts</SelectItem>
                       <SelectItem value="soumis">Soumis</SelectItem>
                       <SelectItem value="validé">Validé</SelectItem>
                       <SelectItem value="utilisé">Scanné/Utilisé</SelectItem>
                       <SelectItem value="annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs uppercase bg-secondary/20 text-muted-foreground tracking-widest">
                      <tr>
                        <th className="px-8 py-5 font-bold">Ticket</th>
                        <th className="px-8 py-5 font-bold text-center">Bénéficiaire</th>
                        <th className="px-8 py-5 font-bold">Événement</th>
                        <th className="px-8 py-5 font-bold">Status</th>
                        <th className="px-8 py-5 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredTickets.map((ticket) => {
                        const event = events.find((e) => e.id === (ticket.event_id || ticket.eventId));
                        return (
                          <tr key={ticket.id} className="group hover:bg-secondary/10 transition-colors cursor-pointer" onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}>
                            <td className="px-8 py-5 font-mono text-gold font-bold">{ticket.id}</td>
                            <td className="px-8 py-5 text-center">
                              <div className="font-bold text-foreground text-base">{ticket.full_name || ticket.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{ticket.payer_phone || ticket.phone}</div>
                            </td>
                            <td className="px-8 py-5">
                               <div className="max-w-[200px] truncate font-medium">{event?.title}</div>
                               <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Gabon • {new Date(event?.date || "").toLocaleDateString()}</div>
                            </td>
                            <td className="px-8 py-5">
                              <Badge className={`rounded-full px-4 border-none ${
                                  ticket.status === "validé" ? "bg-green-500/10 text-green-600" :
                                  ticket.status === "soumis" ? "bg-orange-500/10 text-orange-600" :
                                  ticket.status === "utilisé" ? "bg-slate-500/10 text-slate-500" : "bg-destructive/10 text-destructive"
                                }`}>
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="px-8 py-5 text-right">
                              {ticket.status === 'validé' ? (
                                <Button variant="ghost" size="icon" className="text-gold rounded-full hover:bg-gold/10" disabled={isDownloading === ticket.id} onClick={(e) => {
                                  e.stopPropagation();
                                  downloadTicket(ticket.id);
                                }}>
                                  <Download className={`h-5 w-5 ${isDownloading === ticket.id ? 'animate-bounce' : ''}`} />
                                </Button>
                              ) : ticket.status === 'soumis' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="text-destructive rounded-full hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); cancelTicket(ticket.id); }}>
                                    <XCircle className="h-6 w-6" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-green-500 rounded-full hover:bg-green-500/10" onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); setConfirmValidateOpen(true); }}>
                                    <CheckCircle className="h-6 w-6" />
                                  </Button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredTickets.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic text-lg">
                            Aucun résultat trouvé pour cette sélection.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Scanner Tab */}
          {activeTab === "scanner" && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pt-10 pb-20 px-4">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gold/10 text-gold rounded-3xl flex items-center justify-center mx-auto mb-4 transform rotate-6 shadow-xl shadow-gold/20">
                  <QrCode className="h-10 w-10" />
                </div>
                <h2 className="font-display text-4xl font-bold">Scanner de Billets</h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Vérification en temps réel des accès aux événements NFL Courtier & Service.</p>
              </div>

              {/* Mode Toggle */}
              <div className="flex justify-center bg-secondary/30 p-1.5 rounded-2xl w-fit mx-auto border border-border/50">
                <Button 
                  variant={scanMode === "camera" ? "gold" : "ghost"}
                  onClick={() => setScanMode("camera")}
                  className="rounded-xl px-6 h-10"
                >
                  <QrCode className="w-4 h-4 mr-2" /> Caméra
                </Button>
                <Button 
                  variant={scanMode === "manual" ? "gold" : "ghost"}
                  onClick={() => setScanMode("manual")}
                  className="rounded-xl px-6 h-10"
                >
                  <Search className="w-4 h-4 mr-2" /> Manuel
                </Button>
              </div>
              
              <div className="glass-card rounded-[40px] p-6 md:p-10 border border-border/50 shadow-2xl space-y-8 relative overflow-hidden backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] -z-10" />
                
                {scanMode === "camera" ? (
                  <div className="space-y-6">
                    <div id="reader" className="overflow-hidden rounded-3xl border-4 border-gold/10 bg-black/5 min-h-[300px]" />
                    <p className="text-center text-xs text-muted-foreground italic">Placez le QR Code dans le cadre pour scanner automatiquement.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-muted-foreground text-xs uppercase tracking-widest font-bold ml-4">Code du Billet / Douchette</Label>
                    <div className="relative">
                      <QrCode className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gold opacity-50" />
                      <Input
                        placeholder="NFL-XXXXX-XXXX..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleScanQR()}
                        className="text-center h-16 text-xl font-mono bg-background border-gold/10 rounded-[20px] focus-visible:ring-gold pl-14"
                        autoFocus
                      />
                    </div>
                    <Button variant="gold" className="w-full h-16 text-lg rounded-[20px] shadow-2xl shadow-gold/20 font-bold" onClick={handleScanQR}>
                      Valider l'Accès
                    </Button>
                  </div>
                )}
                
                {scanResult && (
                  <div className={`p-6 rounded-[25px] animate-fade-in text-center flex items-center justify-center gap-4 border-2 ${
                    scanResult.includes("✅") ? "bg-green-500/5 text-green-700 border-green-500/20 shadow-lg shadow-green-500/10" : 
                    scanResult.includes("⚠️") ? "bg-orange-500/5 text-orange-700 border-orange-500/20 shadow-lg shadow-orange-500/10" : 
                    "bg-destructive/5 text-destructive border-destructive/20 shadow-lg shadow-destructive/10"
                  }`}>
                    {scanResult.includes("✅") ? <CheckCircle className="w-10 h-10 shrink-0" /> : <XCircle className="w-10 h-10 shrink-0" />}
                    <p className="font-display text-xl leading-snug">{scanResult}</p>
                  </div>
                )}
              </div>
              <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Scanner {scanMode === 'camera' ? 'Caméra' : 'Manuel'} opérationnel
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Ticket Details Modal */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="sm:max-w-[500px] rounded-[30px] p-8 border-gold/10">
          <DialogHeader>
             <DialogTitle className="font-display text-2xl text-gold mb-2">Détail du Billet</DialogTitle>
             <DialogDescription className="text-sm text-muted-foreground">ID Unique: {selectedTicket?.id}</DialogDescription>
          </DialogHeader>
           {selectedTicket && (
            <div className="space-y-6 pt-6">
               <div className="grid grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-2xl border border-border/30">
                  <div>
                    <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Client</Label>
                    <p className="text-lg font-bold">{selectedTicket.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTicket.phone}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Statut</Label>
                    <div className="mt-1">
                      <Badge className={
                         selectedTicket.status === "validé" ? "bg-green-500/10 text-green-600" :
                         selectedTicket.status === "soumis" ? "bg-orange-500/10 text-orange-600" :
                         selectedTicket.status === "utilisé" ? "bg-slate-500/10 text-slate-500" :
                         "bg-destructive/10 text-destructive"
                      }>{selectedTicket.status}</Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest opacity-50">Événement</Label>
                    <p className="font-semibold text-foreground">{events.find(e => e.id === (selectedTicket.event_id || selectedTicket.eventId))?.title}</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  {selectedTicket.status === 'soumis' && (
                    <Button variant="gold" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setConfirmValidateOpen(true)}>
                      <CheckCircle className="mr-2 h-5 w-5" /> Valider l'inscription
                    </Button>
                  )}
                  {selectedTicket.status === 'validé' && (
                      <Button variant="secondary" className="flex-1 h-12 rounded-xl" disabled={isDownloading === selectedTicket.id} onClick={() => downloadTicket(selectedTicket.id)}>
                        <Download className={`mr-2 h-5 w-5 ${isDownloading === selectedTicket.id ? 'animate-bounce' : ''}`} /> Télécharger PDF
                      </Button>
                  )}
                  {selectedTicket.status !== 'annulé' && (
                    <Button variant="outline" className="h-12 rounded-xl px-4 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => cancelTicket(selectedTicket.id)}>
                      <XCircle className="h-5 w-5" />
                    </Button>
                  )}
               </div>
            </div>
           )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Validation */}
      <Dialog open={confirmValidateOpen} onOpenChange={setConfirmValidateOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[30px] p-8 text-center border-gold/10">
           <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
           </div>
           <DialogHeader>
              <DialogTitle className="font-display text-2xl text-center">Confirmer la Validation</DialogTitle>
              <DialogDescription className="text-muted-foreground pt-4 leading-relaxed">
                 En validant, le client **{selectedTicket?.full_name || selectedTicket?.name}** recevra automatiquement son billet électronique par email. 
                 Voulez-vous continuer ?
              </DialogDescription>
           </DialogHeader>
           <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-8">
              <Button variant="ghost" className="rounded-xl flex-1 h-12" onClick={() => setConfirmValidateOpen(false)}>Annuler</Button>
              <Button variant="gold" className="rounded-xl flex-2 h-12 px-8 font-bold" onClick={() => selectedTicket && validateTicket(selectedTicket.id)}>Oui, Valider & Envoyer</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminDashboard;
