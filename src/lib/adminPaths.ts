// Adresse de l'espace d'administration. Volontairement différente de "/admin"
// (première URL testée par les robots) : c'est une barrière contre le bruit,
// pas une protection — l'accès reste contrôlé par l'authentification de l'API.
// À garder synchronisé avec public/sw.js, vercel.json et le backend
// (src/common/admin-path.ts).
export const ADMIN_PATH = "/espace-nfladmin";
export const ADMIN_LOGIN_PATH = `${ADMIN_PATH}/login`;
