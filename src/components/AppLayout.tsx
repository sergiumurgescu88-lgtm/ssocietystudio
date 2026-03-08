import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
        <footer className="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-muted-foreground lg:hidden">
          SSociety Studio © 2024
        </footer>
      </div>
    </div>
  );
}
