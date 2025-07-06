"use server"; // don't forget to add this!

import { z } from "zod";
import { returnValidationErrors } from "next-safe-action";
import { authActionClient } from "@/lib/safe-action";

// This schema is used to validate input from client.
const inputSchema = z.object({
  username: z.string().min(3).max(10),
  password: z.string().min(8).max(100),
});

export const testAction = authActionClient
  .schema(inputSchema)
  .metadata({
    name: "testAction",
    track: {
      event: "testAction",
      channel: "testChannel",
    },
  })
  .action(async ({ parsedInput: { username, password } }) => {
    console.log("username", username);
    console.log("password", password);
    if (username === "johndoe" && password === "123456") {
      return {
        success: "Successfully logged in",
      };
    }

    return returnValidationErrors(inputSchema, { _errors: ["Incorrect credentials"] });
  });