import { UserCog, ShieldCheck, Info } from "lucide-react";

/**
 * Onglet Utilisateurs — actuellement un point d'ancrage visuel. L'admin
 * NFL fonctionne aujourd'hui avec un compte unique (voir AuthAPI / login),
 * il n'y a pas encore de table "utilisateurs" ni de gestion de rôles côté
 * backend. Cet écran sert de point de départ en attendant que la portée
 * exacte de la fonctionnalité (comptes multiples, rôles, permissions...)
 * soit précisée.
 */
const UsersTab = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-24">
      <div>
        <h2 className="text-2xl font-bold">Utilisateurs</h2>
        <p className="text-sm text-muted-foreground mt-1">Gestion des comptes ayant accès à cet espace d'administration.</p>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-border/50 flex items-start gap-5">
        <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg">Compte administrateur unique</h3>
          <p className="text-sm text-muted-foreground">
            L'admin fonctionne aujourd'hui avec un seul identifiant partagé, sans distinction de rôle.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-dashed border-border/50 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto">
          <UserCog className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="font-bold">Comptes multiples — à construire</h3>
          <p className="text-sm text-muted-foreground">
            Inviter des collaborateurs avec des rôles distincts (ex. Admin, Éditeur de contenu, Support billetterie)
            nécessite d'abord une table "utilisateurs" et une gestion des permissions côté backend.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 text-xs text-muted-foreground bg-secondary/30 border border-border/50 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        Dites-nous ce dont vous avez besoin ici (comptes multiples ? rôles et permissions ? journal d'activité ?) pour qu'on construise la bonne version.
      </div>
    </div>
  );
};

export default UsersTab;
