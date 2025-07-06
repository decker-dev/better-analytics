import { auth } from "@/modules/auth/lib/auth";
import { track, trackServer } from "better-analytics/next";
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";


const handleServerError = (e: Error) => {
  console.error(e);

  if (e instanceof Error) {
    return e.message;
  }

  return DEFAULT_SERVER_ERROR_MESSAGE;
};

export const actionClientWithMeta = createSafeActionClient({
  handleServerError,
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
      track: z
        .object({
          event: z.string(),
          channel: z.string(),
        })
        .optional(),
    });
  },
});

export const authActionClient = actionClientWithMeta
  .use(async ({ next, clientInput, metadata }) => {
    console.log("Server action initiated", { metadata, input: clientInput });
    return next({ ctx: {} });
  })
  /*
  .use(async ({next, metadata}) => {
    const ip = headers().get("x-forwarded-for");

    const {success, remaining} = await ratelimit.limit(`${ip}-${metadata.name}`);

    if (!success) {
      throw new Error("Too many requests");
    }

    return next({
      ctx: {
        ratelimit: {
          remaining,
        },
      },
    });
  })
  */
  .use(async ({ next, metadata }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.log("Unauthorized action attempt", { metadata });
      throw new Error("Unauthorized");
    }

    console.log("User authenticated", { userId: session.user.id });


    if (metadata.track) {
      trackServer(metadata.track.event, {
        channel: metadata.track.channel,
        action: metadata.name,
      });

      console.log("Analytics event tracked", { trackEvent: metadata.track });
    }


    try {

      const result = await next({
        ctx: {
          user: session.user,
        },
      });

      return result;
    } catch (error) {
      console.error("Server action failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }); 