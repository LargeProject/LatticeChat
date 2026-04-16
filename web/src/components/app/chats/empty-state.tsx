import { BsIncognito } from 'react-icons/bs';
import { EncryptedText } from '../../ui/encrypted-text';

export function EmptyState() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-8 py-12 text-center">
        {/* Icon badge */}
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-(--line) bg-(--surface-strong) shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <BsIncognito className="text-[32px] text-zinc-500 dark:text-zinc-300" />
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          <EncryptedText
            text="Welcome to LatticeChat."
            encryptedClassName="text-(--text-secondary)"
            className="bg-linear-to-r from-cyan-400 via-purple-400 to-blue-500 bg-clip-text text-transparent animate-gradient"
            revealDelayMs={32}
          />
        </h1>

        <p className="text-zinc-400 text-base leading-relaxed">
          Messages encrypted in transit
        </p>

      </div>
    </div>
  );
}
