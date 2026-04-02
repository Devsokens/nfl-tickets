import { Link, useLocation, useNavigate } from "react-router-dom";
import nflLogo from "@/assets/Logo_NFL_fond_marron-removebg-preview.png";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NewsletterAPI } from "@/lib/api";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScroll = (id: string) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(`/#${id}`);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await NewsletterAPI.subscribe(email);
      toast({
        title: "Inscription réussie",
        description: res.message || "Vous êtes bien inscrit à la newsletter.",
      });
      setEmail("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.response?.data?.message || "Une erreur est survenue.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#32140c]/95 backdrop-blur-md">
      <div className="container mx-auto px-4 h-28 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={nflLogo} alt="NFL Courtier & service" className="h-24 w-auto transition-transform hover:scale-105" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors"
          >
            Accueil
          </Link>
          <button
            onClick={() => handleScroll("evenements")}
            className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors"
          >
            Séminaires et Formations
          </button>
          <button
            onClick={() => handleScroll("vehicules-logistique")}
            className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors"
          >
            Véhicules et logistique
          </button>
          <button onClick={() => handleScroll("agence-voyage")} className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors">Agence de voyage</button>
          <button onClick={() => handleScroll("tourisme")} className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors">Tourisme</button>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-primary/95 backdrop-blur-md border-l-gold/20 flex flex-col pt-16 gap-6">
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-lg font-medium text-primary-foreground hover:text-gold transition-colors">Accueil</Link>
              <button onClick={() => { handleScroll("evenements"); }} className="text-lg font-medium text-left text-primary-foreground hover:text-gold transition-colors">Séminaires et Formations</button>
              <button onClick={() => { handleScroll("vehicules-logistique"); }} className="text-lg font-medium text-left text-primary-foreground hover:text-gold transition-colors">Véhicules et logistique</button>
              <button onClick={() => { handleScroll("agence-voyage"); }} className="text-lg font-medium text-left text-primary-foreground hover:text-gold transition-colors">Agence de voyage</button>
              <button onClick={() => { handleScroll("tourisme"); }} className="text-lg font-medium text-left text-primary-foreground hover:text-gold transition-colors">Tourisme</button>
              
              <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Restez informés</h4>
                <p className="text-sm text-primary-foreground/70">Recevez nos actualités directement par email.</p>
                <form className="flex flex-col gap-2" onSubmit={handleNewsletter}>
                  <input 
                    type="email" 
                    placeholder="Votre email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 text-white placeholder:text-white/50 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                  <Button variant="gold" className="w-full" disabled={isLoading}>
                    {isLoading ? "En cours..." : "S'abonner"}
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
