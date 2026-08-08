import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormationsAPI, EventsAPI, type Formation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, GraduationCap, ImageIcon, X } from "lucide-react";

const emptyForm: Partial<Formation> = { title: "", description: "", bullets: [], status: "brouillon", currency: "XAF" };

const FormationsTab = () => {
  const queryClient = useQueryClient();
  const { data: formations = [], isLoading, refetch } = useQuery<Formation[]>({
    queryKey: ["adminFormations"],
    queryFn: () => FormationsAPI.getAll(true),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Formation>>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [bulletInput, setBulletInput] = useState("");

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setBulletInput(""); setDialogOpen(true); };
  const openEdit = (f: Formation) => { setForm(f); setEditingId(f.id); setBulletInput(""); setDialogOpen(true); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await EventsAPI.uploadImage(formData);
      setForm((p) => ({ ...p, image_url: res.imageUrl }));
      toast.success("Image chargée !");
    } catch {
      toast.error("Échec de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const addBullet = () => {
    if (!bulletInput.trim()) return;
    setForm((p) => ({ ...p, bullets: [...(p.bullets || []), bulletInput.trim()] }));
    setBulletInput("");
  };

  const removeBullet = (idx: number) => {
    setForm((p) => ({ ...p, bullets: (p.bullets || []).filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.title) {
      toast.error("Le titre est obligatoire.");
      return;
    }
    setIsSaving(true);
    try {
      // Ne renvoyer que les champs éditables : `openEdit` initialise `form`
      // avec l'objet Formation complet renvoyé par l'API (id, slug,
      // created_at, updated_at inclus), que le backend rejette en 400 s'ils
      // sont présents dans le payload de mise à jour.
      const { id, created_at, updated_at, slug, ...payload } = form as any;
      if (editingId) {
        await FormationsAPI.update(editingId, payload);
        toast.success("Formation mise à jour.");
      } else {
        await FormationsAPI.create(payload);
        toast.success("Formation créée.");
      }
      queryClient.invalidateQueries({ queryKey: ["adminFormations"] });
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      setDialogOpen(false);
    } catch (err: any) {
      toast.error("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await FormationsAPI.delete(id);
      refetch();
      toast.info("Formation supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lvl-subtitle font-bold">Formations</h2>
          <p className="text-lvl-footer text-muted-foreground mt-1">Modules affichés dans le catalogue formation.</p>
        </div>
        <Button variant="gold" className="rounded-2xl h-12 px-6 shadow-xl" onClick={openCreate}>
          <Plus className="h-5 w-5 mr-2" /> Créer
        </Button>
      </div>

      {formations.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center border border-border/50 text-muted-foreground">
          Aucune formation pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((f) => (
            <div key={f.id} className="glass-card rounded-3xl overflow-hidden border border-border/50 flex flex-col h-full hover:border-gold/30 transition-all">
              <div className="h-32 bg-muted/20 relative">
                {f.image_url ? <img src={f.image_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center opacity-20"><GraduationCap className="h-10 w-10 text-gold" /></div>}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {f.badge && <Badge className="bg-primary/20 text-white backdrop-blur-md w-fit">{f.badge}</Badge>}
                  {f.status === 'brouillon' && <Badge className="bg-orange-500/80 text-white border-none w-fit">BROUILLON</Badge>}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-end gap-1 mb-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gold" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <h3 className="font-bold text-lvl-body mb-2">{f.title}</h3>
                <p className="text-lvl-footer text-muted-foreground line-clamp-2">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col gap-0 border-gold/10">
          <SheetHeader className="px-6 sm:px-8 py-6 border-b border-border/50 shrink-0 space-y-2">
            <SheetTitle className="text-lvl-subtitle font-bold text-foreground">{editingId ? "Modifier la formation" : "Nouvelle formation"}</SheetTitle>
            <SheetDescription>Ce module apparaîtra dans le catalogue formation une fois publié.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Statut</Label>
                <Select value={form.status || "brouillon"} onValueChange={(v: any) => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publié">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Badge</Label><Input value={form.badge || ""} onChange={(e) => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="VENDEUR D'ÉLITE" /></div>
            </div>
            <div className="space-y-2"><Label>Titre</Label><Input value={form.title || ""} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea className="min-h-[100px]" value={form.description || ""} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} /></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Catégorie</Label><Input value={form.category || ""} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} placeholder="vente, management..." /></div>
              <div className="space-y-2"><Label>Prix (XAF, optionnel)</Label><Input type="number" value={form.price ?? ""} onChange={(e) => setForm(p => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))} /></div>
            </div>

            <div className="space-y-2">
              <Label>Points clés</Label>
              <div className="flex gap-2">
                <Input value={bulletInput} onChange={(e) => setBulletInput(e.target.value)} placeholder="Ajouter un point clé..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBullet(); } }} />
                <Button type="button" variant="outline" onClick={addBullet}>Ajouter</Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(form.bullets || []).map((b, i) => (
                  <Badge key={i} variant="outline" className="pl-3 pr-1 py-1.5 gap-2">
                    {b}
                    <button onClick={() => removeBullet(i)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-lvl-footer font-semibold text-muted-foreground uppercase tracking-wider">Image</Label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group
                  ${isUploading ? "bg-muted/50 border-gold/20" : "bg-gold/5 border-gold/20 hover:border-gold hover:bg-gold/10"}`}
                onClick={() => document.getElementById("formation-image")?.click()}
              >
                <input id="formation-image" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                ) : form.image_url ? (
                  <img src={form.image_url} alt="Aperçu" className="w-full max-h-[160px] object-contain rounded-xl" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gold" />
                    <p className="text-lvl-footer text-muted-foreground">Cliquez pour charger une image</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <SheetFooter className="px-6 sm:px-8 py-5 border-t border-border/50 shrink-0 bg-card/50 backdrop-blur-sm sm:justify-stretch gap-2">
            <Button variant="ghost" className="rounded-xl" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button variant="gold" className="flex-1 h-10 rounded-xl shadow-lg shadow-gold/20" onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Enregistrer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FormationsTab;
