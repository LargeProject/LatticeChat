import { useMemo, useState, type ReactNode } from 'react'
import { MessageSquare, Phone, Settings, Users, Plus, CircleUserRound } from 'lucide-react'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

type Section = 'chats' | 'calls' | 'settings'

type SidebarProps = {
  defaultSection?: Section
  onSelectSection?: (section: Section) => void
}

const navItems: Array<{ key: Section; label: string; icon: ReactNode }> = [
  { key: 'chats', label: 'Chats', icon: <MessageSquare className="size-5" /> },
  { key: 'calls', label: 'Calls', icon: <Phone className="size-5" /> },
  { key: 'settings', label: 'Settings', icon: <Settings className="size-5" /> },
]

export default function Sidebar({
  defaultSection = 'chats',
  onSelectSection,
}: SidebarProps) {
  const [active, setActive] = useState<Section>(defaultSection)
  const items = useMemo(() => navItems, [])

  const handleSelect = (key: Section) => {
    setActive(key)
    onSelectSection?.(key)
  }

  return (
    <aside className="flex h-screen w-20.5 flex-col items-center gap-3 border-r border-(--line) bg-(--surface-strong) px-3 py-4 shadow-[6px_0_22px_rgba(0,0,0,0.05)] backdrop-blur-md">
      {/* Top rail: avatar + new chat */}
      <div className="flex w-full flex-col items-center gap-3">
        <button
          type="button"
          className="group relative flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-(--lagoon) to-(--lagoon-deep) text-lg font-extrabold text-white shadow-[0_12px_26px_rgba(79,184,178,0.35)] transition hover:scale-105 dark:shadow-none"
          aria-label="Your profile"
        >
          <CircleUserRound className="size-6 opacity-90 transition group-hover:scale-110" />
          <span className="absolute inset-x-0 bottom-1 text-[10px] uppercase tracking-[0.08em] opacity-70">
            You
          </span>
        </button>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-2xl border border-(--chip-line) bg-(--chip-bg) text-(--sea-ink) shadow-[0_12px_24px_rgba(23,58,64,0.1)] transition hover:-translate-y-0.5 hover:bg-(--link-bg-hover) dark:shadow-none"
          aria-label="Start a new chat"
        >
          <Plus className="size-5" />
        </button>
      </div>

      {/* Middle rail: nav items */}
      <div className="flex w-full flex-1 flex-col gap-1 pt-2">
        {items.map((item) => {
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelect(item.key)}
              className={`group relative flex h-12 items-center justify-center rounded-2xl text-(--sea-ink) transition ${
                isActive
                  ? 'bg-(--lagoon)/15 text-(--lagoon-deep) shadow-none dark:text-(--lagoon)'
                  : 'hover:bg-(--link-bg-hover)'
              }`}
              aria-label={item.label}
            >
              <span
                className={`absolute -left-3 h-8 w-1.5 rounded-full transition ${
                  isActive ? 'bg-(--lagoon)' : 'bg-transparent group-hover:bg-(--lagoon-deep)/60'
                }`}
              />
              <div
                className={`transition ${
                  isActive ? 'scale-105 opacity-100' : 'opacity-80 group-hover:opacity-100'
                }`}
              >
                {item.icon}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom rail: theme + version */}
      <div className="flex w-full flex-col items-center gap-2 pb-2">
        <AnimatedThemeToggler />
        <div className="flex items-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--sea-ink)">
          <span className="font-bold">Beta</span>
        </div>
      </div>
    </aside>
  )
}