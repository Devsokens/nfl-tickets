import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, EventsAPI, TicketsAPI, NewsletterAPI, ContactAPI, AnalyticsAPI, type Event, type Ticket } from "@/lib/api";
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
  Loader2,
  FileText
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
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
import { Switch } from "@/components/ui/switch";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Checkbox } from "@/components/ui/checkbox";

type Tab = "dashboard" | "events" | "tickets" | "demandes" | "newsletter" | "scanner";

const DemandesList = () => {
  const [selectedDemande, setSelectedDemande] = useState<any>(null);
  const { data: demandes = [], isLoading } = useQuery<any[]>({
    queryKey: ["contacts"],
    queryFn: ContactAPI.getAll,
  });

  if (isLoading) return <tr><td colSpan={4} className="text-center py-10 opacity-50">Chargement...</td></tr>;
  if (demandes.length === 0) return <tr><td colSpan={4} className="text-center py-10 opacity-50">Aucune demande reçue.</td></tr>;

  return (
    <>
      {demandes.map((d) => (
        <tr key={d.id} className="hover:bg-muted/5 transition-colors group cursor-pointer" onClick={() => setSelectedDemande(d)}>
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
      <Dialog open={!!selectedDemande} onOpenChange={(open) => !open && setSelectedDemande(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de {selectedDemande?.name}</DialogTitle>
            <DialogDescription>{selectedDemande?.email}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="font-bold text-gold uppercase mb-2">{selectedDemande?.subject}</h4>
            <p className="whitespace-pre-wrap text-muted-foreground">{selectedDemande?.message}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedDemande(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  
  const { data: events = [], refetch: refetchEvents } = useQuery<Event[]>({
    queryKey: ["adminEvents"],
    queryFn: () => EventsAPI.getAll(true),
  });

  const { data: tickets = [], refetch: refetchTickets } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: TicketsAPI.getAll,
  });

  const [searchTicket, setSearchTicket] = useState("");
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"7days" | "30days">("7days");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState("");
  const [scanMode, setScanMode] = useState<"manual" | "camera">("camera");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
 
  const { data: subscribers = [] } = useQuery<any[]>({
    queryKey: ["subscribers"],
    queryFn: NewsletterAPI.getAll,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["analyticsStats"],
    queryFn: AnalyticsAPI.getStats,
  });

  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Newsletter Management State
  const [newsSearch, setNewsSearch] = useState("");
  const [newsPage, setNewsPage] = useState(1);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: "",
    content: "",
    sendToAll: true,
    attachmentFile: null as File | null
  });

  const [ticketPage, setTicketPage] = useState(1);
  const itemsPerPage = 15;

  const { data: newsletterHistory = [], refetch: refetchHistory } = useQuery<any[]>({
    queryKey: ["newsletterHistory"],
    queryFn: NewsletterAPI.getHistory,
    enabled: activeTab === "newsletter"
  });

  const filteredSubscribers = useMemo(() => {
    return Array.isArray(subscribers) 
      ? subscribers.filter(s => s.email.toLowerCase().includes(newsSearch.toLowerCase()))
      : [];
  }, [subscribers, newsSearch]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const paginatedSubscribers = useMemo(() => {
    const start = (newsPage - 1) * itemsPerPage;
    return filteredSubscribers.slice(start, start + itemsPerPage);
  }, [filteredSubscribers, newsPage, itemsPerPage]);

  const filteredTickets = useMemo(() => {
    return Array.isArray(tickets) ? tickets.filter((t) => {
      const nameMatch = (t.full_name || t.name || "").toLowerCase();
      const matchesSearch = nameMatch.includes(searchTicket.toLowerCase()) || 
                           t.id.toLowerCase().includes(searchTicket.toLowerCase());
      
      const eventIdMatch = t.event_id || t.eventId;
      const matchesEvent = filterEvent === "all" || eventIdMatch === filterEvent;
      
      const statusValue = t.status?.toLowerCase() || "";
      const matchesStatus = filterStatus === "all" || statusValue === filterStatus.toLowerCase();
      
      return matchesSearch && matchesEvent && matchesStatus;
    }).reverse() : [];
  }, [tickets, searchTicket, filterEvent, filterStatus]);

  const totalTicketPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = useMemo(() => {
    const start = (ticketPage - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, ticketPage, itemsPerPage]);

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(filteredSubscribers.map(s => s.email));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleToggleSubscriber = (email: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails(prev => [...prev, email]);
      setNewsletterForm(p => ({ ...p, sendToAll: false }));
    } else {
      setSelectedEmails(prev => prev.filter(e => e !== email));
    }
  };

  const handleSendManualNewsletter = async () => {
    if (!newsletterForm.subject || !newsletterForm.content) {
      toast.error("Veuillez remplir l'objet et le contenu.");
      return;
    }

    const recipients = newsletterForm.sendToAll 
      ? subscribers.map((s: any) => s.email) 
      : selectedEmails;

    if (recipients.length === 0) {
      toast.error("Veuillez sélectionner au moins un destinataire.");
      return;
    }

    setIsSendingNewsletter(true);
    let attachmentUrl = undefined;
    let attachmentName = undefined;

    try {
      if (newsletterForm.attachmentFile) {
        const formData = new FormData();
        formData.append('file', newsletterForm.attachmentFile);
        // On réutilise la route uploadImage (qui uploade dans 'events' et fonctionne pour tout fichier)
        const uploadRes = await EventsAPI.uploadImage(formData);
        attachmentUrl = uploadRes.imageUrl;
        attachmentName = newsletterForm.attachmentFile.name;
      }

      await NewsletterAPI.sendManual({
        subject: newsletterForm.subject,
        content: newsletterForm.content,
        recipientEmails: recipients,
        attachmentUrl,
        attachmentName
      });
      toast.success(`Newsletter envoyée à ${recipients.length} abonnés !`);
      setIsComposeOpen(false);
      setNewsletterForm({ subject: "", content: "", sendToAll: true, attachmentFile: null });
      setSelectedEmails([]);
      refetchHistory();
    } catch (err: any) {
      toast.error("Erreur lors de l'envoi : " + (err.response?.data?.message || err.message));
    } finally {
      setIsSendingNewsletter(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  // Le rafraîchissement des événements est géré manuellement après les actions de sauvegarde.
  useEffect(() => {
    refetchEvents();
  }, [activeTab, refetchEvents]);

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
      const newImageUrl = res.imageUrl;
      setEventForm(p => ({ ...p, image_url: newImageUrl, image: newImageUrl }));
      
      // Auto-save the image update immediately if we have an ID
      if (editingEventId) {
        setAutoSaveStatus("saving");
        await EventsAPI.update(editingEventId, { image_url: newImageUrl });
        setAutoSaveStatus("saved");
      }
      
      toast.success("Image chargée !");
    } catch (err: any) {
      toast.error("Échec de l'upload");
      setAutoSaveStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  // Logic for Auto-save
  useEffect(() => {
    if (!eventDialogOpen) return;

    const triggerAutoSave = async () => {
      setAutoSaveStatus("saving");
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
        status: eventForm.status || "brouillon",
        sendNewsletter: false,
      };

      try {
        if (editingEventId) {
          await EventsAPI.update(editingEventId, payload);
          setAutoSaveStatus("saved");
        } else {
          if (eventForm.title && eventForm.title !== "Nouveau...") {
            const newDraft = await EventsAPI.create(payload);
            setEditingEventId(newDraft.id);
            setAutoSaveStatus("saved");
            refetchEvents();
          }
        }
      } catch (err) {
        console.error("Autosave error:", err);
        setAutoSaveStatus("error");
      }
    };

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(triggerAutoSave, 3000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [eventForm.title, eventForm.description, eventForm.date, eventForm.time, eventForm.location, eventForm.price, eventForm.category, eventForm.capacity, eventForm.whatsapp_number, eventForm.status]);

  const handleSaveEvent = async () => {
    setIsSavingEvent(true);
    try {
      const payload: any = {
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
        status: "publié", // Manual save means Publish
        sendNewsletter: eventForm.send_newsletter === undefined ? true : eventForm.send_newsletter,
      };

      console.log("[DEBUG] Sending payload to update:", payload);

      if (editingEventId) {
        try {
          await EventsAPI.update(editingEventId, payload);
          const successMsg = payload.sendNewsletter 
            ? "Événement mis à jour et invitations envoyées !" 
            : "Événement mis à jour.";
          toast.success(successMsg);
        } catch (err: any) {
          console.error("[DEBUG] Update failed:", err.response?.data || err);
          const errorDetail = err.response?.data?.message || err.message;
          const finalMsg = Array.isArray(errorDetail) ? errorDetail.join(', ') : errorDetail;
          alert("ERREUR CRITIQUE SERVEUR : " + finalMsg);
          throw err; // Re-throw to be caught by the main catch
        }
      } else {
        // This case should normally not happen anymore because we create draft first
        await EventsAPI.create(payload);
        toast.success("Événement créé et publié.");
      }
      refetchEvents();
      setEventDialogOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      const errorDetail = err.response?.data?.message || err.message;
      const finalMsg = Array.isArray(errorDetail) ? errorDetail.join(', ') : errorDetail;
      alert("MESSAGE DU SERVEUR : " + finalMsg);
      toast.error(`Erreur lors de la publication : ${finalMsg}`);
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleStartNewEvent = async () => {
    setIsSavingEvent(true);
    // Just open the dialog with initial state, don't create in DB yet
    setEditingEventId(null);
    setEventForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "20:00",
      location: "Lieu à préciser",
      price: 0,
      category: "soirée",
      capacity: 100,
      status: "brouillon",
      send_newsletter: false,
      whatsapp_number: "+24177617776"
    });
    setEventDialogOpen(true);
    setAutoSaveStatus("saved");
    setIsSavingEvent(false);
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
    setEventForm({ ...event, send_newsletter: false });
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
    const statusCounts: Record<string, number> = { "Soumis": 0, "Validé": 0, "Utilisé": 0, "Annulé": 0 };
    tickets.forEach(t => {
      const statusValue = (t.status || "").toLowerCase();
      let s = "Soumis";
      if (statusValue === 'validé' || statusValue === 'validated') s = "Validé";
      else if (statusValue === 'utilisé' || statusValue === 'used') s = "Utilisé";
      else if (statusValue === 'annulé' || statusValue === 'cancelled') s = "Annulé";
      else if (statusValue === 'soumis' || statusValue === 'submitted' || statusValue === 'en attente') s = "Soumis";
      
      if (statusCounts[s] !== undefined) statusCounts[s]++;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [tickets]);
 
  const COLORS = ['#f97316', '#22c55e', '#64748b', '#ef4444']; // Orange(Soumis), Vert(Validé), Gris(Utilisé), Rouge(Annulé)
 
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
                  <h3 className="font-bold mb-6 flex items-center gap-2"><PieChart className="h-5 w-5 text-gold" /> Répartition des réservations</h3>
                  <div className="h-[300px]"><ResponsiveContainer><PieChart><Pie data={ticketsByStatus} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{ticketsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div>
                </div>
              </div>

              {/* Flux de visites */}
              <div className="glass-card rounded-3xl p-8 border border-border/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h3 className="font-bold flex items-center gap-2"><Activity className="h-5 w-5 text-gold" /> Flux de visites</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Select value={analyticsPeriod} onValueChange={(v: "7days"|"30days") => setAnalyticsPeriod(v)}>
                      <SelectTrigger className="w-[180px]"><SelectValue placeholder="Période" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">7 derniers jours</SelectItem>
                        <SelectItem value="30days">30 derniers jours</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="text-gold border-gold/20">{analyticsData?.totalVisits || 0} visites au total (30j)</Badge>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer>
                    <AreaChart data={
                      analyticsPeriod === "7days" 
                        ? (analyticsData?.chartData7Days || analyticsData?.chartData || []) 
                        : (analyticsData?.chartData30Days || analyticsData?.chartData || [])
                    }>
                      <defs>
                        <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <Area type="monotone" dataKey="visites" stroke="#d4af37" fillOpacity={1} fill="url(#colorVisites)" />
                    </AreaChart>
                  </ResponsiveContainer>
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
                            {(ticket.status === 'validé' || ticket.status === 'utilisé') && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gold" onClick={(e) => { e.stopPropagation(); downloadTicket(ticket.id); }}>
                                {isDownloading === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                              </Button>
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
                <Button variant="gold" disabled={isSavingEvent} className="rounded-2xl h-12 px-6 shadow-xl" onClick={handleStartNewEvent}>
                  {isSavingEvent ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Plus className="h-5 w-5 mr-2" />} 
                  Créer
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="glass-card rounded-3xl overflow-hidden border border-border/50 flex flex-col h-full hover:border-gold/30 transition-all">
                    <div className="h-32 bg-muted/20 relative">
                      {event.image_url ? <img src={event.image_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center opacity-20"><Calendar className="h-10 w-10 text-gold" /></div>}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge className="bg-primary/20 text-white backdrop-blur-md w-fit">{event.category}</Badge>
                        {event.status === 'brouillon' && (
                          <Badge className="bg-orange-500/80 text-white border-none w-fit">BROUILLON</Badge>
                        )}
                      </div>
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
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Réservations</h2>
                  <p className="text-muted-foreground">{filteredTickets.length} billets correspondants</p>
                </div>
                <Button variant="gold" className="rounded-2xl h-12 px-6 font-bold shadow-xl" onClick={() => setTicketDialogOpen(true)}>
                  <Plus className="h-5 w-5 mr-2" /> Nouvelle inscription
                </Button>
              </div>

              {/* Filtres de recherche */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nom ou Référence..." 
                    className="pl-12 h-12 bg-card border-border/50 rounded-xl"
                    value={searchTicket}
                    onChange={(e) => { setSearchTicket(e.target.value); setTicketPage(1); }}
                  />
                </div>
                <Select value={filterEvent} onValueChange={(v) => { setFilterEvent(v); setTicketPage(1); }}>
                  <SelectTrigger className="h-12 bg-card border-border/50 rounded-xl">
                    <SelectValue placeholder="Tous les événements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les événements</SelectItem>
                    {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setTicketPage(1); }}>
                  <SelectTrigger className="h-12 bg-card border-border/50 rounded-xl">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="soumis">Soumis (à valider)</SelectItem>
                    <SelectItem value="validé">Validé</SelectItem>
                    <SelectItem value="utilisé">Utilisé</SelectItem>
                    <SelectItem value="annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/20 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                      <tr>
                        <th className="px-8 py-5">Réf / Client</th>
                        <th className="px-8 py-5">Événement</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {paginatedTickets.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-20 text-muted-foreground">Aucune réservation trouvée.</td></tr>
                      ) : (
                        paginatedTickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-secondary/5 transition-colors cursor-pointer group" onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}>
                            <td className="px-8 py-5">
                              <span className="text-gold font-bold block text-xs mb-1">REF: {ticket.id.split("-")[0].toUpperCase()}</span>
                              <span className="font-semibold text-foreground group-hover:text-gold transition-colors">{ticket.full_name || ticket.name}</span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="max-w-[200px] truncate text-muted-foreground">{events.find(e => e.id === (ticket.event_id || ticket.eventId))?.title || "N/A"}</div>
                            </td>
                            <td className="px-8 py-5">
                              <Badge variant="outline" className={
                                ticket.status === 'validé' ? "text-green-600 bg-green-500/5 border-green-500/10" : 
                                ticket.status === 'utilisé' ? "text-slate-500 bg-slate-500/5 border-slate-500/10" :
                                ticket.status === 'annulé' ? "text-destructive bg-destructive/5 border-destructive/10" :
                                "text-orange-600 bg-orange-500/5 border-orange-500/10"
                              }>
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                 {ticket.status === 'soumis' && (
                                   <>
                                     <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => cancelTicket(ticket.id)}><XCircle className="h-4 w-4" /></Button>
                                     <Button variant="ghost" size="icon" className="text-green-500 hover:bg-green-500/10" onClick={() => { setSelectedTicket(ticket); setConfirmValidateOpen(true); }}><CheckCircle className="h-4 w-4" /></Button>
                                   </>
                                 )}
                                 {(ticket.status === 'validé' || ticket.status === 'utilisé') && (
                                   <Button variant="ghost" size="icon" className="text-gold hover:bg-gold/10" onClick={() => downloadTicket(ticket.id)}>
                                     {isDownloading === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                   </Button>
                                 )}
                               </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Tickets */}
                {totalTicketPages > 1 && (
                  <div className="p-6 border-t border-border/30 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Page {ticketPage} sur {totalTicketPages}</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={ticketPage === 1}
                        onClick={() => setTicketPage(p => p - 1)}
                        className="rounded-lg h-9"
                      >
                        Précédent
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={ticketPage === totalTicketPages}
                        onClick={() => setTicketPage(p => p + 1)}
                        className="rounded-lg h-9"
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
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
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Newsletter</h2>
                  <p className="text-muted-foreground">{subscribers.length} abonnés actifs</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsHistoryOpen(true)} className="rounded-2xl h-12 px-6">
                    <Activity className="h-5 w-5 mr-2" /> Historique
                  </Button>
                  <Button variant="gold" onClick={() => setIsComposeOpen(true)} className="rounded-2xl h-12 px-6 shadow-xl">
                    <MailIcon className="h-5 w-5 mr-2" /> Rédiger
                  </Button>
                </div>
              </div>

              {/* Barre de Recherche et Sélection */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Chercher un email..." 
                    className="pl-12 h-12 bg-card border-border/50 rounded-xl"
                    value={newsSearch}
                    onChange={(e) => { setNewsSearch(e.target.value); setNewsPage(1); }}
                  />
                </div>
                <div className="flex items-center gap-3 bg-secondary/20 px-4 h-12 rounded-xl border border-border/30">
                  <Checkbox 
                    id="select-all-news" 
                    checked={selectedEmails.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                    onCheckedChange={(v) => handleToggleSelectAll(!!v)}
                  />
                  <Label htmlFor="select-all-news" className="text-sm font-semibold cursor-pointer">Tout sélectionner ({filteredSubscribers.length})</Label>
                </div>
              </div>

              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary/20 uppercase text-[10px] tracking-widest text-muted-foreground font-bold">
                      <tr>
                        <th className="px-6 py-5 w-10"></th>
                        <th className="px-6 py-5">Email de l'Abonné</th>
                        <th className="px-6 py-5">Date d'inscription</th>
                        <th className="px-6 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {paginatedSubscribers.map((sub: any) => (
                        <tr key={sub.id} className={`hover:bg-muted/10 transition-colors ${selectedEmails.includes(sub.email) ? 'bg-gold/5' : ''}`}>
                          <td className="px-6 py-5">
                            <Checkbox 
                              checked={selectedEmails.includes(sub.email)}
                              onCheckedChange={(v) => handleToggleSubscriber(sub.email, !!v)}
                            />
                          </td>
                          <td className="px-6 py-5 font-medium text-foreground">{sub.email}</td>
                          <td className="px-6 py-5 text-xs text-muted-foreground">
                            {new Date(sub.created_at || Date.now()).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => NewsletterAPI.unsubscribe(sub.email).then(() => queryClient.invalidateQueries({ queryKey: ["subscribers"] }))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-6 border-t border-border/30 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Page {newsPage} sur {totalPages}</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={newsPage === 1}
                        onClick={() => setNewsPage(p => p - 1)}
                        className="rounded-lg h-9"
                      >
                        Précédent
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={newsPage === totalPages}
                        onClick={() => setNewsPage(p => p + 1)}
                        className="rounded-lg h-9"
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
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
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center justify-between">
            <span>Événement</span>
            <div className="flex items-center gap-2">
              {autoSaveStatus === "saving" && <Badge variant="outline" className="animate-pulse text-xs py-0 h-5 border-gold/30 text-gold">Enregistrement...</Badge>}
              {autoSaveStatus === "saved" && <Badge variant="outline" className="text-xs py-0 h-5 border-green-500/30 text-green-500">Brouillon enregistré</Badge>}
              {autoSaveStatus === "error" && <Badge variant="outline" className="text-xs py-0 h-5 border-destructive/30 text-destructive text-[10px]">Erreur de sauvegarde</Badge>}
            </div>
          </DialogTitle>
          <DialogDescription>
            {editingEventId ? `ID: ${editingEventId.split('-')[0].toUpperCase()}` : "Créez ou modifiez un événement."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Statut</Label>
              <Select value={eventForm.status || "brouillon"} onValueChange={(v: any) => setEventForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className={eventForm.status === 'publié' ? 'border-green-500/50 text-green-500' : 'border-orange-500/50 text-orange-500'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon" className="text-orange-500">Brouillon</SelectItem>
                  <SelectItem value="publié" className="text-green-500">Publié / En ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Catégorie</Label>
              <Select value={eventForm.category || "soirée"} onValueChange={(v) => setEventForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="soirée">Soirée</SelectItem>
                  <SelectItem value="conférence">Conférence</SelectItem>
                  <SelectItem value="atelier">Atelier</SelectItem>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="seminaire">Séminaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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

            <div className="space-y-2"><Label>WhatsApp Contact</Label><Input placeholder="+241077617776" value={eventForm.whatsapp_number || ""} onChange={(e) => setEventForm(p => ({ ...p, whatsapp_number: e.target.value }))} /></div>

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
          
          <div className="bg-gold/5 border border-gold/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-bold flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-gold" /> Envoyer aux abonnés Newsletter
                </Label>
                <p className="text-xs text-muted-foreground">
                  {eventForm.status === 'brouillon' 
                    ? "Publiez l'événement pour pouvoir envoyer la newsletter." 
                    : "Les invitations seront envoyées dès la publication."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {eventForm.newsletter_status === 'sent' && (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30 font-bold uppercase text-[10px]">Déjà envoyé</Badge>
                )}
                <Switch 
                  disabled={eventForm.newsletter_status === 'sent' || eventForm.status === 'brouillon'}
                  checked={eventForm.newsletter_status === 'sent' || (eventForm.send_newsletter === undefined ? true : eventForm.send_newsletter)}
                  onCheckedChange={(checked) => setEventForm(p => ({ ...p, send_newsletter: checked }))}
                />
              </div>
            </div>
          </div>
          
          <Button 
            variant={eventForm.status === 'publié' ? "outline" : "gold"}
            className={`w-full h-16 mt-4 text-xl font-bold shadow-2xl rounded-2xl group relative overflow-hidden ${eventForm.status === 'publié' ? 'border-green-500 text-green-500 hover:bg-green-50' : 'shadow-gold/30'}`} 
            onClick={handleSaveEvent} 
            disabled={isUploading || isSavingEvent}
          >
            {isSavingEvent ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto relative z-10" />
            ) : (
              <span className="relative z-10">
                {eventForm.status === 'publié' ? "Mettre à jour la publication" : "Publier maintenant"}
              </span>
            )}
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
              {(selectedTicket.status === 'validé' || selectedTicket.status === 'utilisé') && (
                <Button className="flex-1 bg-gold text-[#32140c] hover:bg-gold/90 font-bold" onClick={() => downloadTicket(selectedTicket.id)}>
                  {isDownloading === selectedTicket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Télécharger PDF
                </Button>
              )}
              {selectedTicket.status === 'soumis' && (
                <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold" onClick={() => { setShowTicketModal(false); setConfirmValidateOpen(true); }}>
                  Valider le billet
                </Button>
              )}
              {selectedTicket.status !== 'utilisé' && selectedTicket.status !== 'annulé' && (
                <Button variant="outline" className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => cancelTicket(selectedTicket.id)}>
                  Annuler
                </Button>
              )}
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

      {/* MODAL REDACTION NEWSLETTER */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[30px] p-8 border-gold/10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display font-bold">Rédiger une newsletter</DialogTitle>
            <DialogDescription>
              {newsletterForm.sendToAll 
                ? `Envoi à tous les abonnés (${subscribers.length})` 
                : `Envoi à ${selectedEmails.length} destinataires sélectionnés`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Objet du mail</Label>
              <Input 
                placeholder="Ex: Nouvelle offre exclusive..." 
                value={newsletterForm.subject}
                onChange={(e) => setNewsletterForm(p => ({ ...p, subject: e.target.value }))}
                className="h-12 text-lg font-semibold border-gold/20"
              />
            </div>
            
            <div className="space-y-2 flex items-center gap-3 bg-gold/5 p-4 rounded-xl border border-gold/10">
              <Switch 
                id="send-to-all" 
                checked={newsletterForm.sendToAll} 
                onCheckedChange={(v) => setNewsletterForm(p => ({ ...p, sendToAll: v }))} 
              />
              <Label htmlFor="send-to-all" className="cursor-pointer font-bold">Envoyer à toute la liste</Label>
            </div>

            <div className="space-y-2">
              <Label>Contenu du message</Label>
              <div className="bg-white text-black rounded-xl overflow-hidden border border-border min-h-[300px]">
                <ReactQuill 
                  theme="snow" 
                  value={newsletterForm.content} 
                  onChange={(val) => setNewsletterForm(p => ({ ...p, content: val }))}
                  modules={quillModules}
                  className="h-[250px] mb-12"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Label className="text-base">Pièce jointe (Optionnel)</Label>
              {!newsletterForm.attachmentFile ? (
                <Label 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-2xl cursor-pointer bg-secondary/20 hover:bg-gold/5 hover:border-gold/30 transition-all group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-gold/50 group-hover:text-gold transition-colors" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-gold">Cliquez pour parcourir</span> ou glissez un fichier
                    </p>
                    <p className="text-xs text-muted-foreground/60">PDF, Images, DOC (Max 5MB)</p>
                  </div>
                  <Input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setNewsletterForm(p => ({ ...p, attachmentFile: e.target.files?.[0] || null }))}
                    className="hidden"
                  />
                </Label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gold/5 border border-gold/20 rounded-xl relative overflow-hidden group transition-all">
                  <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="flex items-center gap-4 overflow-hidden relative z-10 w-full">
                    <div className="p-3 bg-white shadow-sm border border-border/50 rounded-lg shrink-0">
                      <FileText className="h-6 w-6 text-gold" />
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-sm font-bold truncate text-foreground">{newsletterForm.attachmentFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(newsletterForm.attachmentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 h-10 w-10 ml-2"
                      onClick={(e) => { e.preventDefault(); setNewsletterForm(p => ({ ...p, attachmentFile: null })); }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button 
              variant="gold" 
              className="w-full h-16 text-xl font-bold shadow-2xl rounded-2xl mt-8" 
              onClick={handleSendManualNewsletter}
              disabled={isSendingNewsletter}
            >
              {isSendingNewsletter ? <Loader2 className="h-6 w-6 animate-spin" /> : "Envoyer la newsletter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL HISTORIQUE NEWSLETTER */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col rounded-[30px] p-8 border-gold/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Historique des envois</DialogTitle>
            <DialogDescription>Retrouvez vos campagnes de newsletter passées.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-6 pr-2">
            {newsletterHistory.length === 0 ? (
              <div className="text-center py-20 opacity-50 italic">Aucun envoi enregistré.</div>
            ) : (
              <div className="space-y-4">
                {newsletterHistory.map((item: any) => (
                  <div key={item.id} className="p-5 glass-card rounded-2xl border border-border/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gold">{item.subject}</h4>
                      <Badge variant="outline" className="text-[10px] opacity-70">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/20 text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{item.recipient_count} destinataires</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-500 font-bold">
                        <CheckCircle className="h-3 w-3" />
                        <span>{item.success_count} succès</span>
                      </div>
                      {item.fail_count > 0 && (
                        <div className="flex items-center gap-2 text-destructive font-bold">
                          <XCircle className="h-3 w-3" />
                          <span>{item.fail_count} échecs</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
