import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Lazy loading for optimized bundle size
const Index = lazy(() => import("./pages/Index.tsx"));
const Catalog = lazy(() => import("./pages/Catalog.tsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.tsx"));
const FormationsPage = lazy(() => import("./pages/FormationsPage.tsx"));
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Catalog />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/formations" element={<FormationsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
