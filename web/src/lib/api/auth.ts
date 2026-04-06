import { HttpError } from '#/lib/util/error.ts';

export async function fetchIsEmailTaken(email: string) {
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + '/auth/email-taken',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      }),
    },
  );
  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }
  return body.isTaken as boolean;
}

export async function fetchIsUsernameTaken(username: string) {
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL +
      '/auth/username-taken?username=' +
      username,
    {
      method: 'GET',
    },
  );
  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }
  return body.isTaken as boolean;
}

export async function fetchIsEmailVerified(email: string) {
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + '/auth/email-verified',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      }),
    },
  );
  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }
  return body.isVerified as boolean;
}
