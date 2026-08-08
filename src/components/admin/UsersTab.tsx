import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AuthAPI, UsersAPI, type AdminProfile, type AdminUser, type AdminUserModule,
  type ModuleKey, type ModulePermissions, type PermissionLevel,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Pencil, Trash2, Loader2, ShieldCheck, Shield, CircleUserRound, Save,
  BarChart3, GraduationCap, PartyPopper, Mail as MailIcon, Sparkles, Quote,
  LayoutTemplate, UserCog, Settings, Lock,
} from "lucide-react";

const MODULE_ICONS: Record<ModuleKey, React.ReactNode> = {
  tableau_de_bord: <BarChart3 className="h-4 w-4" />,
  formations: <GraduationCap className="h-4 w-4" />,
  evenementiel: <PartyPopper className="h-4 w-4" />,
  demandes: <MailIcon className="h-4 w-4" />,
  newsletter: <Sparkles className="h-4 w-4" />,
  temoignages: <Quote className="h-4 w-4" />,
  contenu: <LayoutTemplate className="h-4 w-4" />,
  utilisateurs: <UserCog className="h-4 w-4" />,
  parametres: <Settings className="h-4 w-4" />,
};

const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  aucun: "Aucun accès",
  voir: "Voir uniquement",
  editer: "Éditer",
};

const emptyPermissions = (modules: AdminUserModule[]): ModulePermissions =>
  Object.fromEntries(modules.map((m) => [m.key, "aucun" as PermissionLevel]));

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: AdminUserModule[];
  editingUser: AdminUser | null;
  onSaved: () => void;
}

