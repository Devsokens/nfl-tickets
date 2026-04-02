import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import nflLogo from "@/assets/Logo_NFL_fond_blanc-removebg-preview.png";
import authBg from "@/assets/nfl img3.jpeg";
import { AuthAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      const res = await AuthAPI.login({ email, password });
      if (res.access_token) {
        localStorage.setItem("nfl_token", res.access_token);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans l'espace d'administration.",
        });
        navigate("/admin");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: err.response?.data?.message || "Identifiants incorrects.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Côté Gauche - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary">
        <div className="absolute inset-0 bg-[#32140c]/40 z-10" />
        <img 
          src={authBg} 
          alt="NFL Admin Authentication" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 p-12 z-20 bg-gradient-to-t from-[#32140c] via-transparent to-transparent">
          <h1 className="text-4xl font-display font-bold text-white mb-4">NFL Courtier & Service</h1>
          <p className="text-white/80 text-lg max-w-md">
            Interface de gestion administrative pour la billetterie, les événements et le suivi client.
          </p>
        </div>
      </div>

      {/* Côté Droit - Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-background relative">
        <Link 
          to="/" 
          className="absolute top-8 left-8 lg:left-24 flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour au site
        </Link>

        <div className="max-w-md w-full mx-auto space-y-8 animate-fade-in">
          <div className="text-center lg:text-left">
            <img src={nflLogo} alt="NFL Logo" className="h-24 w-auto mb-8 mx-auto lg:mx-0" />
            <h2 className="text-3xl font-display font-bold text-foreground">
              Espace Administration
            </h2>
            <p className="mt-3 text-muted-foreground">
              Veuillez saisir vos identifiants pour accéder au tableau de bord.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-secondary/30"
                    placeholder="admin@nflcourtier.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-secondary/30"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="gold" 
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" 
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter au Dashboard"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
