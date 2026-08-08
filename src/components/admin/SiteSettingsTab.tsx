import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteSettingsAPI, EmailTemplatesAPI, type SiteSettings, type EmailTemplate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Search, ScrollText, Info, Mail, Bell, TicketX } from "lucide-react";

const emptySettings: SiteSettings = {};

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="glass-card rounded-3xl p-8 border border-border/50 space-y-5">
    <h3 className="font-bold text-lg flex items-center gap-2">{icon} {title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, placeholder }: { label: string; value?: string | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input value={value || ""} onChange={onChange} placeholder={placeholder} className="bg-card border-border/50" />
  </div>
);

const Toggle = ({ label, description, checked, onChange, danger }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; danger?: boolean;
}) => (
  <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${danger ? "border-destructive/30 bg-destructive/5" : "border-border/50 bg-card"}`}>
    <div className="min-w-0">
      <p className="font-semibold text-sm">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} className="shrink-0" />
  </div>
);

// Placeholders disponibles par template — informatif uniquement, à titre indicatif pour l'admin.
const TEMPLATE_PLACEHOLDERS: Record<string, string> = {
  contact_acknowledgment: "{{name}}, {{subject}}",
  appointment_confirmed: "{{name}}, {{appointment_date}}, {{appointment_notes}}",
  request_rejected: "{{name}}, {{reason}}",
};

const EmailTemplateCard = ({ template, onSaved }: { template: EmailTemplate; onSaved: (t: EmailTemplate) => void }) => {
  const [subject, setSubject] = useState(template.subject);
  const [bodyHtml, setBodyHtml] = useState(template.body_html);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await EmailTemplatesAPI.update(template.key, { subject, body_html: bodyHtml });
      onSaved(updated);
      toast.success("Template mis à jour !");
    } catch (err: any) {
      toast.error("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-border/50 rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-bold">{template.label}</h4>
          <p className="text-xs text-muted-foreground mt-1">Variables disponibles : <code className="text-gold">{TEMPLATE_PLACEHOLDERS[template.key] || "—"}</code></p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl shrink-0" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Objet</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-card border-border/50" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Corps du message (HTML)</Label>
        <Textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} className="bg-card border-border/50 min-h-[140px] font-mono text-xs" />
      </div>
    </div>
  );
};

const EmailTemplatesSection = () => {
  const { data: templates = [], isLoading, refetch } = useQuery<EmailTemplate[]>({
    queryKey: ["emailTemplates"],
    queryFn: EmailTemplatesAPI.getAll,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  }

  if (templates.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs bg-secondary/30 border border-border/50 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-gold shrink-0" />
        Aucun template trouvé — exécute le script SQL <code>002_demandes_and_email_templates.sql</code> dans Supabase.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((t) => (
        <EmailTemplateCard key={t.key} template={t} onSaved={() => refetch()} />
      ))}
    </div>
  );
};

/**
 * Réglages avancés : uniquement les champs SANS représentation visuelle sur
 * une page (donc impossibles à éditer en cliquant dessus dans l'Éditeur
 * visuel) — identité technique, SEO, liens légaux, emails automatiques.
 * Tout le reste (contact, réseaux sociaux, textes de page...) se modifie
 * directement depuis l'onglet "Éditeur visuel".
 */
const SiteSettingsTab = () => {
  const { data, isLoading } = useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: SiteSettingsAPI.get,
  });

  const [form, setForm] = useState<SiteSettings>(emptySettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = (key: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const setBool = (key: keyof SiteSettings) => (checked: boolean) =>
    setForm((p) => ({ ...p, [key]: checked }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await SiteSettingsAPI.update(form);
      toast.success("Réglages enregistrés !");
    } catch (err: any) {
      toast.error("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Réglages avancés</h2>
          <p className="text-sm text-muted-foreground mt-1">Champs sans équivalent visuel sur le site (SEO, identité technique, mentions légales, emails automatiques).</p>
        </div>
        <Button variant="gold" className="rounded-2xl h-12 px-6 shadow-xl shrink-0" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          Enregistrer
        </Button>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-xs bg-secondary/30 border border-border/50 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-gold shrink-0" />
        Le téléphone, l'email, l'adresse, les réseaux sociaux et tous les textes de page se modifient directement dans l'onglet <strong className="text-foreground">Éditeur visuel</strong>.
      </div>

      <div className="glass-card rounded-3xl p-8 border border-border/50 space-y-5">
        <h3 className="font-bold text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-gold" /> Notifications admin</h3>
        <p className="text-sm text-muted-foreground -mt-3">Alertes envoyées à l'admin pour une nouvelle demande de contact (email + push).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Email de notification"
            description="Un email t'est envoyé pour chaque nouvelle demande."
            checked={form.notify_admin_email_enabled !== false}
            onChange={setBool("notify_admin_email_enabled")}
          />
          <Toggle
            label="Notification push"
            description="Une notif push t'est envoyée (demande, réservation, témoignage)."
            checked={form.notify_admin_push_enabled !== false}
            onChange={setBool("notify_admin_push_enabled")}
          />
        </div>
        <Field
          label="Adresse de réception des notifications"
          value={form.admin_notification_email}
          onChange={set("admin_notification_email")}
          placeholder="Laisser vide pour utiliser l'adresse Gmail par défaut"
        />
      </div>

      <div className="glass-card rounded-3xl p-8 border border-border/50 space-y-5">
        <h3 className="font-bold text-lg flex items-center gap-2"><TicketX className="h-5 w-5 text-gold" /> Disponibilité des réservations</h3>
        <Toggle
          danger
          label="Suspendre toutes les réservations"
          description="Bloque instantanément toute nouvelle réservation sur le site, tous événements confondus (ex. incident de paiement). Les événements restent visibles."
          checked={!!form.reservations_paused}
          onChange={setBool("reservations_paused")}
        />
      </div>

      <Section icon={<Search className="h-5 w-5 text-gold" />} title="Identité technique">
        <Field label="Nom du site" value={form.site_name} onChange={set("site_name")} placeholder="NFL Courtier & Service" />
        <Field label="URL du site" value={form.site_url} onChange={set("site_url")} placeholder="https://nfl-ga.com" />
      </Section>

      <Section icon={<Search className="h-5 w-5 text-gold" />} title="SEO par défaut">
        <Field label="Suffixe du titre" value={form.meta_title_suffix} onChange={set("meta_title_suffix")} placeholder="| NFL Courtier & Service" />
        <Field label="Image Open Graph (partage)" value={form.og_image_url} onChange={set("og_image_url")} placeholder="URL de l'image" />
        <div className="md:col-span-2 space-y-2">
          <Label>Meta description par défaut</Label>
          <Input value={form.meta_description_default || ""} onChange={set("meta_description_default")} placeholder="Description affichée dans Google..." className="bg-card border-border/50" />
        </div>
      </Section>

      <Section icon={<ScrollText className="h-5 w-5 text-gold" />} title="Mentions légales">
        <Field label="Lien Mentions légales" value={form.legal_mentions_url} onChange={set("legal_mentions_url")} placeholder="https://... ou #" />
        <Field label="Lien Politique de confidentialité" value={form.privacy_policy_url} onChange={set("privacy_policy_url")} placeholder="https://... ou #" />
      </Section>

      <div className="space-y-5">
        <h3 className="font-bold text-lg flex items-center gap-2"><Mail className="h-5 w-5 text-gold" /> Emails automatiques</h3>
        <p className="text-sm text-muted-foreground -mt-3">Personnalise le contenu des emails envoyés automatiquement par le site (accusé de réception, confirmation de rendez-vous, refus de demande...).</p>
        <EmailTemplatesSection />
      </div>
    </div>
  );
};

export default SiteSettingsTab;
