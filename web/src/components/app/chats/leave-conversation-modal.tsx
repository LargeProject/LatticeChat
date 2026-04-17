import { useEffect, useRef, useState } from 'react';
import { X, LogOut, AlertCircle } from 'lucide-react';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useAppState } from '#/lib/context/AppStateContext';
import { useConversation } from '#/components/hooks/useConversation';
import type { Conversation } from '@latticechat/shared';

type LeaveConversationModalProps = {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
};

export function LeaveConversationModal({ conversation, isOpen, onClose }: LeaveConversationModalProps) {
  const { leaveConversation } = useWebsocket();
  const { refreshUser } = useUser();
  const { setConvoId } = useAppState();
  const { name } = useConversation(conversation);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, loading]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleLeave = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await leaveConversation(conversation.id);

      if ((result as any)?.success) {
        await refreshUser();
        setConvoId(''); // Clear the selected conversation
        onClose();
      } else {
        setError('Failed to leave conversation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div ref={modalRef} className="w-full max-w-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-base font-semibold text-rose-600 dark:text-rose-500 flex items-center gap-2">
            <LogOut size={18} />
            Leave Conversation
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to leave <span className="font-semibold text-zinc-900 dark:text-zinc-200">{name}</span>? 
            You will no longer receive messages from this conversation.
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-zinc-100 dark:border-zinc-800 px-5 py-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLeave}
            disabled={loading}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Leaving...' : 'Leave'}
          </button>
        </div>
      </div>
    </div>
  );
}