const UserFormSheet = ({ open, onOpenChange, modules, editingUser, onSaved }: UserFormSheetProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [permissions, setPermissions] = useState<ModulePermissions>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingUser) {
      setFullName(editingUser.full_name || "");
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setPermissions({ ...emptyPermissions(modules), ...editingUser.permissions });
    } else {
      setFullName("");
      setEmail("");
      setRole("admin");
      setPermissions(emptyPermissions(modules));
    }
    setPassword("");
  }, [open, editingUser, modules]);

  const handleSave = async () => {
    if (!fullName.trim()) return toast.error("Le nom complet est obligatoire.");
    if (!editingUser && !email.trim()) return toast.error("L'email est obligatoire.");
    if (!editingUser && password.length < 8) return toast.error("Le mot de passe doit contenir au moins 8 caractères.");
    if (password.length > 0 && password.length < 8) return toast.error("Le mot de passe doit contenir au moins 8 caractères.");

    setIsSaving(true);
    try {
      if (editingUser) {
        const payload: any = { full_name: fullName, role, permissions };
        if (password) payload.password = password;
        await UsersAPI.update(editingUser.user_id, payload);
        toast.success("Compte administrateur mis à jour.");
      } else {
        await UsersAPI.create({ email: email.trim(), password, full_name: fullName, role, permissions });
        toast.success("Compte administrateur créé.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col gap-0 border-gold/10">
        <SheetHeader className="px-6 sm:px-8 py-6 border-b border-border/50 shrink-0 space-y-2">
          <SheetTitle className="text-lvl-subtitle font-bold text-foreground">
            {editingUser ? "Modifier l'administrateur" : "Nouvel administrateur"}
          </SheetTitle>
          <SheetDescription>
            Définissez son rôle puis les modules auxquels il aura accès, et avec quel niveau.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Nom complet</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex : Jean Ondo" />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                disabled={!!editingUser}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborateur@nfl-gabon.com"
                className={editingUser ? "opacity-60" : ""}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Mot de passe {editingUser && <span className="text-muted-foreground font-normal">(optionnel)</span>}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingUser ? "Laisser vide pour ne pas changer" : "Au moins 8 caractères"}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {role === "super_admin" ? (
            <div className="flex items-start gap-3 text-lvl-footer text-muted-foreground bg-secondary/30 border border-border/50 rounded-xl px-4 py-3">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              Un Super Admin a automatiquement accès complet ("Éditer") à tous les modules — la sélection ci-dessous ne s'applique qu'aux comptes Admin.
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Accès par module</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modules.map((mod) => (
                  <div key={mod.key} className="glass-card rounded-2xl p-4 border border-border/50 flex flex-col gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                        {MODULE_ICONS[mod.key]}
                      </span>
                      <span className="font-semibold text-lvl-footer">{mod.label}</span>
                    </div>
                    <Select
                      value={permissions[mod.key] || "aucun"}
                      onValueChange={(v: PermissionLevel) => setPermissions((p) => ({ ...p, [mod.key]: v }))}
                    >
                      <SelectTrigger className="w-full h-9 text-lvl-footer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["aucun", "voir", "editer"] as PermissionLevel[]).map((level) => (
                          <SelectItem key={level} value={level}>{PERMISSION_LABELS[level]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 sm:px-8 py-5 border-t border-border/50 shrink-0 bg-card/50 backdrop-blur-sm sm:justify-stretch">
          <Button
            variant="gold"
            className="w-full h-10 text-lvl-footer font-bold rounded-xl shadow-lg shadow-gold/20"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const UsersTab = () => {
  const queryClient = useQueryClient();

  const { data: currentProfile } = useQuery<AdminProfile>({
    queryKey: ["adminProfile"],
    queryFn: AuthAPI.getProfile,
  });
  const isSuperAdmin = currentProfile?.role === "super_admin";

  const { data: modules = [] } = useQuery<AdminUserModule[]>({
    queryKey: ["adminUserModules"],
    queryFn: UsersAPI.getModules,
  });

  const { data: users = [], isLoading, refetch } = useQuery<AdminUser[]>({
    queryKey: ["adminUsers"],
    queryFn: UsersAPI.getAll,
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => { setEditingUser(null); setSheetOpen(true); };
  const openEdit = (u: AdminUser) => { setEditingUser(u); setSheetOpen(true); };

  const handleSaved = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await UsersAPI.remove(userToDelete.user_id);
      toast.info("Compte administrateur supprimé.");
      handleSaved();
      setUserToDelete(null);
    } catch (err: any) {
      toast.error("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const moduleCount = (u: AdminUser) =>
    u.role === "super_admin" ? modules.length : Object.values(u.permissions || {}).filter((v) => v && v !== "aucun").length;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lvl-subtitle font-bold">Utilisateurs</h2>
          <p className="text-lvl-footer text-muted-foreground mt-1">Comptes ayant accès à cet espace d'administration, et leurs permissions.</p>
        </div>
        {isSuperAdmin && (
          <Button variant="gold" className="rounded-2xl h-12 px-6 shadow-xl" onClick={openCreate}>
            <Plus className="h-5 w-5 mr-2" /> Ajouter un administrateur
          </Button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="flex items-start gap-3 text-lvl-footer text-muted-foreground bg-secondary/30 border border-border/50 rounded-xl px-4 py-3">
          <Lock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          Seul un Super Admin peut créer, modifier ou supprimer des comptes administrateurs.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.user_id} className="glass-card rounded-3xl p-6 border border-border/50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <CircleUserRound className="h-6 w-6" />
              </div>
              <Badge variant="outline" className={u.role === "super_admin" ? "text-gold border-gold/30" : "text-muted-foreground border-border"}>
                {u.role === "super_admin" ? <ShieldCheck className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                {u.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
            </div>
            <div>
              <p className="font-bold text-lvl-body truncate">{u.full_name || "Sans nom"}</p>
              <p className="text-lvl-footer text-muted-foreground truncate">{u.email}</p>
            </div>
            <p className="text-lvl-footer text-muted-foreground">
              {u.role === "super_admin" ? "Accès complet" : `${moduleCount(u)} module(s) accessible(s)`}
            </p>
            {isSuperAdmin && (
              <div className="flex gap-2 justify-end pt-2 border-t border-border/30">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gold" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  disabled={u.user_id === currentProfile?.id}
                  onClick={() => setUserToDelete(u)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <UserFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        modules={modules}
        editingUser={editingUser}
        onSaved={handleSaved}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce compte administrateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete?.full_name} ({userToDelete?.email}) perdra immédiatement l'accès à l'administration. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersTab;
