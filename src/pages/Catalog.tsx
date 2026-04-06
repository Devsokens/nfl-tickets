import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Filter, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";
import { EventsAPI, type Event } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: allEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ["allEvents"],
    queryFn: EventsAPI.getAll,
  });

  const filteredAndSortedEvents = useMemo(() => {
    // 1. Filter
    let filtered = allEvents.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // 2. Separate Upcoming and Past
    const today = new Date().setHours(0, 0, 0, 0);
    const upcoming = filtered.filter(e => new Date(e.date).getTime() >= today);
    const past = filtered.filter(e => new Date(e.date).getTime() < today);

    // 3. Sort
    // Upcoming: Date Ascending (closest first)
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Past: Date Descending (most recent first)
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return [...upcoming, ...past];
  }, [allEvents, searchQuery, categoryFilter]);

  const categories = ["all", "soirée", "conférence", "atelier", "concert"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-4xl mb-12 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8 group text-sm font-medium">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Catalogue des <span className="text-gradient-gold">événements</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explorez nos masterclass, séminaires et événements exclusifs. Utilisez les filtres pour trouver la session qui transformera votre carrière.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="glass-card p-6 rounded-[2rem] border border-gold/10 mb-12 flex flex-col md:flex-row gap-4 items-center animate-fade-in shadow-xl bg-white/5 backdrop-blur-xl">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un événement..." 
              className="pl-12 h-14 bg-background/50 border-gold/10 focus-visible:ring-gold rounded-2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="w-full md:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-14 bg-background/50 border-gold/10 rounded-2xl focus:ring-gold">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gold" />
                  <SelectValue placeholder="Catégorie" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gold/10">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat === "all" ? "Toutes catégories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || categoryFilter !== "all") && (
            <Button 
              variant="ghost" 
              onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}
              className="text-muted-foreground hover:text-destructive h-14 px-6 rounded-2xl"
            >
              Réinitialiser
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 w-full gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold"></div>
            <p className="text-gold font-medium animate-pulse">Chargement du catalogue...</p>
          </div>
        ) : filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-[3rem] border border-dashed border-gold/20 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-gold/5 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-gold/40" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">Aucun résultat trouvé</p>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Essayez d'ajuster vos critères de recherche ou de changer de catégorie.
              </p>
            </div>
            <Button variant="gold" onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }} className="rounded-full px-8">
              Effacer les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedEvents.map((event, i) => (
              <div
                key={event.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 80, 800)}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
