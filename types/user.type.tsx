// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  gender?: "LAKI_LAKI" | "PEREMPUAN" | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  gender?: string | null;
}
