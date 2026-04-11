import { getLocalJWT, getLocalUserId } from '#/lib/util/storage.ts';
import { HttpError } from '#/lib/util/error.ts';
import type { CurrentUserResponse, BasicUserInfo, UserInfo } from '@latticechat/shared';

export type { CurrentUserResponse, BasicUserInfo, UserInfo };

export async function fetchUserInfo(): Promise<CurrentUserResponse | undefined> {
  const jwt = getLocalJWT();
  
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + '/users/me',
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    },
  );
  
  const body = await response.json();
  
  if (!response.ok) {
    if (response.status === 404) {
      return undefined;
    }
    throw new HttpError(response.status, body.code, body.message);
  }

  return body.userInfo as CurrentUserResponse;
}

export async function fetchBasicUserInfo(
  userId: string,
  byName: boolean = false,
): Promise<BasicUserInfo | undefined> {
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + '/users/' + userId + '?byName=' + byName,
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
