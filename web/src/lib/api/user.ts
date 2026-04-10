import { authClient } from '#/lib/auth.ts';
import { bufferArrayToHexStringArray } from '#/lib/util/buffer.ts';
import { getLocalJWT, getLocalUserId } from '#/lib/util/storage.ts';
import { HttpError } from '#/lib/util/error.ts';

export type UserInfo = {
  id: string;
  username: string;
  usernameDisplay: string;
  email: string;
  biography: string;
  friendIds: string[];
  conversationIds: string[];
  createdAt: Date;
};

export type BasicUserInfo = {
  id: string;
  username: string;
  displayUsername: string;
  biography: string;
  createdAt: Date;
};

export async function fetchUserInfo(): Promise<UserInfo | undefined> {
  const jwt = getLocalJWT();
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    },
  });

  // TODO: move server auth.ts to shared dir to share auth user-schema
  const userData = (data?.user as any) ?? null;
  if (userData == null) return undefined;

  return {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    usernameDisplay: userData.usernameDisplay,
    biography: userData.biography,
    friendIds: bufferArrayToHexStringArray(userData.friendIds),
    conversationIds: bufferArrayToHexStringArray(userData.conversationIds),
    createdAt: userData.createdAt,
  };
}

export async function fetchBasicUserInfo(
  userId: string,
  byName: boolean = false,
): Promise<BasicUserInfo | undefined> {
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL +
      '/users/' +
      userId +
      '?byName=' +
      byName,
    {
      method: 'GET',
    },
  );
  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }

  return body.basicUserInfo as BasicUserInfo;
}

export async function deleteUser() {
  const jwt = getLocalJWT();
  const userId = getLocalUserId();

  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + '/users/' + userId,
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    },
  );
  const body = await response.json();

  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }

  return true;
}
