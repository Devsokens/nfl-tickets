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

// Lazy loading for optimized bundle size
const Index = lazy(() => import("./pages/Index.tsx"));
const Catalog = lazy(() => import("./pages/Catalog.tsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.tsx"));
const CatalogueFormation = lazy(() => import("./pages/CatalogueFormation.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
      <p className="text-gold font-medium animate-pulse">Chargement...</p>
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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Catalog />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/catalogue-formations" element={<CatalogueFormation />} />
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

export default App;
