import {
  createAuthClient
} from "better-auth/react";
import {
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    magicLinkClient(),
    organizationClient(),
  ],
})

export const {
  signIn,
  signOut,
  signUp,
  useSession
} = authClient;