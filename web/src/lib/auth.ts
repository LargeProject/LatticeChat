import { createAuthClient } from 'better-auth/client';
import { emailOTPClient, usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    usernameClient()
  ],
  baseURL: 'http://165.245.167.192:3001'
});
