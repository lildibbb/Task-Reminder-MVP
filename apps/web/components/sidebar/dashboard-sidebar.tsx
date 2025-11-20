"use client";

import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NotebookPen, Search, Users } from "lucide-react"; // Combined imports
import Image from "next/image";
import { NavGroup } from "./nav-main"; // Assuming NavMain is also exported from here or a separate file
import { NavMain } from "./nav-main";
import { UserRole as UserRoleEnum } from "@/types/schema.types";

export const navItems: NavGroup[] = [
  {
    label: "Your Work",
    items: [
      // {
      //   title: "Projects",
      //   url: "/project",
      //   icon: FolderOpen,
      // },
      {
        title: "Tasks",
        url: "/task",
        icon: NotebookPen,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Members",
        url: "/admin/users",
        icon: Users,
        allowedRoles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN],
      },
    ],
  },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" className="min-h-screen">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground">
            <Image
              src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/sidebar-logo.png`}
              alt="Company Logo"
              width={32}
              height={32}
            />
          </div>
        </div>
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
