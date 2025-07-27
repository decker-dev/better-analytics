import type { auth } from "@/modules/auth/lib/auth";

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];

export interface UserAccountSettings {
  name: string;
  email: string;
  image?: string;
}

export interface LinkedProvider {
  providerId: string;
  accountId: string;
  createdAt: Date;
  providerName: string;
  isVerified?: boolean;
}

export interface UserAccountData {
  user: User;
  linkedProviders: LinkedProvider[];
  organizations: {
    id: string;
    name: string;
    slug: string;
    role: string;
    createdAt: Date;
  }[];
}

export interface AccountSettingsProps {
  user: User;
  linkedProviders: LinkedProvider[];
} 