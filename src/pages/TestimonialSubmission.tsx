import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Loader2, CheckCircle2, AlertTriangle, ImagePlus, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TestimonialsAPI, EventsAPI } from "@/lib/api";
import { toast } from "sonner";

/**
 * Page publique, mais volontairement non listée/liée nulle part sur le
 * site : on n'y accède qu'via le lien privé envoyé dans l'email de
 * certificat (billet + jeton signé). Voir testimonials.service.ts côté
 * backend pour la validation du lien.
 */
const TestimonialSubmission = () => {
  const { ticketId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["testimonial-submission-info", ticketId, token],
    queryFn: () => TestimonialsAPI.getSubmissionInfo(ticketId!, token),
    enabled: !!ticketId && !!token,
    retry: false,
  });

  const [quote, setQuote] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await EventsAPI.uploadImage(formData);
      setAvatarUrl(res.imageUrl);
    } catch {
      toast.error("Échec de l'upload de la photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quote.trim().length < 10) {
      toast.error("Votre témoignage doit contenir au moins 10 caractères.");
      return;
    }
    setIsSubmitting(true);
    try {
      await TestimonialsAPI.submit({
        ticket_id: ticketId!,
        token,
        quote: quote.trim(),
        author_role: role || undefined,
        author_company: company || undefined,
        avatar_url: avatarUrl || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#0d0e11] flex items-center justify-center px-4 py-16 text-white">
      <Helmet>
        <title>Partager mon témoignage | NFL Courtier & Service</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );

  if (!ticketId || !token) {
    return (
      <Shell>
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <h1 className="text-xl font-bold">Lien incomplet</h1>
          <p className="text-white/60 text-sm">Ce lien de témoignage semble incomplet. Utilise le lien reçu par email.</p>
        </div>
      </Shell>
    );
  }

  if (isLoading) {
    return <Shell><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#e3bd51]" /></div></Shell>;
  }

  if (isError) {
    const msg = (error as any)?.response?.data?.message || "Ce lien n'est plus valide.";
    return (
      <Shell>
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <h1 className="text-xl font-bold">Lien invalide</h1>
          <p className="text-white/60 text-sm">{msg}</p>
          <Link to="/" className="inline-block text-[#e3bd51] text-xs font-bold uppercase tracking-wider mt-4">Retour au site</Link>
        </div>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell>
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold">Merci {data?.author_name} !</h1>
          <p className="text-white/60 text-sm">Votre témoignage a bien été reçu. Il sera publié sur le site après validation par notre équipe.</p>
          <Link to="/" className="inline-block text-[#e3bd51] text-xs font-bold uppercase tracking-wider mt-4">Retour au site</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="text-center mb-8 space-y-2">
        <Quote className="w-8 h-8 text-[#e3bd51] mx-auto" />
        <h1 className="text-2xl font-bold">Partagez votre expérience</h1>
        <p className="text-white/60 text-sm">
          Bonjour <strong className="text-white">{data?.author_name}</strong>
          {data?.event_title && <> — merci d'avoir participé à <strong className="text-white">{data.event_title}</strong></>}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#14161a] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-4">
          <div
            className="relative w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-[#e3bd51]/30 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden group"
            onClick={() => document.getElementById("testimonial-avatar")?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#e3bd51]" />
            ) : avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <ImagePlus className="h-5 w-5 text-[#e3bd51]/60" />
            )}
            <input id="testimonial-avatar" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
          </div>
          <p className="text-xs text-white/50">Photo (optionnel) — clique pour ajouter</p>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Votre témoignage</Label>
          <Textarea
            required
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Qu'avez-vous pensé de l'événement ?"
            className="bg-white/5 border-white/10 text-white min-h-[120px] placeholder:text-white/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">Poste (optionnel)</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Directrice Commerciale" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Société (optionnel)</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Elite Ventures Group" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
        </div>

        <Button type="submit" variant="gold" className="w-full h-12 font-bold" disabled={isSubmitting || isUploading}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Envoyer mon témoignage
        </Button>
      </form>
    </Shell>
  );
};

export default TestimonialSubmission;
