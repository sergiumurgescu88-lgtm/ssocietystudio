import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";
import { CommandFAB } from "./chat/CommandFAB";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { Loader2 } from "lucide-react";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        <footer className="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-muted-foreground lg:hidden">
          SSociety Studio © 2024
        </footer>
      </div>
      <CommandFAB />
      <ScrollToTopButton />
    </div>
  );
}
