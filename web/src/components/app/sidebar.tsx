import { useState } from 'react'
import {
  HiOutlineChatBubbleOvalLeft,
  HiOutlinePhone,
  HiMiniUser,
  HiMiniPlus,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

type Section = 'chats' | 'calls' | 'settings'

type NavItem = {
  key: Section
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

type SidebarProps = {
  defaultSection?: Section
  onSelectSection?: (section: Section) => void
}

const navItems: NavItem[] = [
  { key: 'chats', label: 'Chats', icon: HiOutlineChatBubbleOvalLeft },
  { key: 'calls', label: 'Calls', icon: HiOutlinePhone },
  { key: 'settings', label: 'Settings', icon: HiOutlineCog6Tooth },
]

const ICON_SIZE = 24

export default function Sidebar({
  defaultSection = 'chats',
  onSelectSection,
}: SidebarProps) {
  const [active, setActive] = useState<Section>(defaultSection)

  const handleSelect = (key: Section) => {
    setActive(key)
    onSelectSection?.(key)
  }

  return (
    <aside className="flex h-screen w-20 flex-col items-center gap-3 border-r border-(--line) bg-(--surface-strong) px-3 py-4 shadow-[6px_0_22px_rgba(0,0,0,0.05)] backdrop-blur-md">
      {/* Top rail */}
      <div className="flex w-full flex-col items-center gap-3">
        <button
          type="button"
          className="group relative flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#52525b,#3f3f46)] text-white shadow-[0_12px_26px_rgba(82,82,91,0.35)] transition hover:scale-105 dark:shadow-none"
          aria-label="Your profile"
        >
          <HiMiniUser size={ICON_SIZE} />
          <span className="absolute inset-x-0 bottom-1 text-[10px] uppercase tracking-[0.08em] opacity-70">
            You
          </span>
        </button>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-2xl border border-(--chip-line) bg-(--chip-bg) text-[#7a7a7a] shadow-[0_12px_24px_rgba(23,58,64,0.1)] transition hover:-translate-y-0.5 hover:bg-(--link-bg-hover) dark:shadow-none"
          aria-label="Start a new chat"
        >
          <HiMiniPlus size={ICON_SIZE} />
        </button>
      </div>

      {/* Middle rail */}
      <div className="flex w-full flex-1 flex-col gap-1 pt-2">
        {navItems.map((item) => {
          const isActive = active === item.key
          const Icon = item.icon

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelect(item.key)}
              className={`group relative flex h-12 items-center justify-center rounded-2xl text-[#7a7a7a] transition ${
                isActive
                  ? 'bg-[rgba(82,82,91,0.12)] text-[#52525b]'
                  : 'hover:bg-(--link-bg-hover)'
              }`}
              aria-label={item.label}
            >
              <span
                className={`absolute -left-3 h-8 w-1.5 rounded-full transition ${
                  isActive
                    ? 'bg-[#52525b]'
                    : 'bg-transparent group-hover:bg-[rgba(82,82,91,0.5)]'
                }`}
              />

              <div
                className={`transition ${
                  isActive
                    ? 'scale-105 opacity-100'
                    : 'opacity-80 group-hover:opacity-100'
                }`}
              >
                <Icon size={ICON_SIZE} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom rail */}
      <div className="flex w-full flex-col items-center gap-2 pb-2">
        <AnimatedThemeToggler />
        <div className="flex items-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#7a7a7a]">
          <span className="font-bold">BETA</span>
        </div>
      </div>
    </aside>
  )
}