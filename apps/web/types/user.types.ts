export type User = {
  id: string;
  uuid: string;
  name: string;
  email: string;
  emailVerifiedAt: string;
  username: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userRoles: UserRole[];
};

export type Role = {
  id: string;
  uuid: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type UserRole = {
  id: string;
  uuid: string;
  userId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: Role;
};
