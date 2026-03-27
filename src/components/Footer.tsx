import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-gold">NFL</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Courtier &amp; Service de référence au Gabon. Nous créons des ponts entre 
              le prestige et vous, pour des moments gravés à jamais.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-primary-foreground/5 rounded-full hover:bg-gold hover:text-primary transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/5 rounded-full hover:bg-gold hover:text-primary transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/5 rounded-full hover:bg-gold hover:text-primary transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Navigation</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li><Link to="/" className="hover:text-gold transition-colors">Accueil</Link></li>
              <li><Link to="/events" className="hover:text-gold transition-colors">Nos événements</Link></li>
              <li><button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-gold transition-colors">À propos</button></li>
              <li><Link to="/admin/login" className="hover:text-gold transition-colors">Connexion Admin</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Contact</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span>+241 077 75 73 83</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span>contact@nfl-gabon.com</span>
              </li>
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0" />
                <span>Libreville, Gabon</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-semibold text-lg">Newsletter</h4>
            <p className="text-sm text-primary-foreground/70">
              Recevez nos invitations exclusives directement dans votre boîte mail.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Votre email" 
                className="bg-primary-foreground/5 border-primary-foreground/10 focus-visible:ring-gold text-white"
              />
              <Button variant="gold" size="sm" className="px-4">
                S'inscrire
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} NFL Courtier &amp; service. Tous droits réservés.
          </p>
          <div className="flex gap-8 text-xs text-primary-foreground/40">
            <a href="#" className="hover:text-gold">Mentions Légales</a>
            <a href="#" className="hover:text-gold">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
