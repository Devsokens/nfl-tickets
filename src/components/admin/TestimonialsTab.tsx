import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TestimonialsAPI, type Testimonial } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Quote } from "lucide-react";

const emptyForm: Partial<Testimonial> = { author_name: "", quote: "", status: "publié" };

const TestimonialsTab = () => {
  const queryClient = useQueryClient();
  const { data: testimonials = [], isLoading, refetch } = useQuery<Testimonial[]>({
    queryKey: ["adminTestimonials"],
    queryFn: () => TestimonialsAPI.getAll(true),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Testimonial>>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (t: Testimonial) => { setForm(t); setEditingId(t.id); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.author_name || !form.quote) {
      toast.error("Le nom et le témoignage sont obligatoires.");
      return;
    }
    setIsSaving(true);
    try {
      // `openEdit` initialise `form` avec l'objet complet renvoyé par l'API
      // (id, created_at, updated_at inclus) : à exclure du payload envoyé,
      // sous peine de 400 côté backend.
      const { id, created_at, updated_at, ...payload } = form as any;
      if (editingId) {
        await TestimonialsAPI.update(editingId, payload);
        toast.success("Témoignage mis à jour.");
      } else {
        await TestimonialsAPI.create(payload);
        toast.success("Témoignage créé.");
      }
      queryClient.invalidateQueries({ queryKey: ["adminTestimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setDialogOpen(false);
    } catch (err: any) {
      toast.error("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TestimonialsAPI.delete(id);
      refetch();
      toast.info("Témoignage supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lvl-subtitle font-bold">Témoignages</h2>
          <p className="text-lvl-footer text-muted-foreground mt-1">Affichés dans le carrousel de la page d'accueil.</p>
        </div>
        <Button variant="gold" className="rounded-2xl h-12 px-6 shadow-xl" onClick={openCreate}>
          <Plus className="h-5 w-5 mr-2" /> Ajouter
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center border border-border/50 text-muted-foreground">
          Aucun témoignage pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="glass-card rounded-3xl p-6 border border-border/50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Quote className="h-6 w-6 text-gold/50" />
                {t.ticket_id && (
                  <Badge variant="outline" className="text-blue-600 border-blue-500/20 text-[10px] uppercase">Soumis par un participant</Badge>
                )}
              </div>
              <p className="text-lvl-footer text-muted-foreground italic line-clamp-4 flex-1">"{t.quote}"</p>
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div>
                  <p className="font-bold text-lvl-footer">{t.author_name}</p>
                  <p className="text-lvl-footer text-gold uppercase tracking-wider">{[t.author_role, t.author_company].filter(Boolean).join(", ")}</p>
                </div>
                <Badge variant="outline" className={t.status === 'publié' ? "text-green-600 border-green-500/20" : "text-orange-600 border-orange-500/20"}>
                  {t.status}
                </Badge>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gold" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px] rounded-[30px] p-8 border-gold/10">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le témoignage" : "Nouveau témoignage"}</DialogTitle>
            <DialogDescription>Ce témoignage apparaîtra dans le carrousel de la page d'accueil une fois publié.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom</Label><Input value={form.author_name || ""} onChange={(e) => setForm(p => ({ ...p, author_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Statut</Label>
                <Select value={form.status || "publié"} onValueChange={(v: any) => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publié">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Poste</Label><Input value={form.author_role || ""} onChange={(e) => setForm(p => ({ ...p, author_role: e.target.value }))} placeholder="CEO" /></div>
              <div className="space-y-2"><Label>Société</Label><Input value={form.author_company || ""} onChange={(e) => setForm(p => ({ ...p, author_company: e.target.value }))} placeholder="Elite Ventures Group" /></div>
            </div>
            <div className="space-y-2"><Label>Témoignage</Label><Textarea className="min-h-[120px]" value={form.quote || ""} onChange={(e) => setForm(p => ({ ...p, quote: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Ordre d'affichage</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm(p => ({ ...p, display_order: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button variant="gold" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsTab;
