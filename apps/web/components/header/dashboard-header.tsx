import { ModeToggle } from "../mode-toggle";
import { SidebarTrigger } from "../ui/sidebar";
import { CreateDropdown } from "./create-dropdown";
import { UserDropdown } from "./user-dropdown";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <CreateDropdown />
        <UserDropdown />
      </div>
    </header>
  );
}
