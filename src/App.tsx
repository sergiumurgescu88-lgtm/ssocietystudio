import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CrmNeural from "@/pages/CrmNeural";
import AgentArmy from "@/pages/AgentArmy";
import CommandChat from "@/pages/CommandChat";
import ContentPage from "@/pages/ContentPage";
import Workflows from "@/pages/Workflows";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
