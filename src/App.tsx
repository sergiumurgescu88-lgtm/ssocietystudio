import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { PrivateRoute } from "@/components/PrivateRoute";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CrmNeural from "@/pages/CrmNeural";
import AgentArmy from "@/pages/AgentArmy";
import CommandChat from "@/pages/CommandChat";
import ContentPage from "@/pages/ContentPage";
import Workflows from "@/pages/Workflows";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import OnboardingWizard from "@/pages/OnboardingWizard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

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
            <Routes>
              {/* Public routes */}
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
