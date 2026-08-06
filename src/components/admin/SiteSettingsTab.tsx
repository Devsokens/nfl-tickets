import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteSettingsAPI, type SiteSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Search, ScrollText, Info } from "lucide-react";

const emptySettings: SiteSettings = {};

/**
 * Réglages avancés : uniquement les champs SANS représentation visuelle sur
 * une page (donc impossibles à éditer en cliquant dessus dans l'Éditeur
 * visuel) — identité technique, SEO, liens légaux. Tout le reste (contact,
 * réseaux sociaux, textes de page...) se modifie directement depuis
 * l'onglet "Éditeur visuel".
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

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="glass-card rounded-3xl p-8 border border-border/50 space-y-5">
      <h3 className="font-bold text-lvl-body flex items-center gap-2">{icon} {title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, placeholder }: { label: string; value?: string | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value || ""} onChange={onChange} placeholder={placeholder} className="bg-card border-border/50" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lvl-subtitle font-bold">Réglages avancés</h2>
          <p className="text-lvl-footer text-muted-foreground mt-1">Champs sans équivalent visuel sur le site (SEO, identité technique, mentions légales).</p>
        </div>
        <Button variant="gold" className="rounded-2xl h-12 px-6 shadow-xl shrink-0" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          Enregistrer
        </Button>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-lvl-footer bg-secondary/30 border border-border/50 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-gold shrink-0" />
        Le téléphone, l'email, l'adresse, les réseaux sociaux et tous les textes de page se modifient directement dans l'onglet <strong className="text-foreground">Éditeur visuel</strong>.
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
    </div>
  );
};

export default SiteSettingsTab;
