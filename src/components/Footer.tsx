import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NewsletterAPI } from "@/lib/api";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    <footer className="border-t border-border bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-gold">NFL COURTIER & SERVICE</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Cabinet de formation et services événementiels. L'exigence du résultat pour vos équipes et vos événements.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg hover:text-gold transition-colors duration-300">Navigation</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-gold transition-colors block">Accueil</button></li>
              <li><button onClick={() => document.getElementById('evenements')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-gold transition-colors text-left">Prochaines dates</button></li>
              <li><button onClick={() => document.getElementById('evenements-passes')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-gold transition-colors text-left">Événements passés</button></li>
              {/* <li><button onClick={() => document.getElementById('formations')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-gold transition-colors text-left">Formations Privées</button></li>
              <li><button onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-gold transition-colors text-left">FAQ</button></li>
              <li><button onClick={() => document.getElementById('biographie')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-gold transition-colors text-left">Biographie</button></li> */}
              <li><button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-gold transition-colors text-left">Contact</button></li>
              <li><Link to="/admin/login" className="hover:text-gold transition-colors block text-gold/60">Connexion Admin</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg hover:text-gold transition-colors duration-300">Contact</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span>+241 066 69 23 38</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <a href="mailto:seminaireslao@outlook.fr" className="hover:text-gold transition-colors">seminaireslao@outlook.fr</a>
              </li>
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0" />
                <span>Libreville, Gabon</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-lg hover:text-gold transition-colors duration-300">Newsletter</h4>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Inscrivez-vous pour recevoir nos dernières actualités et offres exclusives.
            </p>
            <form className="flex flex-col gap-3 group" onSubmit={handleNewsletter}>
              <input 
                type="email" 
                placeholder="Votre email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all placeholder:text-gray-400 group-hover:border-gold/30"
              />
              <button disabled={isLoading} className="bg-gold hover:bg-gold-dark text-primary font-bold py-3 rounded-xl transition-all shadow-lg shadow-gold/20 active:scale-95 disabled:opacity-50">
                {isLoading ? "En cours..." : "S'abonner"}
              </button>
            </form>
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
