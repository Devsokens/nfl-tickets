import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider, dehydrate, hydrate } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnalyticsAPI } from "@/lib/api";
import { ADMIN_LOGIN_PATH, ADMIN_PATH } from "@/lib/adminPaths";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from 'react-helmet-async';

// Lazy loading for optimized bundle size
const Index = lazy(() => import("./pages/Index.tsx"));
const NewsletterUnsubscribe = lazy(() => import("./pages/NewsletterUnsubscribe.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales.tsx"));
const Catalog = lazy(() => import("./pages/Catalog.tsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.tsx"));
const GalleryPage = lazy(() => import("./pages/GalleryPage.tsx"));
const CatalogueFormation = lazy(() => import("./pages/CatalogueFormation.tsx"));
const FormationDetail = lazy(() => import("./pages/FormationDetail.tsx"));
const TestimonialSubmission = lazy(() => import("./pages/TestimonialSubmission.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-[#0c0d0f] flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <img
        src="/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png"
        alt="NFL Courtier & Service"
        className="nfl-logo h-32 sm:h-40 md:h-48 w-auto animate-[pulse_2s_ease-in-out_infinite]"
      />
      <div className="w-12 h-12 rounded-full border-4 border-[#e3bd51]/20 border-t-[#e3bd51] animate-spin" />
      <p className="text-[#e3bd51] font-medium animate-pulse tracking-wider uppercase text-xs">Chargement...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes: data stays fresh longer
      gcTime: 1000 * 60 * 30,  // 30 minutes: keep in memory even if unused
      refetchOnWindowFocus: false, // Don't reload when switching tabs
      retry: 1, // Minimize retry attempts for faster failure feedback
    },
  },
});

// Restore Query Client Cache state from localStorage. Pas de données fictives
// au premier passage : elles restaient affichées 5 min (staleTime) à la place
// des vrais événements.
try {
  const cachedState = localStorage.getItem('nfl_query_cache');
  if (cachedState) {
    const parsed = JSON.parse(cachedState);
    hydrate(queryClient, parsed);
  }
} catch (e) {
  console.error("Failed to restore query cache:", e);
}

// Subscribe to query client cache changes and save it to localStorage
queryClient.getQueryCache().subscribe(() => {
  try {
    const dehydratedState = dehydrate(queryClient);
    localStorage.setItem('nfl_query_cache', JSON.stringify(dehydratedState));
  } catch (e) {
    console.error("Failed to persist query cache:", e);
  }
});

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Ne pas traquer les visites sur le dashboard admin
    if (!location.pathname.startsWith(ADMIN_PATH)) {
      AnalyticsAPI.track(location.pathname);
    }
  }, [location.pathname]);

  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsTracker />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Catalog />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/event/:id/galerie" element={<GalleryPage type="event" />} />
              <Route path="/catalogue-formations" element={<CatalogueFormation />} />
              <Route path="/formation/:id" element={<FormationDetail />} />
              <Route path="/formation/:id/galerie" element={<GalleryPage type="formation" />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/temoignage/:ticketId" element={<TestimonialSubmission />} />
              <Route path="/newsletter/desabonnement" element={<NewsletterUnsubscribe />} />
              <Route path={ADMIN_PATH} element={<AdminDashboard />} />
              <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
