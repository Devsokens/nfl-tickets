import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, CheckCircle2, MailX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewsletterAPI } from "@/lib/api";

/**
 * Désabonnement en libre-service — utilisé par le lien générique inclus
 * dans les newsletters envoyées en groupe (BCC). Un envoi BCC partage un
 * seul corps de message entre tous les destinataires, donc un lien de
 * désabonnement personnalisé par email n'est plus possible ; l'utilisateur
 * saisit ici son adresse au lieu de cliquer un lien à jeton unique.
 */
const NewsletterUnsubscribe = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await NewsletterAPI.unsubscribeSelf(email.trim());
      setDone(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e11] flex items-center justify-center px-4 py-16 text-white">
      <Helmet>
        <title>Désabonnement newsletter | NFL Courtier & Service</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md text-center">
        {done ? (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h1 className="text-xl font-bold">Désabonnement confirmé</h1>
            <p className="text-white/60 text-sm">
              Si <strong className="text-white">{email}</strong> était inscrit à la newsletter NFL, il ne recevra plus d'emails.
            </p>
            <Link to="/" className="inline-block text-[#e3bd51] text-xs font-bold uppercase tracking-wider mt-4">Retour au site</Link>
          </div>
        ) : (
          <>
            <MailX className="w-8 h-8 text-[#e3bd51] mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Se désabonner de la newsletter</h1>
            <p className="text-white/60 text-sm mb-8">Saisis l'adresse email que tu souhaites retirer de la liste.</p>
            <form onSubmit={handleSubmit} className="bg-[#14161a] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-left">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
              <Button type="submit" variant="gold" className="w-full h-12 font-bold" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Me désabonner
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterUnsubscribe;
