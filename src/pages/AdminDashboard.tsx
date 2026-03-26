import { useState } from "react";
import { mockEvents, mockTickets, type Event, type Ticket } from "@/lib/mockData";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

type Tab = "dashboard" | "events" | "tickets" | "scanner";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchTicket, setSearchTicket] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState("");

  // Stats
  const totalTickets = tickets.length;
  const totalRevenue = tickets
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => {
      const event = events.find((e) => e.id === t.eventId);
      return sum + (event?.price || 0);
    }, 0);
  const activeEvents = events.filter((e) => new Date(e.date) >= new Date()).length;

  // Event form state
  const [eventForm, setEventForm] = useState<Partial<Event>>({});
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const handleSaveEvent = () => {
    if (editingEventId) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEventId ? { ...e, ...eventForm } as Event : e))
      );
    } else {
      const newEvent: Event = {
        id: String(Date.now()),
        title: eventForm.title || "Nouvel événement",
        description: eventForm.description || "",
        date: eventForm.date || new Date().toISOString().split("T")[0],
        time: eventForm.time || "20:00",
        location: eventForm.location || "",
        price: eventForm.price || 0,
        currency: "FCFA",
        image: "",
        category: (eventForm.category as Event["category"]) || "soirée",
        capacity: eventForm.capacity || 100,
        ticketsSold: 0,
        whatsappNumber: eventForm.whatsappNumber || "+2250700000000",
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    setEventForm({});
    setEditingEventId(null);
    setEventDialogOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleEditEvent = (event: Event) => {
    setEventForm(event);
    setEditingEventId(event.id);
    setEventDialogOpen(true);
  };

  // Ticket form
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", phone: "", eventId: "" });

  const handleAddTicket = () => {
    const newTicket: Ticket = {
      id: `TK-${String(tickets.length + 1).padStart(3, "0")}`,
      eventId: ticketForm.eventId,
      name: ticketForm.name,
      email: ticketForm.email,
      phone: ticketForm.phone,
      qrCode: `EVT${ticketForm.eventId}-TK${String(tickets.length + 1).padStart(3, "0")}-2026`,
      status: "valid",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTickets((prev) => [...prev, newTicket]);
    setTicketForm({ name: "", email: "", phone: "", eventId: "" });
    setTicketDialogOpen(false);
  };

  const handleScanQR = () => {
    const ticket = tickets.find((t) => t.qrCode === scanInput);
    if (!ticket) {
      setScanResult("❌ Ticket non trouvé");
    } else if (ticket.status === "used") {
      setScanResult("⚠️ Ticket déjà utilisé");
    } else if (ticket.status === "cancelled") {
      setScanResult("❌ Ticket annulé");
    } else {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: "used" as const } : t))
      );
      const event = events.find((e) => e.id === ticket.eventId);
      setScanResult(`✅ Valide — ${ticket.name} pour "${event?.title}"`);
    }
    setScanInput("");
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTicket.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTicket.toLowerCase()) ||
      t.qrCode.toLowerCase().includes(searchTicket.toLowerCase())
  );

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: "dashboard", icon: <BarChart3 className="h-4 w-4" />, label: "Dashboard" },
    { key: "events", icon: <Calendar className="h-4 w-4" />, label: "Événements" },
    { key: "tickets", icon: <TicketIcon className="h-4 w-4" />, label: "Tickets" },
    { key: "scanner", icon: <QrCode className="h-4 w-4" />, label: "Scanner" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="font-display font-bold">Admin Panel</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-secondary rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold">Tableau de bord</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TicketIcon className="h-5 w-5 text-gold" />
                  <span className="text-sm">Tickets émis</span>
                </div>
                <p className="text-3xl font-display font-bold">{totalTickets}</p>
              </div>
              <div className="glass-card rounded-xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-5 w-5 text-gold" />
                  <span className="text-sm">Revenus estimés</span>
                </div>
                <p className="text-3xl font-display font-bold">
                  {totalRevenue.toLocaleString()} <span className="text-base text-muted-foreground">FCFA</span>
                </p>
              </div>
              <div className="glass-card rounded-xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5 text-gold" />
                  <span className="text-sm">Événements actifs</span>
                </div>
                <p className="text-3xl font-display font-bold">{activeEvents}</p>
              </div>
            </div>

            {/* Recent tickets */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Derniers tickets</h3>
              <div className="space-y-3">
                {tickets.slice(-5).reverse().map((ticket) => {
                  const event = events.find((e) => e.id === ticket.eventId);
                  return (
                    <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-sm">{ticket.name}</p>
                        <p className="text-xs text-muted-foreground">{event?.title}</p>
                      </div>
                      <Badge
                        className={
                          ticket.status === "valid"
                            ? "bg-green-100 text-green-800 border-0"
                            : ticket.status === "used"
                            ? "bg-secondary text-muted-foreground border-0"
                            : "bg-destructive/10 text-destructive border-0"
                        }
                      >
                        {ticket.status === "valid" ? "Valide" : ticket.status === "used" ? "Utilisé" : "Annulé"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Events CRUD */}
        {activeTab === "events" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Gestion des événements</h2>
              <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="gold"
                    onClick={() => {
                      setEventForm({});
                      setEditingEventId(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display">
                      {editingEventId ? "Modifier l'événement" : "Nouvel événement"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Titre</Label>
                      <Input value={eventForm.title || ""} onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={eventForm.description || ""} onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input type="date" value={eventForm.date || ""} onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Heure</Label>
                        <Input type="time" value={eventForm.time || ""} onChange={(e) => setEventForm((p) => ({ ...p, time: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Lieu</Label>
                      <Input value={eventForm.location || ""} onChange={(e) => setEventForm((p) => ({ ...p, location: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prix (FCFA)</Label>
                        <Input type="number" value={eventForm.price || ""} onChange={(e) => setEventForm((p) => ({ ...p, price: Number(e.target.value) }))} />
                      </div>
                      <div>
                        <Label>Capacité</Label>
                        <Input type="number" value={eventForm.capacity || ""} onChange={(e) => setEventForm((p) => ({ ...p, capacity: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Catégorie</Label>
                      <Select value={eventForm.category || ""} onValueChange={(v) => setEventForm((p) => ({ ...p, category: v as Event["category"] }))}>
                        <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soirée">Soirée</SelectItem>
                          <SelectItem value="conférence">Conférence</SelectItem>
                          <SelectItem value="atelier">Atelier</SelectItem>
                          <SelectItem value="concert">Concert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Numéro WhatsApp</Label>
                      <Input value={eventForm.whatsappNumber || ""} onChange={(e) => setEventForm((p) => ({ ...p, whatsappNumber: e.target.value }))} placeholder="+2250700000000" />
                    </div>
                    <Button variant="gold" className="w-full" onClick={handleSaveEvent}>
                      {editingEventId ? "Mettre à jour" : "Créer l'événement"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("fr-FR")} • {event.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gradient-gold font-bold">{event.price.toLocaleString()} FCFA</p>
                    <p className="text-xs text-muted-foreground">{event.ticketsSold}/{event.capacity} vendus</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditEvent(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tickets */}
        {activeTab === "tickets" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="font-display text-2xl font-bold">Gestion des tickets</h2>
              <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <Plus className="h-4 w-4 mr-1" /> Ajouter un ticket
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Nouveau ticket</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Événement</Label>
                      <Select value={ticketForm.eventId} onValueChange={(v) => setTicketForm((p) => ({ ...p, eventId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Choisir un événement" /></SelectTrigger>
                        <SelectContent>
                          {events.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nom complet</Label>
                      <Input value={ticketForm.name} onChange={(e) => setTicketForm((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={ticketForm.email} onChange={(e) => setTicketForm((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Téléphone</Label>
                      <Input value={ticketForm.phone} onChange={(e) => setTicketForm((p) => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <Button variant="gold" className="w-full" onClick={handleAddTicket}>
                      Générer le ticket
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, ID ou QR code..."
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const event = events.find((e) => e.id === ticket.eventId);
                return (
                  <div key={ticket.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{ticket.name}</p>
                        <Badge
                          className={
                            ticket.status === "valid"
                              ? "bg-green-100 text-green-800 border-0"
                              : ticket.status === "used"
                              ? "bg-secondary text-muted-foreground border-0"
                              : "bg-destructive/10 text-destructive border-0"
                          }
                        >
                          {ticket.status === "valid" ? "Valide" : ticket.status === "used" ? "Utilisé" : "Annulé"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ticket.id} • {event?.title} • {ticket.qrCode}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" /> Télécharger
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scanner */}
        {activeTab === "scanner" && (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-center">Scanner de tickets</h2>
            <p className="text-muted-foreground text-center text-sm">
              Entrez le code QR du ticket pour vérifier sa validité.
            </p>
            <div className="glass-card rounded-2xl p-8 space-y-4">
              <div className="w-24 h-24 mx-auto rounded-2xl gradient-gold flex items-center justify-center">
                <QrCode className="h-12 w-12 text-accent-foreground" />
              </div>
              <Input
                placeholder="Code QR (ex: EVT1-TK001-2026)"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScanQR()}
                className="text-center"
              />
              <Button variant="gold" className="w-full" onClick={handleScanQR}>
                Vérifier le ticket
              </Button>
              {scanResult && (
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <p className="font-medium text-lg">{scanResult}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
