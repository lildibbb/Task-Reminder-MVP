import { UserRole } from "@/types/schema.types";

export function getAllowedRolesForPath(pathname: string): string[] | null {
  if (pathname.startsWith("/admin")) return [UserRole.ADMIN];

  return null;
}
