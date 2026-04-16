import { useEffect, useRef, useState } from 'react';
import { Check, X, User, UserPlus, Inbox, Send, UserMinus, Users } from 'lucide-react';
import { useUser } from '#/lib/context/UserContext.tsx';
import {
  type FriendRequest,
  removeFriendRequest,
  sendFriendRequest,
  removeFriend,
  acceptFriendRequest,
} from '#/lib/api/friend.ts';
import { fetchBasicUserInfo } from '#/lib/api/user.ts';
import { useAsyncEffect } from '#/components/hooks/useAsyncEffect.ts';

type LayoutFriendRequest = {
  id: string;
  username: string;
  displayName: string;
  mutualFriends: number;
  avatarColor: string;
};

function Avatar({ color }: { color: string }) {
  return (
    <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${color} text-white`}>
      <User size={20} />
    </div>
  );
}

function toLayoutFriendRequests(friendRequests: FriendRequest[]) {
  const layoutOutgoingRequests: LayoutFriendRequest[] = [];
  const layoutIncomingRequests: LayoutFriendRequest[] = [];

  for (const friendRequest of friendRequests) {
    const layoutFriendRequest: LayoutFriendRequest = {
      id: friendRequest.associatedUser.id,
      username: friendRequest.associatedUser.name,
      displayName: friendRequest.associatedUser.name,
      mutualFriends: 0,
      avatarColor: 'bg-blue-500',
    };

    if (friendRequest.type === 'incoming') {
      layoutIncomingRequests.push(layoutFriendRequest);
    } else {
      layoutOutgoingRequests.push(layoutFriendRequest);
    }
  }

  return {
    incoming: layoutIncomingRequests,
    outgoing: layoutOutgoingRequests,
  };
}

export default function FriendsLayout() {
  const { friendRequests, friends, refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useAsyncEffect(async () => {
    await refreshUser();
    setIsLoading(false);
  });

  const [incomingRequests, setIncomingRequests] = useState<LayoutFriendRequest[]>(
    toLayoutFriendRequests(friendRequests).incoming,
  );
  const [sentRequests, setSentRequests] = useState<LayoutFriendRequest[]>(
    toLayoutFriendRequests(friendRequests).outgoing,
  );

  useEffect(() => {
    if (isLoading) return;

    setIncomingRequests(toLayoutFriendRequests(friendRequests).incoming);
    setSentRequests(toLayoutFriendRequests(friendRequests).outgoing);
  }, [friendRequests, isLoading]);

  const [friendInput, setFriendInput] = useState('');
  const [uiMessage, setUiMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const normalizedInput = friendInput.trim().toLowerCase();
  const canSend = normalizedInput.length >= 3;

  const pushMessage = (text: string, type: 'success' | 'error') => {
    setUiMessage({ text, type });
    window.clearTimeout((pushMessage as any).t);
    (pushMessage as any).t = window.setTimeout(() => {
      setUiMessage(null);
    }, 3000);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    const alreadySent = sentRequests.some((r) => r.username.toLowerCase() === normalizedInput);
    const alreadyIncoming = incomingRequests.some((r) => r.username.toLowerCase() === normalizedInput);

    if (alreadySent) {
      pushMessage(`You already sent a request to @${normalizedInput}`, 'error');
      return;
    }
    if (alreadyIncoming) {
      pushMessage(`@${normalizedInput} already sent you a request! Check incoming.`, 'error');
      return;
    }

    let targetUser = null;
    try {
      targetUser = await fetchBasicUserInfo(normalizedInput, true);
      await sendFriendRequest(targetUser!.name);
    } catch (error: any) {
      // TODO: add specific http errors
      pushMessage(`Error Occurred: ${error.message}`, 'error');
      return;
    }
    if (targetUser == null) return;

    const newRequest: LayoutFriendRequest = {
      id: targetUser.id,
      username: targetUser.name,
      displayName: targetUser.name,
      mutualFriends: 0,
      avatarColor: 'bg-blue-500',
    };

    setSentRequests((prev) => [newRequest, ...prev]);
    pushMessage(`Success! Your friend request to @${normalizedInput} was sent.`, 'success');
    setFriendInput('');
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      await refreshUser();
    } catch (error: any) {
      pushMessage(`Error Occurred: ${error.message}`, 'error');
      return;
    }
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = async (id: string) => {
    try {
      await removeFriendRequest(id);
    } catch (error: any) {
      pushMessage(`Error Occurred: ${error.message}`, 'error');
      return;
    }
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCancelSent = async (id: string) => {
    try {
      await removeFriendRequest(id);
    } catch (error: any) {
      pushMessage(`Error Occurred: ${error.message}`, 'error');
      return;
    }
    setSentRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRemoveFriend = async (id: string) => {
    try {
      await removeFriend(id);
      await refreshUser();
    } catch (error: any) {
      pushMessage(`Error Occurred: ${error.message}`, 'error');
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-(--bg-base)" aria-label="Friends">
      {/* Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* Add Friend Banner */}
          <div className="mb-10">
            <h2 className="mb-2 text-base font-bold uppercase tracking-wide text-(--text-primary)">Add Friend</h2>
            <p className="mb-4 text-sm text-(--text-secondary)">
              You can add friends with their Lattice username. It's case sensitive!
            </p>

            <form
              onSubmit={handleSendRequest}
              className="relative flex items-center overflow-hidden rounded-lg border border-(--line) bg-(--surface-strong) transition-colors focus-within:border-emerald-500"
            >
              <input
                type="text"
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value.slice(0, 20))}
                placeholder="You can add friends with their lattice username."
                className="h-12 flex-1 bg-transparent px-4 text-sm text-(--text-primary) outline-none placeholder:text-(--text-secondary)/70"
              />
              <div className="pr-2">
                <button
                  type="submit"
                  disabled={!canSend}
                  className="group inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-600/40 disabled:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                >
                  <span>Send Friend Request</span>
                  <UserPlus className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </button>
              </div>
            </form>

            {/* Feedback Message */}
            {uiMessage && (
              <p className={`mt-2 text-sm ${uiMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {uiMessage.text}
              </p>
            )}
          </div>

          <div className="mb-8 border-t border-(--line)" />

          {/* Requests Lists */}
          <div className="flex flex-col gap-10">
            {/* Friends List */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-(--text-secondary)">
                <Users size={16} />
                <h2>All Friends — {friends.length}</h2>
              </div>

              {friends.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-(--line) text-sm text-(--text-secondary)">
                  No friends yet
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-(--surface-strong)"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar color="bg-blue-500" />
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-semibold text-(--text-primary)">{friend.name}</span>
                          </div>
                          <span className="text-xs text-(--text-secondary)">Friend</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="flex size-9 items-center justify-center rounded-full bg-(--surface) text-(--text-secondary) transition-colors hover:bg-rose-500 hover:text-white"
                          title="Remove Friend"
                        >
                          <UserMinus size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming Requests */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-(--text-secondary)">
                <Inbox size={16} />
                <h2>Incoming Requests — {incomingRequests.length}</h2>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-(--line) text-sm text-(--text-secondary)">
                  No pending incoming requests
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-(--surface-strong)"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar color={request.avatarColor} />
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-semibold text-(--text-primary)">{request.displayName}</span>
                            <span className="text-sm font-medium text-(--text-secondary)">{request.username}</span>
                          </div>
                          <span className="text-xs text-(--text-secondary)">Incoming Friend Request</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="flex size-9 items-center justify-center rounded-full bg-(--surface) text-(--text-secondary) transition-colors hover:bg-emerald-500 hover:text-white"
                          title="Accept"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          className="flex size-9 items-center justify-center rounded-full bg-(--surface) text-(--text-secondary) transition-colors hover:bg-rose-500 hover:text-white"
                          title="Ignore"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-(--text-secondary)">
                <Send size={16} />
                <h2>Sent Requests — {sentRequests.length}</h2>
              </div>

              {sentRequests.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-(--line) text-sm text-(--text-secondary)">
                  No pending sent requests
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-(--surface-strong)"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar color={request.avatarColor} />
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-semibold text-(--text-primary)">{request.displayName}</span>
                            <span className="text-sm font-medium text-(--text-secondary)">{request.username}</span>
                          </div>
                          <span className="text-xs text-(--text-secondary)">Outgoing Friend Request</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCancelSent(request.id)}
                          className="flex size-9 items-center justify-center rounded-full bg-(--surface) text-(--text-secondary) transition-colors hover:bg-rose-500 hover:text-white"
                          title="Cancel Request"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
