import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import nflLogo from "@/assets/LOGO_NFL-removebg-preview.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy authentication
    if (email && password) {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="inline-block p-4 rounded-2xl bg-primary">
            <img src={nflLogo} alt="NFL Courtier & service" className="h-16 w-auto" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-bold text-foreground">
          Espace Administration
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Veuillez vous connecter pour gérer la billetterie
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border/50">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium">
                Adresse email
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@nflcourtier.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium">
                Mot de passe
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button type="submit" variant="gold" className="w-full h-12 text-base rounded-xl">
                Se connecter
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au site public
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
