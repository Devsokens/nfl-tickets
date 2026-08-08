import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider, dehydrate, hydrate } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnalyticsAPI } from "@/lib/api";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from 'react-helmet-async';
import { mockEvents } from "@/lib/mockData";
import FloatingContact from "@/components/FloatingContact";

// Lazy loading for optimized bundle size
const Index = lazy(() => import("./pages/Index.tsx"));
const Catalog = lazy(() => import("./pages/Catalog.tsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.tsx"));
const CatalogueFormation = lazy(() => import("./pages/CatalogueFormation.tsx"));
const FormationDetail = lazy(() => import("./pages/FormationDetail.tsx"));
const GalleryPage = lazy(() => import("./pages/GalleryPage.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
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

// Restore Query Client Cache state from localStorage or pre-populate with mock data
try {
  const cachedState = localStorage.getItem('nfl_query_cache');
  if (cachedState) {
    const parsed = JSON.parse(cachedState);
    hydrate(queryClient, parsed);
  } else {
    // Pre-populate query cache with mock events so there is no loading delay on first visit
    const formattedMocks = mockEvents.map(e => ({
      ...e,
      image_url: e.image,
      whatsapp_number: e.whatsappNumber,
      status: 'publié' as const
    }));
    queryClient.setQueryData(["allEvents"], formattedMocks);
    queryClient.setQueryData(["upcomingEvents"], formattedMocks);
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
    if (!location.pathname.startsWith('/admin')) {
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
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnalyticsTracker />
          <FloatingContactWrapper />
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
              <Route path="/temoignage/:ticketId" element={<TestimonialSubmission />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

const FloatingContactWrapper = () => {
  const location = useLocation();
  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;
  return <FloatingContact />;
};

export default App;
