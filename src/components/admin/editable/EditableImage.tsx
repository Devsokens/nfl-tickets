import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { EventsAPI } from "@/lib/api";
import { useIsEditMode } from "@/lib/EditModeContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditableImageProps {
  src: string;
  alt?: string;
  onSave: (newUrl: string) => Promise<any>;
  /** Classes appliquées à la balise <img> — identiques à l'usage public. */
  className?: string;
  /** Classes du conteneur englobant (doit rester "relative"). */
  wrapperClassName?: string;
}

/**
 * Rend l'image telle quelle sur le site public. Dans l'éditeur visuel,
 * ajoute un calque au survol avec un bouton "Changer l'image" — le fichier
 * est uploadé puis persisté immédiatement (pas de debounce, c'est une
 * action ponctuelle et non un flux de frappe).
 */
export const EditableImage = ({ src, alt, onSave, className, wrapperClassName }: EditableImageProps) => {
  const isEditMode = useIsEditMode();
  const [isUploading, setIsUploading] = useState(false);
  const inputId = `editable-image-${Math.random().toString(36).slice(2)}`;

  if (!isEditMode) {
    return <img src={src} alt={alt} className={className} />;
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await EventsAPI.uploadImage(formData);
      await onSave(res.imageUrl);
      toast.success("Image mise à jour !");
    } catch {
      toast.error("Échec de l'upload de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("relative group", wrapperClassName)}>
      <img src={src} alt={alt} className={className} />
      <label
        htmlFor={inputId}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 group-hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white z-10"
      >
        {isUploading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <ImagePlus className="w-6 h-6" />
            <span className="text-lvl-footer font-bold uppercase tracking-wider">Changer l'image</span>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
        />
      </label>
    </div>
  );
};

export default EditableImage;
