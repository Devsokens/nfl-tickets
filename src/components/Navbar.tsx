import { Link, useLocation, useNavigate } from "react-router-dom";
import nflLogo from "@/assets/Logo_NFL_fond_marron-removebg-preview.png";
import { Menu, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
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
      const el = document.getElementById(id);
      if (el) {
        const offset = 80; // height of navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
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
    <nav className="sticky top-0 z-50 bg-[#32140c]/95 backdrop-blur-md shadow-lg transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <img 
            src={nflLogo} 
            alt="NFL Courtier & service" 
            className="h-32 w-auto transition-all hover:scale-110 drop-shadow-2xl translate-y-2 lg:translate-y-4" 
          />
        </Link>
        <div className="hidden lg:flex items-center gap-6">

          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80 hover:text-gold transition-colors"
          >
            Accueil
          </Link>
          <button onClick={() => handleScroll("evenements")} className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80 hover:text-gold transition-colors">
            Prochaines dates
          </button>
          <button onClick={() => handleScroll("evenements-passes")} className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80 hover:text-gold transition-colors">
            Événements passés
          </button>
          {/* <button onClick={() => handleScroll("formations")} className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80 hover:text-gold transition-colors">
            Formations Privées
          </button>
          <button onClick={() => handleScroll("faq")} className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80 hover:text-gold transition-colors">
            FAQ
          </button>
          <button onClick={() => handleScroll("biographie")} className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80 hover:text-gold transition-colors">
            Biographie
          </button> */}
          <button onClick={() => handleScroll("contact")} className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80 hover:text-gold transition-colors">
            Contact
          </button>
        </div>
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#32140c]/98 backdrop-blur-md border-l-gold/20 flex flex-col pt-16 gap-5">
              <SheetHeader>
                <SheetTitle className="text-gold font-display font-bold text-2xl text-left">Navigation</SheetTitle>
                <SheetDescription className="sr-only text-left">Menu de navigation mobile pour NFL Courtier & Service</SheetDescription>
              </SheetHeader>

              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-lg font-bold uppercase tracking-wide text-primary-foreground hover:text-gold transition-colors">Accueil</Link>
              <button onClick={() => handleScroll("evenements")} className="text-lg font-bold uppercase tracking-wide text-left text-primary-foreground hover:text-gold transition-colors">Prochaines dates</button>
              <button onClick={() => handleScroll("evenements-passes")} className="text-lg font-bold uppercase tracking-wide text-left text-primary-foreground hover:text-gold transition-colors">Événements passés</button>
              {/* <button onClick={() => handleScroll("formations")} className="text-lg font-bold uppercase tracking-wide text-left text-primary-foreground hover:text-gold transition-colors">Formations Privées</button>
              <button onClick={() => handleScroll("faq")} className="text-lg font-bold uppercase tracking-wide text-left text-primary-foreground hover:text-gold transition-colors">FAQ</button>
              <button onClick={() => handleScroll("biographie")} className="text-lg font-bold uppercase tracking-wide text-left text-primary-foreground hover:text-gold transition-colors">Biographie</button> */}
              <button onClick={() => handleScroll("contact")} className="text-lg font-bold uppercase tracking-wide text-left text-primary-foreground hover:text-gold transition-colors">Contact</button>
              
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
