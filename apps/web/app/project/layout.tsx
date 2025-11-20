import { DashboardHeader } from "@/components/header/dashboard-header";
import { DashboardSidebar } from "@/components/sidebar/dashboard-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <DashboardHeader />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
