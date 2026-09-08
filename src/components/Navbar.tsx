import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { NewsletterAPI } from "@/lib/api";
import { useIsEditMode } from "@/lib/EditModeContext";
import nflLogoWhite from "@/assets/Logo_NFL_fond_blanc-removebg-preview.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const isEditMode = useIsEditMode();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Scroll state for morphing navbar (shrinks into floating pill when scrolled)
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue.";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: (err as { response?: { data?: { message?: string } } }).response?.data?.message || errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Active link: simple soulignement or, plutôt qu'un cadre/pilule.
  const navLinkClass = (active: boolean) =>
    `text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 px-4 py-2 flex items-center justify-center border-b-2 ${
      active
        ? "text-white font-semibold border-[#e3bd51]"
        : "text-white/70 hover:text-white border-transparent"
    }`;

  const guardNav = (fallback?: () => void) => (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      return;
    }
    fallback?.();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out">
      <div className={`transition-all duration-500 ease-in-out ${isScrolled ? "px-4 sm:px-8 pt-3" : "px-0 pt-0"}`}>
        <nav
          className={`transition-all duration-500 ease-in-out flex items-center justify-between ${
            isScrolled
              ? "max-w-xl sm:max-w-2xl mx-auto h-11 sm:h-12 rounded-full bg-[#100906]/90 backdrop-blur-xl border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.8)] px-4 sm:px-6"
              : isHome
              ? "w-full h-20 sm:h-24 rounded-none bg-transparent border-none px-4 sm:px-10"
              : "w-full h-20 sm:h-24 rounded-none bg-[#100906]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-10"
          }`}
        >
          <div className={`w-full mx-auto h-full flex items-center ${isScrolled ? "justify-center sm:justify-between" : "justify-between"}`}>
            {/* Logo (Left) — Masqué au scroll selon la demande */}
            {!isScrolled && (
              <Link
                to="/"
                onClick={guardNav(() => window.scrollTo({ top: 0, behavior: "smooth" }))}
                className="shrink-0 flex items-center gap-3 group"
              >
                <img
                  src="/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png"
                  alt="NFL Courtier & Service"
                  className="nfl-logo transition-all duration-500 object-contain drop-shadow"
                  style={{ height: "clamp(3.25rem, 8vw, 4.25rem)" }}
                />
              </Link>
            )}

            {/* Centered Navigation Links */}
            <div className={`hidden lg:flex items-center ${isScrolled ? "gap-1 mx-auto" : "gap-2"}`}>
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

            {/* Right Action Button (Audivoxa Pill CTA) */}
            <div className="hidden lg:block shrink-0">
              <Button
                variant="outline"
                size="sm"
                className={`text-xs font-semibold uppercase tracking-wider border-white/30 text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 shadow-md ${
                  isScrolled ? "rounded-full px-3.5 py-1 text-[11px]" : "rounded-full px-5 py-2"
                }`}
                asChild
              >
                <Link to="/contact" onClick={guardNav()}>RÉSERVER</Link>
              </Button>
            </div>

            {/* Mobile Sheet Navigation */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#0a0a0c]/98 backdrop-blur-2xl border-l-white/10 flex flex-col pt-16 gap-5 text-white">
                  <SheetHeader>
                    <SheetDescription className="sr-only text-left">Menu de navigation mobile pour NFL Courtier & Service</SheetDescription>
                  </SheetHeader>

                  <Link to="/" onClick={guardNav(() => window.scrollTo({ top: 0, behavior: "smooth" }))} className="text-lvl-subtitle font-bold uppercase tracking-wide text-white hover:text-[#e3bd51] transition-colors">Accueil</Link>
                  <Link to="/events" onClick={guardNav()} className="text-lvl-subtitle font-bold uppercase tracking-wide text-white hover:text-[#e3bd51] transition-colors">Événements</Link>
                  <Link to="/catalogue-formations" onClick={guardNav()} className="text-lvl-subtitle font-bold uppercase tracking-wide text-white hover:text-[#e3bd51] transition-colors">Catalogue Formation</Link>
                  <Link to="/contact" onClick={guardNav()} className="text-lvl-subtitle font-bold uppercase tracking-wide text-white hover:text-[#e3bd51] transition-colors">Contact</Link>

                  <Button variant="outline" className="w-full mt-2 border-white/30 text-white rounded-full py-3 hover:bg-white hover:text-black" asChild>
                    <Link to="/contact" onClick={guardNav()}>RÉSERVER</Link>
                  </Button>

                  <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                    <h4 className="text-lvl-footer font-semibold uppercase tracking-wider text-[#e3bd51]">Restez informés</h4>
                    <p className="text-lvl-footer text-white/70">Recevez nos invitations directement par email.</p>
                    <form className="flex flex-col gap-2" onSubmit={handleNewsletter}>
                      <input
                        type="email"
                        placeholder="Votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 text-white placeholder:text-white/50 border border-white/20 rounded-xl px-4 py-3 text-lvl-footer focus:outline-none focus:ring-2 focus:ring-[#e3bd51]/50"
                      />
                      <Button variant="gold" className="w-full bg-[#e3bd51] text-black rounded-xl" disabled={isLoading}>
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
