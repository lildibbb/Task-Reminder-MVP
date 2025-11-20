import { UserRole as UserRoleEnum } from "@/types/schema.types";

export type UserDataType = {
  id: string;
  status: string;
  email: string;
  name: string;
  username: string;
  userRoles: UserRoleInterface[] | undefined;
};

interface RoleDetail {
  uuid: string;
  name: UserRoleEnum;
  description: string;
}

export interface UserRoleInterface {
  uuid: string;
  role: RoleDetail;
}

export type RegisterParams = {
  email: string;
  username?: string;
  password: string;
};
export type ErrCallbackType = (err: { [key: string]: string }) => void;

export type LoginParams = {
  email: string;
  password: string;
};

export type AuthValuesType = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void;
  logout: () => void;
  register: (params: RegisterParams, errorCallback?: ErrCallbackType) => void;
  user: UserDataType | null;
  setUser: (value: UserDataType | null) => void;
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
};
