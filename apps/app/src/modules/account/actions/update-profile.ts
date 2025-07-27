"use server";

import { z } from "zod";
import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { validatedActionWithUser, type ActionState } from "@/modules/shared/lib/middleware-action";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
});

export const updateProfile = validatedActionWithUser(
  updateProfileSchema,
  async (data, formData, user): Promise<ActionState> => {
    try {
      // Update user profile using Better Auth
      await auth.api.updateUser({
        headers: await headers(),
        body: {
          name: data.name,
        },
      });

      return {
        success: true,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Failed to update profile:", error);
      return {
        success: false,
        message: "Failed to update profile. Please try again.",
        errors: { name: ["Update failed"] }
      };
    }
  }
);

const linkAccountSchema = z.object({
  provider: z.enum(["github", "google"]),
});

export const initiateAccountLinking = validatedActionWithUser(
  linkAccountSchema,
  async (data, formData, user): Promise<ActionState> => {
    try {
      // Redirect to the provider's OAuth flow
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const redirectUrl = `${baseUrl}/api/auth/${data.provider}?callbackURL=${baseUrl}/account/settings`;

      redirect(redirectUrl);
    } catch (error) {
      console.error("Failed to initiate account linking:", error);
      return {
        success: false,
        message: "Failed to initiate account linking. Please try again.",
        errors: { provider: ["Linking failed"] }
      };
    }
  }
); 