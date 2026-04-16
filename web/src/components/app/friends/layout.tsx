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
  name: string;
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
      name: friendRequest.associatedUser.name,
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

    const alreadySent = sentRequests.some((r) => r.name.toLowerCase() === normalizedInput);
    const alreadyIncoming = incomingRequests.some((r) => r.name.toLowerCase() === normalizedInput);

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

      if (!targetUser) return;
      await sendFriendRequest(targetUser.name);
    } catch (error: any) {
      // TODO: add specific http errors
      pushMessage(`Error Occurred: ${error.message}`, 'error');
      return;
    }

    const newRequest: LayoutFriendRequest = {
      id: targetUser.id,
      name: targetUser.name,
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
    <section className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-black relative" aria-label="Friends">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100/50 via-white to-white dark:from-zinc-900/20 dark:via-black dark:to-black opacity-60" />
      
      {/* Content Area */}
      <div className="z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Add Friend Banner */}
          <div className="mb-10 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 shadow-lg relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-50" />
            <h2 className="mb-2 text-lg font-bold tracking-wide text-zinc-900 dark:text-zinc-100">Add Friend</h2>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              You can add friends with their Lattice username. It's case sensitive!
            </p>

            <form
              onSubmit={handleSendRequest}
              className="relative flex items-center overflow-hidden rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 shadow-inner"
            >
              <input
                type="text"
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value.slice(0, 20))}
                placeholder="username"
                className="h-12 flex-1 bg-transparent px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
              <div className="pr-2">
                <button
                  type="submit"
                  disabled={!canSend}
                  className="group inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-600/40 disabled:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                >
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

          <div className="mb-8 border-t border-zinc-200 dark:border-zinc-800/60" />

          {/* Requests Lists */}
          <div className="flex flex-col gap-8">
            {/* Friends List */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <Users size={16} />
                <h2>All Friends — {friends.length}</h2>
              </div>

              {friends.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20 text-sm font-medium text-zinc-500 dark:text-zinc-600">
                  No friends yet
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="group flex items-center justify-between rounded-xl p-3 border border-transparent transition-all hover:bg-zinc-100/50 hover:border-zinc-200 dark:hover:bg-zinc-800/40 dark:hover:border-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar color="bg-gradient-to-br from-blue-400 to-indigo-500 shadow-inner" />
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{friend.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Friend</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 transition-colors hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500/20 dark:hover:text-rose-400 active:scale-95"
                          title="Remove Friend"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming Requests */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <Inbox size={16} />
                <h2>Incoming Requests — {incomingRequests.length}</h2>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20 text-sm font-medium text-zinc-500 dark:text-zinc-600">
                  No pending incoming requests
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="group flex items-center justify-between rounded-xl p-3 border border-transparent transition-all hover:bg-zinc-100/50 hover:border-zinc-200 dark:hover:bg-zinc-800/40 dark:hover:border-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar color="bg-gradient-to-br from-emerald-400 to-teal-500 shadow-inner" />
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{request.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Incoming Friend Request</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 transition-colors hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400 active:scale-95"
                          title="Accept"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 transition-colors hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500/20 dark:hover:text-rose-400 active:scale-95"
                          title="Ignore"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <Send size={16} />
                <h2>Sent Requests — {sentRequests.length}</h2>
              </div>

              {sentRequests.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20 text-sm font-medium text-zinc-500 dark:text-zinc-600">
                  No pending sent requests
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="group flex items-center justify-between rounded-xl p-3 border border-transparent transition-all hover:bg-zinc-100/50 hover:border-zinc-200 dark:hover:bg-zinc-800/40 dark:hover:border-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar color="bg-gradient-to-br from-zinc-400 to-zinc-500 dark:from-zinc-600 dark:to-zinc-700 shadow-inner" />
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{request.displayName || request.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Outgoing Friend Request</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCancelSent(request.id)}
                          className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 transition-colors hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500/20 dark:hover:text-rose-400 active:scale-95"
                          title="Cancel Request"
                        >
                          <X size={18} />
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
