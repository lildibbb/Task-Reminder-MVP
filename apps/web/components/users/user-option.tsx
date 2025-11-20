import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInitialsAndName } from "@/helpers/helper";
interface UserOptionProps {
  user: { name?: string; email: string; id: string };
  showEmail?: boolean;
  highlight?: boolean;
}
export function UserOption({
  user,
  showEmail = true,
  highlight = false,
}: UserOptionProps) {
  const { initials } = getUserInitialsAndName(user);

  return (
    <div className={`flex items-center gap-2 w-full `}>
      <Avatar className="h-6 w-6">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col ">
        <span className="font-medium text-sm">
          {user.name || user.email}
          {highlight && (
            <span className="ml-1 text-xs text-blue-500 font-semibold">
              (You)
            </span>
          )}
        </span>
        {showEmail && (
          <span className="text-xs text-muted-foreground">{user.email}</span>
        )}
      </div>
    </div>
  );
}
