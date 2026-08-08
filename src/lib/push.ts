import { PushAPI } from "@/lib/api";

/** Convertit la clé publique VAPID (base64url) au format Uint8Array attendu par `applicationServerKey`. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/** Demande la permission navigateur (si nécessaire) puis abonne cet appareil aux notifications push admin. */
export async function subscribeToPush(): Promise<PushSubscription> {
  if (!isPushSupported()) throw new Error("Les notifications push ne sont pas supportées par ce navigateur.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permission de notification refusée.");

  const vapidPublicKey = await PushAPI.getVapidPublicKey();
  if (!vapidPublicKey) throw new Error("Notifications push non configurées côté serveur.");

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  await PushAPI.subscribe(subscription.toJSON());
  return subscription;
}

export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await PushAPI.unsubscribe(endpoint);
}
