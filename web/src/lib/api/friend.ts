import { type BasicUserInfo, fetchBasicUserInfo } from '#/lib/api/user.ts';
import { HttpError } from '#/lib/util/error.ts';
import { getLocalJWT, getLocalUserId } from '#/lib/util/storage.ts';

export type FriendRequest = {
  type: 'incoming' | 'outgoing';
  associatedUser: BasicUserInfo;
};

export async function fetchFriendRequests(): Promise<FriendRequest[]> {
  const senderId = getLocalUserId();
  const jwt = getLocalJWT();
  const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/users/' + senderId + '/friend-requests', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + jwt,
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }

  const friendRequests: FriendRequest[] = [];
  for (const rawFriendRequest of body.friendRequests) {
    let requestType: 'incoming' | 'outgoing' | null = null;
    let associatedUser;
    if (senderId == rawFriendRequest.fromId) {
      requestType = 'outgoing';
      associatedUser = await fetchBasicUserInfo(rawFriendRequest.toId);
    } else if (senderId == rawFriendRequest.toId) {
      requestType = 'incoming';
      associatedUser = await fetchBasicUserInfo(rawFriendRequest.fromId);
    }

    const friendRequest: FriendRequest = {
      type: requestType ?? 'incoming',
      associatedUser: associatedUser!,
    };
    friendRequests.push(friendRequest);
  }

  return friendRequests;
}

export async function acceptFriendRequest(targetId: string) {
  const senderId = getLocalUserId();
  const jwt = getLocalJWT();

  const requestBody = { targetId: targetId };
  const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/users/' + senderId + '/friend-requests', {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer ' + jwt,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }
}

export async function sendFriendRequest(targetId: string) {
  const senderId = getLocalUserId();
  const jwt = getLocalJWT();

  const requestBody = { targetId: targetId };
  const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/users/' + senderId + '/friend-requests', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + jwt,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }
}

export async function removeFriendRequest(targetId: string) {
  const senderId = getLocalUserId();
  const jwt = getLocalJWT();

  const requestBody = { targetId: targetId };
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + '/users/' + senderId + '/friend-requests',
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + jwt,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    },
  );

  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }
}

export async function removeFriend(targetId: string) {
  const senderId = getLocalUserId();
  const jwt = getLocalJWT();

  const requestBody = { targetId: targetId };
  const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/users/' + senderId + '/friends', {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + jwt,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }
}

export async function fetchFriends(friendIds: string[]): Promise<BasicUserInfo[]> {
  let friends: BasicUserInfo[] = [];
  for (const friendId of friendIds) {
    const friend = await fetchBasicUserInfo(friendId);

    if (friend != null) {
      friends.push(friend);
    }
  }

  return friends;
}
