import { createAuthClient } from 'better-auth/client';
import { emailOTPClient, usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), usernameClient()],
  baseURL: import.meta.env.VITE_BETTER_AUTH_BASE_URL,
});
