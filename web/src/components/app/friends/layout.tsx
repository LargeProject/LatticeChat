import { useState } from 'react';
import { Check, X, User, UserPlus, Inbox, Send } from 'lucide-react';

type FriendRequest = {
  id: string;
  username: string;
  displayName: string;
  mutualFriends: number;
  avatarColor: string;
};

const initialIncomingRequests: FriendRequest[] = [
  {
    id: '1',
    username: 'bread',
    displayName: 'Bread',
    mutualFriends: 4,
    avatarColor: 'bg-amber-500',
  },
  {
    id: '2',
    username: 'toaster',
    displayName: 'Toaster',
    mutualFriends: 2,
    avatarColor: 'bg-blue-500',
  },
];

const initialSentRequests: FriendRequest[] = [
  {
    id: '4',
    username: 'help',
    displayName: 'Help',
    mutualFriends: 1,
    avatarColor: 'bg-rose-500',
  },
  {
    id: '5',
    username: 'avacado',
    displayName: 'Avacado',
    mutualFriends: 3,
    avatarColor: 'bg-emerald-500',
  },
];

function Avatar({ color }: { color: string }) {
  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${color} text-white`}
    >
      <User size={20} />
    </div>
  );
}

export default function FriendsLayout() {
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>(
    initialIncomingRequests,
  );
  const [sentRequests, setSentRequests] =
    useState<FriendRequest[]>(initialSentRequests);

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

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    const alreadySent = sentRequests.some(
      (r) => r.username.toLowerCase() === normalizedInput,
    );
    const alreadyIncoming = incomingRequests.some(
      (r) => r.username.toLowerCase() === normalizedInput,
    );

    if (alreadySent) {
      pushMessage(`You already sent a request to @${normalizedInput}`, 'error');
      return;
    }
    if (alreadyIncoming) {
      pushMessage(
        `@${normalizedInput} already sent you a request! Check incoming.`,
        'error',
      );
      return;
    }

    const newRequest: FriendRequest = {
      id: `manual-${Date.now()}`,
      username: normalizedInput,
      displayName: normalizedInput,
      mutualFriends: 0,
      avatarColor: 'bg-indigo-500',
    };

    setSentRequests((prev) => [newRequest, ...prev]);
    pushMessage(
      `Success! Your friend request to @${normalizedInput} was sent.`,
      'success',
    );
    setFriendInput('');
  };

  const handleAccept = (id: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCancelSent = (id: string) => {
    setSentRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <section
      className="flex h-full min-h-0 flex-1 flex-col bg-(--bg-base)"
      aria-label="Friends"
    >
      {/* Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* Add Friend Banner */}
          <div className="mb-10">
            <h2 className="mb-2 text-base font-bold uppercase tracking-wide text-(--text-primary)">
              Add Friend
            </h2>
            <p className="mb-4 text-sm text-(--text-secondary)">
              You can add friends with their Lattice username. It's case
              sensitive!
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
              <p
                className={`mt-2 text-sm ${uiMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
              >
                {uiMessage.text}
              </p>
            )}
          </div>

          <div className="mb-8 border-t border-(--line)" />

          {/* Requests Lists */}
          <div className="flex flex-col gap-10">
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
                            <span className="text-base font-semibold text-(--text-primary)">
                              {request.displayName}
                            </span>
                            <span className="text-sm font-medium text-(--text-secondary)">
                              {request.username}
                            </span>
                          </div>
                          <span className="text-xs text-(--text-secondary)">
                            Incoming Friend Request
                          </span>
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
                            <span className="text-base font-semibold text-(--text-primary)">
                              {request.displayName}
                            </span>
                            <span className="text-sm font-medium text-(--text-secondary)">
                              {request.username}
                            </span>
                          </div>
                          <span className="text-xs text-(--text-secondary)">
                            Outgoing Friend Request
                          </span>
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
