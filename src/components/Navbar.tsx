import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import nflLogo from "@/assets/LOGO_NFL-removebg-preview.png";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) { // scrolling down
          setIsVisible(false);
        } else { // scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  const handleScroll = (id: string) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`sticky top-0 z-50 border-b border-border bg-primary/95 backdrop-blur-md transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={nflLogo} alt="NFL Courtier & service" className="h-20 w-auto transition-transform hover:scale-105" />
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
            onClick={() => handleScroll("about")}
            className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors"
          >
            À propos
          </button>
          <Link
            to="/events"
            className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors"
          >
            Nos événements
          </Link>
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
              <button onClick={() => { handleScroll("about"); }} className="text-lg font-medium text-left text-primary-foreground hover:text-gold transition-colors">À propos</button>
              <Link to="/events" className="text-lg font-medium text-primary-foreground hover:text-gold transition-colors">Nos événements</Link>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
