import { useState } from 'react';
import { HiOutlineChatBubbleOvalLeft, HiOutlinePhone, HiOutlineCog6Tooth, HiUserPlus } from 'react-icons/hi2';
import { AnimatedThemeToggler } from '../../registry/magicui/animated-theme-toggler';

type Section = 'chats' | 'friends' | 'calls' | 'settings';

type NavItem = {
  key: Section;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type SidebarProps = {
  defaultSection?: Section;
  activeSection?: Section;
  onSelectSection?: (section: Section) => void;
};

const navItems: NavItem[] = [
  { key: 'chats', label: 'Chats', icon: HiOutlineChatBubbleOvalLeft },
  { key: 'friends', label: 'Add Friend', icon: HiUserPlus },
  { key: 'settings', label: 'Settings', icon: HiOutlineCog6Tooth },
];

const ICON_SIZE = 22;

export default function Sidebar({ defaultSection = 'chats', activeSection, onSelectSection }: SidebarProps) {
  const [active, setActive] = useState<Section>(defaultSection);

  const handleSelect = (key: Section) => {
    if (activeSection === undefined) {
      setActive(key);
    }
    onSelectSection?.(key);
  };

  return (
    <aside
      className="flex h-screen w-20 flex-col items-center border-r border-(--line) bg-(--surface-strong)/90 px-3 py-4 backdrop-blur-xl"
      aria-label="Primary"
    >
      <nav className="mt-1 flex w-full flex-1 flex-col items-center gap-1.5" aria-label="Main sections">
        {navItems.map((item) => {
          const isActive = (activeSection ?? active) === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelect(item.key)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
              className={[
                'group relative grid h-12 w-12 place-items-center rounded-2xl',
                'transition-all duration-200 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-strong)',
                isActive
                  ? 'bg-zinc-500/15 text-(--text-primary) shadow-sm'
                  : 'text-(--text-secondary) hover:bg-(--link-bg-hover) hover:text-(--text-primary)',
              ].join(' ')}
            >
              <span
                aria-hidden
                className={[
                  'pointer-events-none absolute -left-2.5 h-7 w-1 rounded-full transition-all duration-200',
                  isActive
                    ? 'bg-zinc-600 opacity-100 dark:bg-zinc-300'
                    : 'bg-zinc-500/50 opacity-0 group-hover:opacity-100',
                ].join(' ')}
              />
              <Icon
                size={ICON_SIZE}
                className={[
                  'transition-transform duration-200 ease-out',
                  isActive ? 'scale-105' : 'group-hover:scale-[1.03]',
                ].join(' ')}
              />
              <span className="sr-only">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-2 flex w-full flex-col items-center gap-2">
        <AnimatedThemeToggler />
        <div
          className="rounded-xl border border-(--line) bg-(--surface) px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-(--text-secondary)"
          aria-label="Application status: beta"
          title="Application status: beta"
        >
          BETA
        </div>
      </div>
    </aside>
  );
}
