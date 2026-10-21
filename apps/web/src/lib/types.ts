export type Role = "member" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: Role;
}

export interface Workshop {
  _id: string;
  name: string;
  description: string;
  instructor: string;
  workshopDate: string;
  location: string;
  capacity: number;
  isActive: boolean;
}

export interface Registration {
  _id: string;
  workshop: Workshop | null;
  user: User | null;
}

export interface AuthInput {
  email: string;
  password: string;
  name?: string;
  tel?: string;
  role?: Role;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  count?: number;
}
