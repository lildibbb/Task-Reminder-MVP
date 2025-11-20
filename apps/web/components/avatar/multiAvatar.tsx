"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
  id: string;
  initials: string;
  name: string;
  image?: string;
}

interface AvatarGroupProps {
  users: User[];
  style?: React.CSSProperties;
}

export default function AvatarGroup({ users, style }: AvatarGroupProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const uniqueUsers = users.filter(
    (user, index, self) => self.findIndex((u) => u.id === user.id) === index,
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex -space-x-2 *:ring-3 *:ring-background">
        {uniqueUsers.map((user, index) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <Avatar
                className={`transition-transform ${
                  activeIndex === index ? "z-10 scale-110" : ""
                } h-8 w-8`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback
                  className={`${style} h-full w-full flex items-center justify-center text-white text-xs font-medium bg-blue-500`}
                >
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold text-xs">{user.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
