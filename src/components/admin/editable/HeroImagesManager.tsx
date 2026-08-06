import { useState } from "react";
import { ImagePlus, Loader2, X, Images } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { EventsAPI } from "@/lib/api";
import { toast } from "sonner";

interface HeroImagesManagerProps {
  images: string[];
  onSave: (images: string[]) => Promise<any>;
}

/**
 * Bouton flottant affiché en coin du diaporama du hero (uniquement en mode
 * édition). Le carrousel qui fondu-enchaîne plusieurs images ne se prête pas
 * à un clic direct sur "l'image active" — on gère donc la liste via un petit
 * plateau de vignettes (ajouter / retirer), plutôt que de tenter de
 * superposer des contrôles sur chaque diapositive animée.
 */
export const HeroImagesManager = ({ images, onSave }: HeroImagesManagerProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await EventsAPI.uploadImage(formData);
      await onSave([...images, res.imageUrl]);
      toast.success("Image ajoutée !");
    } catch {
      toast.error("Échec de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (idx: number) => {
    await onSave(images.filter((_, i) => i !== idx));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="absolute top-3 right-3 z-40 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-full backdrop-blur-md border border-white/20 transition-colors"
        >
          <Images className="w-3.5 h-3.5 text-[#e3bd51]" /> Images du diaporama
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-[200] space-y-3" align="end">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Images du diaporama</Label>
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border/50 group">
              <img src={img} className="w-full h-full object-cover" alt="" />
              {images.length > 1 && (
                <button
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <label className={`aspect-video rounded-lg border-2 border-dashed border-[#e3bd51]/40 flex items-center justify-center cursor-pointer hover:bg-[#e3bd51]/5 transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-[#e3bd51]" /> : <ImagePlus className="h-4 w-4 text-[#e3bd51]" />}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HeroImagesManager;
