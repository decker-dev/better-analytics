import { useState, useRef } from "react";
import { z } from "zod";
import { authClient } from "@/modules/auth/lib/auth-client";

type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export const useInviteMember = (organizationId: string) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>({
    success: false,
    message: "",
  });
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setState({ success: false, message: "", errors: {} });

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    // Zod validation
    const validationResult = inviteSchema.safeParse({
      email: email?.trim(),
      role,
    });

    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      for (const error of validationResult.error.errors) {
        const path = error.path[0] as string;
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(error.message);
      }

      setState({
        success: false,
        message: "Please fix the validation errors",
        errors,
      });
      setIsPending(false);
      return;
    }

    try {
      // Use Better Auth client-side organization invitation
      const result = await authClient.organization.inviteMember({
        email: validationResult.data.email,
        role: validationResult.data.role,
        organizationId,
      });

      if (result.error) {
        setState({
          success: false,
          message: result.error.message || "Failed to send invitation",
          errors: {
            email: [result.error.message || "Failed to send invitation"],
          },
        });
      } else {
        setState({
          success: true,
          message: `Invitation sent successfully to ${validationResult.data.email}`,
        });
        // Reset form using ref
        formRef.current?.reset();
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      // Handle specific error cases
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("already invited")
      ) {
        setState({
          success: false,
          message: "User is already a member or has a pending invitation",
          errors: {
            email: ["User is already a member or has a pending invitation"],
          },
        });
      } else {
        setState({
          success: false,
          message: errorMessage,
          errors: { email: [errorMessage] },
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    formRef,
    state,
    isPending,
    handleSubmit,
  };
}; 