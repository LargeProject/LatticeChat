import { useEffect, useRef, useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { fetchFriends } from '#/lib/api/friend';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import type { BasicUserInfo } from '#/lib/api/friend';
import { fetchUserInfo } from '#/lib/api/user';

type AddMembersModalProps = {
  conversationId: string;
  members?: BasicUserInfo[];
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: () => void;
};


export function AddMembersModal({
  conversationId,
  members,
  isOpen,
  onClose,
  onMemberAdded,
}: AddMembersModalProps) {
  const [friends, setFriends] = useState<BasicUserInfo[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { addMember, isAuthenticated } = useWebsocket();
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const memberIds = (members ?? []).map((m) => m.id);

  // Load friends on modal open
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const loadFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        const current = await fetchUserInfo();
        // current.friends is an array of BasicUserInfo (hydrated)
        const ids = (current?.friends ?? []).map((f: any) => f.id);
        // If current.friends already contains BasicUserInfo, use it directly to avoid extra fetches
        if (current?.friends && current.friends.length > 0) {
          setFriends(current.friends);
        } else {
          const friendsList = await fetchFriends(ids);
          setFriends(friendsList);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [isOpen, isAuthenticated]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddMember = async () => {
    if (!selectedFriend) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await addMember(conversationId, selectedFriend);

      if (result.success) {
        setSuccess(true);
        setSelectedFriend(null);
        onMemberAdded();
        // Reset success after 2s
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error || 'Failed to add member');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedFriendData = friends.find((f) => f.id === selectedFriend);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg border border-(--line) bg-(--surface) shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--line) px-4 py-3">
          <h2 className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
            <UserPlus size={18} />
            Add Members
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary)"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Member added successfully!
            </div>
          )}

          {/* Friends list or empty state */}
          {loading && friends.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-(--text-secondary)">Loading friends...</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-(--text-secondary)">No friends available</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {friends.map((friend) => {
                const isMember = memberIds.includes(friend.id);
                return (
                  <label
                    key={friend.id}
                    className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${isMember ? 'cursor-default bg-(--surface) opacity-70' : 'hover:bg-(--link-bg-hover) cursor-pointer'}`}
                    title={isMember ? 'Already a member' : `Add ${friend.name}`}
                  >
                    <input
                      type="radio"
                      name="friend"
                      value={friend.id}
                      checked={selectedFriend === friend.id}
                      onChange={(e) => !isMember && setSelectedFriend(e.target.value)}
                      disabled={isMember}
                      className="h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--text-primary) truncate">
                        {friend.name}
                      </p>
                      {friend.biography && (
                        <p className="text-xs text-(--text-secondary) truncate">
                          {friend.biography}
                        </p>
                      )}
                    </div>
                    {isMember && (
                      <div className="text-xs text-(--text-secondary)">Already in conversation</div>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with action button */}
        <div className="flex gap-2 border-t border-(--line) px-4 py-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover)"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMember}
            disabled={!selectedFriend || loading}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-medium bg-(--link-bg) text-white transition-colors hover:bg-(--link-bg-hover) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
