import { CalendarDays, Circle, Shield } from 'lucide-react';

type User = {
  name: string;
  avatar: string;
};

type UserInfoPanelProps = {
  user: User;
};

const toInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export function UserInfoPanel({ user }: UserInfoPanelProps) {
  const initials = toInitials(user.name);

  return (
    <aside className="h-full border-l border-(--line) bg-(--surface) p-4">
      <div className="flex h-full flex-col gap-4">
        <header className="rounded-2xl border border-(--line) bg-(--surface-strong) p-4">
          <div className="flex gap-3">
            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.name} avatar`}
                  className="size-14 rounded-full object-cover ring-1 ring-(--line)"
                />
              ) : (
                <div className="grid size-14 place-items-center rounded-full bg-zinc-700 text-sm font-semibold text-white ring-1 ring-(--line)">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              <h2 className="truncate text-sm font-semibold text-(--fg)">
                {user.name}
              </h2>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-(--line) bg-(--surface-strong) p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-(--text-secondary)">
            Profile
          </h3>

          <dl className="mt-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-xs text-(--text-secondary)">
                <Circle size={10} className="fill-current text-emerald-500" />
                Status
              </dt>
              <dd className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Active now
              </dd>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-xs text-(--text-secondary)">
                <CalendarDays size={14} />
                Joined
              </dt>
              <dd className="text-xs font-medium text-(--fg)">Recently</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-(--line) bg-(--surface-strong) p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-(--text-secondary)">
            Safety
          </h3>
          <p className="mt-2 text-xs leading-5 text-(--text-secondary)">
            End-to-end encrypted context is enabled for this conversation.
            Messages are protected in transit and at rest.
          </p>
        </section>
      </div>
    </aside>
  );
}
