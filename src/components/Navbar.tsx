import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { NewsletterAPI } from "@/lib/api";
import { useIsEditMode } from "@/lib/EditModeContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const isEditMode = useIsEditMode();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Scroll state for morphing navbar (floating pill when scrolled down)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const navLinkClass = (active: boolean) =>
    `text-xs font-bold uppercase tracking-wider transition-all duration-200 pb-1 border-b-2 ${
      active
        ? "text-[#e3bd51] border-[#e3bd51]"
        : "text-white/80 border-transparent hover:text-[#e3bd51]"
    }`;

  // Dans l'éditeur visuel de l'admin, ces liens pointent vers de vraies
  // routes du site : les laisser actifs ferait quitter l'aperçu (et l'admin
  // entier, puisque c'est la même appli). On neutralise donc la navigation
  // ici tout en gardant l'apparence identique au site public.
  const guardNav = (fallback?: () => void) => (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      return;
    }
    fallback?.();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out pointer-events-none">
      {/* Top Gold Accent Line */}
      <div
        className={`h-[3px] w-full bg-gradient-to-r from-[#b89535] via-[#e3bd51] to-[#b89535] transition-opacity duration-300 ${
          isScrolled ? "opacity-0 h-0" : "opacity-100"
        }`}
      />

      <div className={`transition-all duration-500 ease-in-out ${isScrolled ? "px-4 sm:px-8 pt-3" : "px-0 pt-0"}`}>
        <nav
          className={`pointer-events-auto transition-all duration-500 ease-in-out flex items-center justify-between ${
            isScrolled
              ? "max-w-5xl mx-auto h-20 sm:h-20 md:h-20 rounded-full bg-[#0c0d0f]/90 backdrop-blur-xl border border-[#e3bd51]/30 shadow-[0_15px_40px_rgba(0,0,0,0.8)] px-5 sm:px-8"
              : "w-full h-32 sm:h-28 md:h-28 rounded-none bg-[#0c0d0f]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8"
          }`}
        >
          <div className="container mx-auto px-0 h-full flex items-center justify-between">
            <Link
              to="/"
              onClick={guardNav(() => window.scrollTo({ top: 0, behavior: "smooth" }))}
              className="shrink-0"
            >
              <img
                src="/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png"
                alt="NFL Courtier & Service"
                className={`nfl-logo transition-all duration-500 ${
                  isScrolled ? "h-18 sm:h-18 md:h-20" : "h-28 sm:h-24 md:h-28"
                }`}
                style={{ height: isScrolled ? "clamp(4rem, 11vw, 5rem)" : "clamp(6rem, 18vw, 8rem)" }}
              />
            </Link>

            {/* Centered navigation links on desktop */}
            <div className="hidden lg:flex items-center gap-8 xl:gap-10">
              <Link
                to="/"
                onClick={guardNav(() => window.scrollTo({ top: 0, behavior: "smooth" }))}
                className={navLinkClass(isHome)}
              >
                Accueil
              </Link>
              <Link to="/events" onClick={guardNav()} className={navLinkClass(location.pathname === "/events")}>
                Événements
              </Link>
              <Link
                to="/catalogue-formations"
                onClick={guardNav()}
                className={navLinkClass(location.pathname === "/catalogue-formations")}
              >
                Catalogue Formation
              </Link>
              <Link to="/contact" onClick={guardNav()} className={navLinkClass(location.pathname === "/contact")}>
                Contact
              </Link>
            </div>

            {/* Right action button on desktop */}
            <div className="hidden lg:block shrink-0">
              <Button
                variant="gold"
                size="sm"
                className={`px-6 text-xs font-bold uppercase tracking-widest bg-[#e3bd51] hover:bg-[#d4af37] text-black transition-all ${
                  isScrolled ? "rounded-full py-2" : "rounded-none py-2.5"
                }`}
                asChild
              >
                <Link to="/events" onClick={guardNav()}>RÉSERVER</Link>
              </Button>
            </div>

            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#0c0d0f]/98 backdrop-blur-md border-l-white/10 flex flex-col pt-16 gap-5 text-white">
                  <SheetHeader>
                    <SheetDescription className="sr-only text-left">Menu de navigation mobile pour NFL Courtier & Service</SheetDescription>
                  </SheetHeader>

                  <Link to="/" onClick={guardNav(() => window.scrollTo({ top: 0, behavior: "smooth" }))} className="text-lg font-bold uppercase tracking-wide text-white hover:text-[#e3bd51] transition-colors">Accueil</Link>
                  <Link to="/events" onClick={guardNav()} className="text-lg font-bold uppercase tracking-wide text-white hover:text-[#e3bd51] transition-colors">Événements</Link>
                  <Link to="/catalogue-formations" onClick={guardNav()} className="text-lg font-bold uppercase tracking-wide text-white hover:text-[#e3bd51] transition-colors">Catalogue Formation</Link>
                  <Link to="/contact" onClick={guardNav()} className="text-lg font-bold uppercase tracking-wide text-white hover:text-[#e3bd51] transition-colors">Contact</Link>

                  <Button variant="gold" className="w-full mt-2 bg-[#e3bd51] text-black rounded-none" asChild>
                    <Link to="/events" onClick={guardNav()}>RÉSERVER</Link>
                  </Button>

                  <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#e3bd51]">Restez informés</h4>
                    <p className="text-sm text-white/70">Recevez nos invitations directement par email.</p>
                    <form className="flex flex-col gap-2" onSubmit={handleNewsletter}>
                      <input
                        type="email"
                        placeholder="Votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 text-white placeholder:text-white/50 border border-white/20 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e3bd51]/50"
                      />
                      <Button variant="gold" className="w-full bg-[#e3bd51] text-black rounded-none" disabled={isLoading}>
                        {isLoading ? "En cours..." : "S'abonner"}
                      </Button>
                    </form>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
