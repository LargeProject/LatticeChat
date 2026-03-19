// web/src/components/app/chats/empty-state.tsx
import { BsIncognito } from "react-icons/bs";
import { EncryptedText } from '../../ui/encrypted-text'

export function EmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
      {/* A nice subtle background circle for the icon */}
      <div className=" flex h-24 w-24 items-center justify-center rounded-full ">
        <BsIncognito size={48} strokeWidth={1.5} />
      </div>

      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        <EncryptedText
          text="Welcome to LatticeChat."
          encryptedClassName="text-neutral-500"
          className="bg-linear-to-r from-cyan-400 via-purple-400 to-blue-500 bg-clip-text text-transparent animate-gradient"
          revealDelayMs={40}
        />
      </h1>

      <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
        It's a little quiet here. Select a chat from the sidebar or start a new
        conversation to get going!
      </p>
    </div>
  )
}
