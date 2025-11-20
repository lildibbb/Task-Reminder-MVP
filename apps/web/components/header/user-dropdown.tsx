"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  {
    title: "Settings",
    url: "/settings",
  },
  {
    title: "Notifications",
    url: "/notification",
  },
  {
    title: "Sign out",
    action: "logout",
  },
];

export function UserDropdown() {
  const auth = useAuth();
  const { user } = useAuth();

  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.logout();
      toast({
        title: "Logged out",
        description: "You have successfully logged out.",
        variant: "default",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={"hover:scale-105"}>
          <Image
            src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/default-avatar.png`}
            width={32}
            height={32}
            className="rounded-full"
            alt="Avatar"
          />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 p-0 overflow-hidden border shadow-md"
      >
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-md px-3 py-2.5">
          {user ? (
            <div className="flex flex-col space-y-1">
              <p className="font-semibold text-sm leading-none">
                {user.name || "User"}
              </p>
              {user.username && (
                <p className="text-xs text-muted-foreground leading-none text-">
                  @{user.username}
                </p>
              )}
            </div>
          ) : (
            <DropdownMenuLabel className="p-0 font-semibold">
              My Account
            </DropdownMenuLabel>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        {navItems.map((item) => (
          <DropdownMenuItem
            key={item.title}
            onClick={item.action === "logout" ? handleLogout : undefined}
            asChild={item.url !== undefined}
            className="flex cursor-pointer items-center py-2 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors"
          >
            {item.url ? (
              <Link href={item.url} className="w-full">
                {item.title}
              </Link>
            ) : (
              <div>{item.title}</div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
