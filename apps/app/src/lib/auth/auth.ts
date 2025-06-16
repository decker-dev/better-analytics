import {
  betterAuth
} from 'better-auth';
import {
  magicLink,
} from 'better-auth/plugins';

export const auth = betterAuth({

  plugins: [
    magicLink({
      async sendMagicLink(data) {
        // Send an email to the user with a magic link
      },
    }),

  ]
  /** if no database is provided, the user data will be stored in memory.
   * Make sure to provide a database to persist user data **/
});