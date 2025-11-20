"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/user.types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { RandomAvatar } from "react-random-avatars";
import { getUserInitialsAndName } from "@/helpers/helper";
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      const { initials, nameFromEmail } = getUserInitialsAndName(user);

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <RandomAvatar
              name={user.name || nameFromEmail || user.email}
              size={40}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name || nameFromEmail}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "userRoles",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;

      // Access the role name from the nested structure
      // Handle the case where UserRoles might be empty or the role relation wasn't loaded
      const roleNames = user.userRoles
        ?.map((userRole) => userRole.role?.name)
        .filter((name) => name);

      // Display the first role name or all role names joined by comma
      const displayedRole =
        roleNames && roleNames.length > 0
          ? roleNames.join(", ") // Join multiple roles with comma and space
          : "No Role";

      // You can adjust the badge styling based on the *first* role name
      const firstRoleName =
        roleNames && roleNames.length > 0 ? roleNames[0] : null;

      return (
        <Badge
          variant={
            firstRoleName === "admin"
              ? "default"
              : firstRoleName === "user"
                ? "secondary"
                : "outline"
          }
        >
          {displayedRole}
        </Badge>
      );
    },
    // Optional: Define filterFn for filtering by role name(s)
    filterFn: (row, columnId, filterValue: string) => {
      const user = row.original;
      const roleNames = user.userRoles
        ?.map((userRole) => userRole.role?.name)
        .filter((name) => name);

      if (!roleNames || roleNames.length === 0) {
        return filterValue.toLowerCase() === "no role"; // Allow filtering for users with no roles
      }

      // Check if any of the role names include the filter value (case-insensitive)
      return roleNames.some((name) =>
        name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID : {user.id}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/*<Link href={`/admin/users/view/${user.id}`}>*/}
            {/*  <DropdownMenuItem>View user details</DropdownMenuItem>*/}
            {/*</Link>*/}
            <Link href={`/admin/users/edit/${user.id}`}>
              <DropdownMenuItem>Edit user</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
