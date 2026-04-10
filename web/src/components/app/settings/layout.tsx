import { useEffect, useMemo, useState } from 'react';
import { LogOut, ShieldCheck, Radiation, User } from 'lucide-react';
import { useUser } from '#/lib/context/UserContext.tsx';
import { setLocalJWT } from '#/lib/util/storage.ts';
import { useNavigate } from '@tanstack/react-router';
import { deleteUser } from '#/lib/api/user.ts';

type PreferenceToggle = {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultOn?: boolean;
};

const preferenceToggles: PreferenceToggle[] = [
  {
    key: 'privacy',
    label: 'Read receipts',
    description: 'Show when you have viewed a conversation.',
    icon: ShieldCheck,
    defaultOn: false,
  },
];

export default function SettingsLayout() {
  const { userInfo } = useUser();
  const navigate = useNavigate();

  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    preferenceToggles.reduce(
      (acc, item) => {
        acc[item.key] = Boolean(item.defaultOn);
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const accentClass = useMemo(() => 'bg-(--link-bg-hover)', []);

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOut = () => {
    setLocalJWT('');
    navigate({ to: '/' });
  };

  const handleDeleteUser = () => {
    deleteUser();
    setLocalJWT('');
    navigate({ to: '/' });
  };

  return (
    <section
      className="flex h-full min-h-0 flex-1 flex-col bg-(--surface)"
      aria-label="Settings"
    >
      <div className="min-h-0 flex-1 overflow-y-auto py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6">
          {/* Profile card */}
          <section className="rounded-2xl border border-(--line) bg-(--surface-strong) p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid size-48 place-items-center rounded-full bg-(--link-bg-hover) text-sm font-semibold text-(--text-primary)">
                <User size={48} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-(--text-primary)">
                  Account
                </h2>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-(--line) bg-(--surface) px-3 py-3">
                    <dt className="text-[11px] uppercase tracking-wide text-(--text-secondary)">
                      Username
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-(--text-primary)">
                      {userInfo?.data?.name}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-(--line) bg-(--surface) px-3 py-3">
                    <dt className="text-[11px] uppercase tracking-wide text-(--text-secondary)">
                      Email
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-(--text-primary)">
                      {userInfo?.data?.email}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-(--line) bg-(--surface) px-4 py-4 sm:col-span-2 flex flex-col items-center text-center gap-2">
                    <dt className="text-[12px] uppercase tracking-wide text-(--text-secondary)">
                      Password
                    </dt>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--line) px-3 py-2 text-sm font-semibold text-(--text-primary) transition hover:border-(--text-secondary) hover:bg-(--link-bg-hover)"
                    >
                      Change password
                    </button>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* Preferences card */}
          <section className="rounded-2xl border border-(--line) bg-(--surface-strong) p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-(--text-primary)">
                  Preferences
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {preferenceToggles.map((item) => {
                const Icon = item.icon;
                const isOn = toggles[item.key];
                return (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 rounded-xl border border-(--line) bg-(--surface) px-3 py-3 transition-colors hover:border-(--text-secondary)"
                  >
                    <div
                      className={`${accentClass} grid size-9 place-items-center rounded-xl text-(--text-primary)`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-(--text-primary)">
                          {item.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggle(item.key)}
                          className={[
                            'relative inline-flex h-6 w-11 items-center rounded-full border border-(--line) transition-colors',
                            isOn ? 'bg-emerald-400' : 'bg-(--surface-strong)',
                          ].join(' ')}
                          aria-pressed={isOn}
                        >
                          <span
                            className={[
                              'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-all',
                              isOn ? 'translate-x-5' : 'translate-x-1',
                            ].join(' ')}
                          />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-(--text-secondary)">
                        {item.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Danger / session */}
          <section className="rounded-2xl border border-(--line) bg-(--surface-strong) p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <h2 className="text-sm font-semibold text-(--text-primary)">
                Session
              </h2>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--line) px-3 py-2 text-sm font-semibold text-emerald-500 transition hover:border-emerald-400 hover:bg-emerald-500/10"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  Sign out
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--line) px-3 py-2 text-sm font-semibold text-rose-500 transition hover:border-rose-400 hover:bg-rose-500/10"
                  onClick={handleDeleteUser}
                >
                  <Radiation size={16} />
                  Delete account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
