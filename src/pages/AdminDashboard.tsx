import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, EventsAPI, TicketsAPI, NewsletterAPI, ContactAPI, type Event, type Ticket } from "@/lib/api";
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
  X,
  Mail as MailIcon,
  Activity,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import nflLogo from "@/assets/Logo_NFL_fond_marron-removebg-preview.png";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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
import { Html5QrcodeScanner } from "html5-qrcode";

type Tab = "dashboard" | "events" | "tickets" | "demandes" | "newsletter" | "scanner";

const DemandesList = () => {
  const { data: demandes = [], isLoading } = useQuery<any[]>({
    queryKey: ["contacts"],
    queryFn: ContactAPI.getAll,
  });

  if (isLoading) return <tr><td colSpan={4} className="text-center py-10 opacity-50">Chargement...</td></tr>;
  if (demandes.length === 0) return <tr><td colSpan={4} className="text-center py-10 opacity-50">Aucune demande reçue.</td></tr>;

  return (
    <>
      {demandes.map((d) => (
        <tr key={d.id} className="hover:bg-muted/5 transition-colors group">
          <td className="px-6 py-5">
            <div className="font-bold text-foreground">{d.name}</div>
            <div className="text-xs text-muted-foreground">{d.email}</div>
            <div className="mt-2 text-gold font-semibold text-xs uppercase tracking-wider">{d.subject}</div>
          </td>
          <td className="px-6 py-5">
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-md group-hover:line-clamp-none transition-all">
              {d.message}
            </p>
          </td>
          <td className="px-6 py-5">
            <div className="text-xs font-mono text-muted-foreground">
              {new Date(d.created_at || Date.now()).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </td>
          <td className="px-6 py-5">
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 uppercase text-[10px]">
              {d.status || 'En attente'}
            </Badge>
          </td>
        </tr>
      ))}
    </>
  );
};

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
 
  const { data: subscribers = [] } = useQuery<any[]>({
    queryKey: ["subscribers"],
    queryFn: NewsletterAPI.getAll,
  });

  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Écouter les mises à jour en temps réel sur la table 'events' (Newsletter Status)
    const channel = supabase
      .channel('events-newsletter-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
        },
        (payload: any) => {
          const { new: newRow, old: oldRow } = payload;
          // Si le statut passe de n'importe quoi à 'sent'
          if (newRow.newsletter_status === 'sent' && oldRow.newsletter_status !== 'sent') {
            toast.success(`Mails d'invitation aux newsletters pour l'événement "${newRow.title}" envoyés avec succès !`, {
              duration: 5000,
              position: 'bottom-center'
            });
            refetchEvents(); // Rafraîchir les données pour voir le nouveau statut si besoin
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchEvents]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    const timer = setTimeout(() => {
      if (activeTab === "scanner" && scanMode === "camera") {
        const readerElement = document.getElementById("reader");
        if (readerElement) {
          scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true, supportedScanTypes: [0] },
            false
          );
          scanner.render(
            (decodedText) => {
              handleScanLogic(decodedText);
              if (scanner) scanner.clear();
              setScanMode("manual");
            },
            () => {}
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

  const totalTickets = tickets.filter(t => t.status === 'validé' || t.status === 'utilisé').length;
  const totalRevenue = tickets
    .filter((t) => t.status !== "annulé" && t.status !== "soumis")
    .reduce((sum, t) => {
      const event = events.find((e) => e.id === t.event_id || e.id === t.eventId);
      return sum + (event?.price || 0);
    }, 0);
  const activeEventsCount = events.filter((e) => new Date(e.date) >= new Date()).length;

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
      toast.success("Image chargée !");
    } catch (err: any) {
      toast.error("Échec de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEvent = async () => {
    try {
      const payload = {
        title: eventForm.title || "Sans titre",
        description: eventForm.description || "",
        date: eventForm.date || new Date().toISOString().split("T")[0],
        time: eventForm.time || "20:00",
        location: eventForm.location || "Lieu non précisé",
        price: eventForm.price || 0,
        currency: "FCFA",
        image_url: eventForm.image || eventForm.image_url || "",
        category: eventForm.category || "soirée",
        capacity: eventForm.capacity || 100,
        whatsapp_number: eventForm.whatsapp_number || "24177617776",
      };

      if (editingEventId) {
        await EventsAPI.update(editingEventId, payload);
        toast.success("Événement mis à jour.");
      } else {
        await EventsAPI.create(payload);
        toast.success("Événement créé. Les invitations newsletter seront envoyées en arrière-plan.");
      }
      refetchEvents();
      setEventDialogOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Erreur lors de la sauvegarde.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await EventsAPI.delete(id);
      refetchEvents();
      toast.info("Supprimé.");
    } catch (err: any) {
      toast.error("Erreur.");
    }
  };

  const handleEditEvent = (event: Event) => {
    setEventForm(event);
    setEditingEventId(event.id);
    setEventDialogOpen(true);
  };

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [confirmValidateOpen, setConfirmValidateOpen] = useState(false);
  
  const validateTicket = async (id: string) => {
    setIsValidating(true);
    try {
      await TicketsAPI.updateStatus(id, "validé");
      refetchTickets();
      setConfirmValidateOpen(false);
      setShowTicketModal(false);
      toast.success("Billet validé !");
    } catch (err: any) {
       toast.error("Erreur lors de la validation.");
    } finally {
      setIsValidating(false);
    }
  };

  const cancelTicket = async (id: string) => {
    try {
      await TicketsAPI.updateStatus(id, "annulé");
      refetchTickets();
      setShowTicketModal(false);
    } catch (err: any) {
      toast.error("Erreur.");
    }
  };

  const revenueByEvent = useMemo(() => {
    return events.map(event => ({
      name: event.title.substring(0, 15),
      revenue: (tickets || [])
        .filter(t => (t.event_id || t.eventId) === event.id && (t.status === 'confirmed' || t.status === 'validated' || t.status === 'validé'))
        .length * event.price
    })).filter(d => d.revenue > 0);
  }, [events, tickets]);
 
  const ticketsByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = { "En attente": 0, "Confirmé": 0, "Annulé": 0, "Validé": 0 };
    tickets.forEach(t => {
      const statusValue = (t.status || "").toLowerCase();
      let s = "En attente";
      if (statusValue === 'validé' || statusValue === 'validated') s = "Validé";
      else if (statusValue === 'confirmé' || statusValue === 'confirmed') s = "Confirmé";
      else if (statusValue === 'annulé' || statusValue === 'cancelled') s = "Annulé";
      
      if (statusCounts[s] !== undefined) statusCounts[s]++;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [tickets]);
 
  const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#0088FE'];
 
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", phone: "", eventId: "" });

  const handleAddTicket = async () => {
    try {
      const payload = { event_id: ticketForm.eventId, full_name: ticketForm.name, email: ticketForm.email, phone: ticketForm.phone || "066692338", payer_phone: ticketForm.phone || "066692338" };
      const newTicket = await TicketsAPI.create(payload);
      await TicketsAPI.updateStatus(newTicket.id, "validé");
      refetchTickets();
      setTicketDialogOpen(false);
    } catch (err: any) {
       toast.error("Erreur.");
    }
  };

  const handleScanLogic = async (code: string) => {
    setScanResult("Vérification...");
    try {
      const response = await TicketsAPI.validate(code);
      if (response.valid) {
        setScanResult(`✅ VALIDE — ${response.ticket.full_name || response.ticket.name}`);
        refetchTickets();
      } else {
        setScanResult(`❌ ${response.message}`);
      }
    } catch (err: any) {
      setScanResult("❌ Erreur réseau");
    }
  };

  const handleScanQR = () => { handleScanLogic(scanInput); setScanInput(""); };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const nameMatch = t.full_name || t.name || "";
      const matchesSearch = nameMatch.toLowerCase().includes(searchTicket.toLowerCase()) || t.id.toLowerCase().includes(searchTicket.toLowerCase());
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
    { key: "demandes", icon: <MailIcon className="h-5 w-5" />, label: "Demandes" },
    { key: "newsletter", icon: <Sparkles className="h-5 w-5" />, label: "Newsletter" },
    { key: "scanner", icon: <QrCode className="h-5 w-5" />, label: "Scanner QR" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#32140c] border-r border-sidebar-border flex flex-col transition-transform md:translate-x-0 md:static md:h-screen ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-28 flex items-center justify-between px-6 border-b border-sidebar-border bg-[#32140c]">
          <Link to="/"><img src={nflLogo} alt="NFL" className="h-20 w-auto" /></Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}><X className="h-6 w-6" /></Button>
        </div>
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button 
              key={tab.key} 
              onClick={() => { setActiveTab(tab.key); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === tab.key 
                  ? "bg-gold text-[#32140c] shadow-lg shadow-gold/20" 
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-sidebar-border"><Button variant="outline" className="w-full justify-start text-destructive" onClick={() => navigate("/admin/login")}><LogOut className="h-5 w-5 mr-3"/> Déconnexion</Button></div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 md:px-10 shrink-0 text-foreground">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}><Menu className="h-6 w-6" /></Button>
            <h1 className="font-display text-2xl font-bold flex items-center gap-3">
              <span className="text-gold">{tabs.find(t => t.key === activeTab)?.icon}</span>
              {tabs.find(t => t.key === activeTab)?.label}
            </h1>
          </div>
          <Badge variant="outline" className="text-gold border-gold/20">En ligne</Badge>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide text-foreground">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="glass-card rounded-3xl p-8 border border-gold/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-muted-foreground uppercase">Billets</span>
                    <TicketIcon className="h-6 w-6 text-gold" />
                  </div>
                  <p className="text-5xl font-bold">{totalTickets}</p>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-gold/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-muted-foreground uppercase">Revenus (FCFA)</span>
                    <DollarSign className="h-6 w-6 text-gold" />
                  </div>
                  <p className="text-5xl font-bold">{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-gold/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-muted-foreground uppercase">Événements</span>
                    <Calendar className="h-6 w-6 text-gold" />
                  </div>
                  <p className="text-5xl font-bold">{activeEventsCount}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-3xl p-8 border border-border/50">
                  <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-gold" /> Revenus</h3>
                  <div className="h-[300px]"><ResponsiveContainer><BarChart data={revenueByEvent}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]}/></BarChart></ResponsiveContainer></div>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-border/50">
                  <h3 className="font-bold mb-6 flex items-center gap-2"><PieChart className="h-5 w-5 text-gold" /> Répartition</h3>
                  <div className="h-[300px]"><ResponsiveContainer><PieChart><Pie data={ticketsByStatus} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{ticketsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div>
                </div>
              </div>

              {/* Activités récentes */}
              <div className="glass-card rounded-3xl p-8 border border-border/50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display text-2xl font-bold">Dernières réservations</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("tickets")} className="text-gold hover:text-gold/80 flex items-center gap-1 font-semibold">
                    Voir tout <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tickets.slice(-3).reverse().map((ticket) => {
                    const event = events.find((e) => e.id === (ticket.event_id || ticket.eventId));
                    return (
                      <div key={ticket.id} className="p-5 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all cursor-pointer group relative" onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}>
                        <div className="flex justify-between items-start mb-3">
                           <p className="font-bold text-foreground truncate max-w-[150px] group-hover:text-gold transition-colors">{ticket.full_name || ticket.name}</p>
                           <Badge className={
                              ticket.status === "validé" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                              ticket.status === "soumis" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                              ticket.status === "utilisé" ? "bg-slate-500/10 text-slate-500 border-slate-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                            } variant="outline">
                             {ticket.status}
                           </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest truncate mb-2">{event?.title || "Événement inconnu"}</p>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                          <p className="text-[10px] text-muted-foreground/60 font-mono">REF: NFL-{ticket.id.split("-")[0].toUpperCase()}</p>
                          <div className="flex gap-1">
                            {ticket.status === 'soumis' && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); cancelTicket(ticket.id); }}><XCircle className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:bg-green-500/10" onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); setConfirmValidateOpen(true); }}><CheckCircle className="h-4 w-4" /></Button>
                              </>
                            )}
                            {ticket.status === 'validé' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gold" onClick={(e) => { e.stopPropagation(); downloadTicket(ticket.id); }}><Download className="h-4 w-4" /></Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Événements</h2>
                <Button variant="gold" className="rounded-2xl h-12 px-6 shadow-xl" onClick={() => { setEventForm({}); setEditingEventId(null); setEventDialogOpen(true); }}>
                  <Plus className="h-5 w-5 mr-2" /> Créer
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="glass-card rounded-3xl overflow-hidden border border-border/50 flex flex-col h-full hover:border-gold/30 transition-all">
                    <div className="h-32 bg-muted/20 relative">
                      {event.image_url ? <img src={event.image_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center opacity-20"><Calendar className="h-10 w-10 text-gold" /></div>}
                      <Badge className="absolute top-3 left-3 bg-primary/20 text-white backdrop-blur-md">{event.category}</Badge>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between mb-4">
                        <span className="text-gold font-bold">{event.price.toLocaleString()} F</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gold" onClick={() => handleEditEvent(event)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteEvent(event.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 font-mono">{new Date(event.date).toLocaleDateString()} - {event.location}</p>
                      <div className="mt-auto pt-4 border-t border-border/50">
                        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2"><span>{event.ticketsSold || 0} / {event.capacity}</span></div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-gold transition-all" style={{ width: `${((event.ticketsSold || 0) / event.capacity) * 100}%` }} /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Réservations</h2>
                <Button variant="gold" className="rounded-2xl h-12 px-6 font-bold" onClick={() => setTicketDialogOpen(true)}>Nouvelle inscription</Button>
              </div>
              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/20 text-muted-foreground uppercase tracking-widest text-[10px]">
                      <tr><th className="px-8 py-5">Réf / Client</th><th className="px-8 py-5">Événement</th><th className="px-8 py-5">Status</th><th className="px-8 py-5 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-secondary/10 cursor-pointer" onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}>
                          <td className="px-8 py-5">
                            <span className="text-gold font-bold block">REF: {ticket.id.split("-")[0].toUpperCase()}</span>
                            <span className="font-medium text-foreground">{ticket.full_name || ticket.name}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="max-w-[200px] truncate">{events.find(e => e.id === (ticket.event_id || ticket.eventId))?.title}</div>
                          </td>
                          <td className="px-8 py-5"><Badge variant="outline" className={ticket.status === 'validé' ? "text-green-600" : "text-orange-600"}>{ticket.status}</Badge></td>
                          <td className="px-8 py-5 text-right flex justify-end gap-2">
                             {ticket.status === 'validé' ? (
                               <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); downloadTicket(ticket.id); }}><Download className="h-4 w-4" /></Button>
                             ) : (
                               <Button variant="ghost" size="icon" className="text-green-500" onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); setConfirmValidateOpen(true); }}><CheckCircle className="h-4 w-4" /></Button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "demandes" && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold">Demandes de Contact</h2>
              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary/20 uppercase text-[10px] tracking-widest text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4">Client / Sujet</th>
                        <th className="px-6 py-4">Message</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      <DemandesList />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "newsletter" && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold">Newsletter</h2>
              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-secondary/20 uppercase text-[10px] tracking-widest text-muted-foreground"><tr><th className="px-6 py-4">Abonné</th><th className="px-6 py-4">Date</th></tr></thead>
                  <tbody className="divide-y divide-border/30">
                    {Array.isArray(subscribers) && subscribers.map((sub: any) => (<tr key={sub.id} className="hover:bg-muted/10"><td className="px-6 py-4 text-foreground">{sub.email}</td><td className="px-6 py-4 text-xs text-muted-foreground">{new Date(sub.created_at || Date.now()).toLocaleDateString()}</td></tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "scanner" && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-10">
              <div className="text-center"><h2 className="text-4xl font-bold mb-4">Scanner</h2><p className="text-muted-foreground">Vérification en temps réel.</p></div>
              <div className="flex justify-center bg-secondary/30 p-1.5 rounded-2xl w-fit mx-auto border border-border/50"><Button variant={scanMode === "camera" ? "gold" : "ghost"} onClick={() => setScanMode("camera")}>Caméra</Button><Button variant={scanMode === "manual" ? "gold" : "ghost"} onClick={() => setScanMode("manual")}>Manuel</Button></div>
              <div className="glass-card p-10 rounded-[40px] border border-border/50 shadow-2xl">
                {scanMode === "camera" ? <div id="reader" className="min-h-[300px] bg-black/5 rounded-3xl overflow-hidden" /> : <div className="space-y-4 font-mono"><Input placeholder="Code NFL-..." value={scanInput} onChange={(e) => setScanInput(e.target.value)} /><Button variant="gold" className="w-full h-14" onClick={handleScanQR}>Valider</Button></div>}
                {scanResult && <div className="mt-8 p-6 text-center border-2 rounded-2xl font-bold">{scanResult}</div>}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px] rounded-[30px] p-8 border-gold/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Événement</DialogTitle>
          <DialogDescription>
            Créez ou modifiez un événement pour le catalogue NFL.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-2"><Label>Titre</Label><Input placeholder="Titre de l'événement" value={eventForm.title || ""} onChange={(e) => setEventForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Détails de l'événement..." value={eventForm.description || ""} onChange={(e) => setEventForm(p => ({ ...p, description: e.target.value }))} className="min-h-[100px]" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={eventForm.date || ""} onChange={(e) => setEventForm(p => ({ ...p, date: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Heure du début</Label>
              <Select value={eventForm.time || "20:00"} onValueChange={(v) => setEventForm(p => ({ ...p, time: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir l'heure" /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Array.from({ length: 32 }, (_, i) => {
                    const hour = Math.floor(i / 2) + 8;
                    const min = i % 2 === 0 ? "00" : "30";
                    const time = `${hour.toString().padStart(2, '0')}:${min}`;
                    return <SelectItem key={time} value={time}>{time}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2"><Label>Lieu</Label><Input placeholder="Ex: Radisson Blu" value={eventForm.location || ""} onChange={(e) => setEventForm(p => ({ ...p, location: e.target.value }))} /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Prix (XAF)</Label><Input type="number" value={eventForm.price || 0} onChange={(e) => setEventForm(p => ({ ...p, price: Number(e.target.value) }))} /></div>
            <div className="space-y-2"><Label>Capacité (Places)</Label><Input type="number" value={eventForm.capacity || 100} onChange={(e) => setEventForm(p => ({ ...p, capacity: Number(e.target.value) }))} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Catégorie</Label>
              <Select value={eventForm.category || "soirée"} onValueChange={(v) => setEventForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent><SelectItem value="soirée">Soirée</SelectItem><SelectItem value="conférence">Conférence</SelectItem><SelectItem value="atelier">Atelier</SelectItem><SelectItem value="concert">Concert</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>WhatsApp Contact</Label><Input placeholder="+241077617776" value={eventForm.whatsapp_number || ""} onChange={(e) => setEventForm(p => ({ ...p, whatsapp_number: e.target.value }))} /></div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Affiche / Image de l'événement</Label>
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group
                ${isUploading ? "bg-muted/50 border-gold/20" : "bg-gold/5 border-gold/20 hover:border-gold hover:bg-gold/10"}`}
              onClick={() => document.getElementById("event-image")?.click()}
            >
              <input 
                id="event-image" 
                type="file" 
                className="hidden" 
                onChange={handleImageUpload} 
                accept="image/*"
              />
              {isUploading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 w-full h-full min-h-[160px]">
                  {eventForm.image_url ? (
                    <div className="relative w-full h-full flex flex-col items-center gap-2">
                      <img 
                        src={eventForm.image_url} 
                        alt="Aperçu" 
                        className="w-full max-h-[200px] object-contain rounded-xl shadow-lg border border-gold/20"
                      />
                      <p className="text-gold font-bold text-sm bg-[#32140c] px-3 py-1 rounded-full border border-gold/30">Cliquer pour changer l'affiche</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-gold" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">Cliquez ou glissez l'affiche ici</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou JPEG (Max. 5Mo)</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              {eventForm.image_url && !isUploading && (
                <div className="absolute top-2 right-2 bg-gold text-[#32140c] text-[10px] font-bold px-2 py-1 rounded-full uppercase">Prêt</div>
              )}
            </div>
          </div>
          
          <Button 
            variant="gold" 
            className="w-full h-16 mt-4 text-xl font-bold shadow-2xl shadow-gold/30 rounded-2xl group relative overflow-hidden" 
            onClick={handleSaveEvent} 
            disabled={isUploading || !eventForm.title}
          >
            <span className="relative z-10">{editingEventId ? "Mettre à jour l'événement" : "Publier l'événement"}</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Button>
        </div>
      </DialogContent></Dialog>

      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}><DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nouvelle inscription</DialogTitle>
          <DialogDescription>
            Inscrire manuellement un participant à un événement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Label>Événement</Label>
          <Select value={ticketForm.eventId} onValueChange={(v) => setTicketForm(p => ({ ...p, eventId: v }))}>
            <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
          </Select>
          <Label>Nom</Label><Input value={ticketForm.name} onChange={(e) => setTicketForm(p => ({ ...p, name: e.target.value }))} />
          <Label>Email</Label><Input type="email" value={ticketForm.email} onChange={(e) => setTicketForm(p => ({ ...p, email: e.target.value }))} />
          <Button variant="gold" className="w-full h-12 mt-4" onClick={handleAddTicket}>Inscrire</Button>
        </div>
      </DialogContent></Dialog>

      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}><DialogContent className="sm:max-w-[450px]">
         <DialogHeader>
           <DialogTitle className="text-xl font-bold">Détails du billet</DialogTitle>
           <DialogDescription>
             Consultez et gérez les informations de cette réservation.
           </DialogDescription>
         </DialogHeader>
         {selectedTicket && <div className="space-y-6 pt-6">
            <div className="bg-secondary/20 p-6 rounded-2xl grid grid-cols-2 gap-4">
              <div><Label className="opacity-50 uppercase text-[10px] font-bold">Bénéficiaire</Label><p className="font-bold">{selectedTicket.full_name || selectedTicket.name}</p></div>
              <div><Label className="opacity-50 uppercase text-[10px] font-bold">Statut</Label><p className="text-gold font-bold">{selectedTicket.status}</p></div>
            </div>
            <div className="flex gap-4">
              {selectedTicket.status === 'validé' && <Button className="flex-1" onClick={() => downloadTicket(selectedTicket.id)}>PDF</Button>}
              <Button variant="outline" className="flex-1 text-destructive" onClick={() => cancelTicket(selectedTicket.id)}>Annuler</Button>
            </div>
         </div>}
      </DialogContent></Dialog>

      <Dialog open={confirmValidateOpen} onOpenChange={setConfirmValidateOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[30px] p-8 text-center bg-card border-gold/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">Confirmer</DialogTitle>
              <DialogDescription>
                Voulez-vous valider cette réservation et envoyer le billet ?
              </DialogDescription>
            </DialogHeader>
           <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gold/10"><CheckCircle className="w-8 h-8" /></div>
           <DialogFooter className="flex gap-2 pt-6">
              <Button variant="ghost" className="flex-1 rounded-xl h-12" onClick={() => setConfirmValidateOpen(false)}>Non, annuler</Button>
              <Button 
                variant="gold" 
                className="flex-1 font-bold rounded-xl h-12 shadow-lg shadow-gold/20" 
                onClick={() => selectedTicket && validateTicket(selectedTicket.id)}
                disabled={isValidating}
               >
                 {isValidating ? (
                   <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                 ) : (
                   "Oui, confirmer"
                 )}
               </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
