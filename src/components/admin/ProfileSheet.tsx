import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthAPI, EventsAPI, type AdminProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { CircleUserRound, ImagePlus, Loader2, Save, KeyRound, User as UserIcon } from "lucide-react";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileSection = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2.5">
      <span className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">{icon}</span>
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
    </div>
    <div className="space-y-4 pl-1">{children}</div>
  </div>
);

const ProfileSheet = ({ open, onOpenChange }: ProfileSheetProps) => {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery<AdminProfile>({
    queryKey: ["adminProfile"],
    queryFn: AuthAPI.getProfile,
    enabled: open,
  });

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  useEffect(() => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open]);

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await EventsAPI.uploadImage(formData);
      setAvatarUrl(res.imageUrl);
    } catch {
      toast.error("Échec de l'upload de la photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (newPassword && newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { full_name: fullName, avatar_url: avatarUrl || "" };
      if (newPassword) payload.password = newPassword;

      const updated = await AuthAPI.updateProfile(payload);
      queryClient.setQueryData(["adminProfile"], updated);
      toast.success(newPassword ? "Profil et mot de passe mis à jour !" : "Profil mis à jour !");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col gap-0 border-gold/10">
        <SheetHeader className="px-6 sm:px-8 py-6 border-b border-border/50 shrink-0 space-y-2">
          <SheetTitle className="text-2xl font-bold text-foreground">Mon profil</SheetTitle>
          <SheetDescription>Gérez vos informations personnelles et votre mot de passe.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
          <ProfileSection icon={<UserIcon className="h-3.5 w-3.5" />} title="Informations personnelles">
            <div className="flex items-center gap-5">
              <div
                className="relative w-20 h-20 rounded-full bg-muted/30 border-2 border-dashed border-gold/30 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden group"
                onClick={() => document.getElementById("profile-avatar")?.click()}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gold" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full object-cover" alt="Photo de profil" />
                ) : (
                  <CircleUserRound className="h-9 w-9 text-gold/60" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <ImagePlus className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <input
                  id="profile-avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Photo de profil</p>
                <p className="text-xs text-muted-foreground">Cliquez sur l'avatar pour la changer.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex : Louise Audyll Ongoum" />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled className="opacity-60" />
              <p className="text-[11px] text-muted-foreground">L'email de connexion ne peut pas être modifié ici.</p>
            </div>
          </ProfileSection>

          <ProfileSection icon={<KeyRound className="h-3.5 w-3.5" />} title="Changer le mot de passe">
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Laisser vide pour ne pas changer" />
            </div>
            <div className="space-y-2">
              <Label>Confirmer le nouveau mot de passe</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Retapez le mot de passe" />
            </div>
            <p className="text-[11px] text-muted-foreground">Au moins 8 caractères.</p>
          </ProfileSection>
        </div>

        <SheetFooter className="px-6 sm:px-8 py-5 border-t border-border/50 shrink-0 bg-card/50 backdrop-blur-sm sm:justify-stretch">
          <Button
            variant="gold"
            className="w-full h-10 text-sm font-bold rounded-xl shadow-lg shadow-gold/20"
            onClick={handleSave}
            disabled={isSaving || isUploadingAvatar}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
