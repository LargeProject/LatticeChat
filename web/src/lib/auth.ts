import { createAuthClient } from 'better-auth/client';
import { emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
  baseURL: import.meta.env.VITE_BETTER_AUTH_BASE_URL,
});
