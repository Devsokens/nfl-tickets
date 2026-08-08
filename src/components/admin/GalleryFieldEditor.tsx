import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { EventsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface GalleryFieldEditorProps {
  label?: string;
  hint?: string;
  images: string[];
  onChange: (images: string[]) => void;
}

/**
 * Éditeur de galerie réutilisable (grille de vignettes + tuile "ajouter"),
 * utilisé dans les formulaires événement/formation. Volontairement en
 * ligne dans le formulaire (pas en popover comme HeroImagesManager, pensé
 * pour l'édition directe sur la page publique) car ici on est déjà dans un
 * panneau de formulaire dédié.
 */
const GalleryFieldEditor = ({ label = "Galerie photos", hint, images, onChange }: GalleryFieldEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await EventsAPI.uploadImage(formData);
      onChange([...images, res.imageUrl]);
    } catch {
      toast.error("Échec de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {hint && <p className="text-xs text-muted-foreground -mt-1">{hint}</p>}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border/50 group">
            <img src={img} className="w-full h-full object-cover" alt="" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <label className={`aspect-square rounded-xl border-2 border-dashed border-gold/30 flex items-center justify-center cursor-pointer hover:bg-gold/5 transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : <ImagePlus className="h-5 w-5 text-gold" />}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
        </label>
      </div>
    </div>
  );
};

export default GalleryFieldEditor;
