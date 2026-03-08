import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { PrivateRoute } from "@/components/PrivateRoute";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { AppLayout } from "@/components/AppLayout";
import { GlobalLoader } from "@/components/GlobalLoader";
import { ScrollToTop } from "@/components/ScrollToTop";

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CrmNeural = lazy(() => import("@/pages/CrmNeural"));
const AgentArmy = lazy(() => import("@/pages/AgentArmy"));
const CommandChat = lazy(() => import("@/pages/CommandChat"));
const ContentPage = lazy(() => import("@/pages/ContentPage"));
const Workflows = lazy(() => import("@/pages/Workflows"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const OnboardingWizard = lazy(() => import("@/pages/OnboardingWizard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

const ProtectedLayout = () => (
  <PrivateRoute>
    <OnboardingGuard>
      <AppLayout />
    </OnboardingGuard>
  </PrivateRoute>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<GlobalLoader />}>
              <Routes>
                {/* Public landing page */}
                <Route path="/landing" element={<LandingPage />} />

                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={<PrivateRoute><OnboardingWizard /></PrivateRoute>} />

                {/* Protected routes */}
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/crm" element={<CrmNeural />} />
                  <Route path="/agents" element={<AgentArmy />} />
                  <Route path="/chat" element={<CommandChat />} />
                  <Route path="/content" element={<ContentPage />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
