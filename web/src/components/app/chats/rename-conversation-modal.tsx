import { useEffect, useRef, useState } from 'react';
import { X, Edit2, AlertCircle } from 'lucide-react';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useConversation } from '#/components/hooks/useConversation';
import type { Conversation } from '@latticechat/shared';

type RenameConversationModalProps = {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
};

export function RenameConversationModal({ conversation, isOpen, onClose }: RenameConversationModalProps) {
  const { renameConversation } = useWebsocket();
  const { name } = useConversation(conversation);
  
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewName(name || '');
      setError(null);
      // Small timeout to allow the modal to render before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, name]);

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

  const handleRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Conversation name cannot be empty');
      return;
    }
    
    if (trimmed === name) {
      onClose(); // No change needed
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await renameConversation({ 
        conversationId: conversation.id, 
        newName: trimmed 
      });

      if ((result as any)?.success) {
        onClose();
      } else {
        setError('Failed to rename conversation');
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
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Edit2 size={18} className="text-zinc-500" />
            Rename Conversation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleRename} className="p-5 space-y-4">
          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="conversation-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Conversation Name
            </label>
            <input
              ref={inputRef}
              id="conversation-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
              disabled={loading}
              maxLength={50}
            />
          </div>
        </form>

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
            onClick={handleRename}
            disabled={loading || !newName.trim() || newName.trim() === name}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}