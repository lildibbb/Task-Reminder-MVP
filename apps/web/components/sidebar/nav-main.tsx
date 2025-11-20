"use client";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { UserRole as UserRoleEnum } from "@/types/schema.types";
import { useRole } from "@/hooks/useRole";

export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  allowedRoles?: UserRoleEnum[];
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

interface NavMainProps {
  groups: NavGroup[];
}

export function NavMain({ groups }: NavMainProps) {
  const { hasRole, isLoading, isAuthInitialized, currentUser } = useRole();

  if (isLoading || !isAuthInitialized) {
    return null;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      {groups.map((group, i) => {
        const visibleItems = group.items.filter((item) => {
          if (!item.allowedRoles || item.allowedRoles.length === 0) {
            return true;
          }

          return item.allowedRoles.some((role) => hasRole(role));
        });

        if (visibleItems.length === 0) {
          return null;
        }

        return (
          <SidebarGroup key={group.label ?? i}>
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link
                      href={item.url}
                      className="flex items-center space-x-2 p-2"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
