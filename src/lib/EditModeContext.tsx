import { createContext, useContext } from "react";

// Contexte minimal : indique si l'arbre de composants courant est rendu dans
// l'éditeur visuel de l'admin (true) ou sur le site public (false, valeur par
// défaut). Les composants Editable* du dossier admin/editable s'appuient
// dessus pour savoir s'ils doivent afficher leur "chrome" d'édition ou se
// rendre de façon parfaitement transparente (identique au site public).
const EditModeContext = createContext(false);

export const EditModeProvider = ({ children }: { children: React.ReactNode }) => (
  <EditModeContext.Provider value={true}>{children}</EditModeContext.Provider>
);

export function useIsEditMode() {
  return useContext(EditModeContext);
}
