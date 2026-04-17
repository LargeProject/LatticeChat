import { useEffect, useState } from 'react';
import { LogOut, Radiation } from 'lucide-react';
import { useUser } from '#/lib/context/UserContext.tsx';
import { setLocalJWT } from '#/lib/util/storage.ts';
import { useNavigate } from '@tanstack/react-router';
import { deleteUser } from '#/lib/api/user.ts';
import { authClient } from '#/lib/auth.ts';
import type { ZXCVBNFeedback } from 'zxcvbn';

export default function SettingsLayout() {
  const { userInfo } = useUser();
  const navigate = useNavigate();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [originalPassword, setOriginalPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    feedback: ZXCVBNFeedback | null;
  }>({
    score: 0,
    label: '',
    feedback: null,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({
        score: 0,
        label: '',
        feedback: null,
      });
      return;
    }

    const timer = setTimeout(async () => {
      const { default: zxcvbn } = await import('zxcvbn');
      const { score, feedback } = zxcvbn(newPassword);
      const labels = ['Extremely weak', 'Very Weak', 'Weak', 'Okay', 'Strong'];

      setPasswordStrength({
        score,
        label: labels[score],
        feedback,
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [newPassword]);

  const isPasswordStrong = passwordStrength.score >= 3;
  const passwordsMatch = !confirmNewPassword || confirmNewPassword === newPassword;

  const handleSignOut = () => {
    setLocalJWT('');
    navigate({ to: '/' });
  };

  const handleDeleteUser = () => {
    deleteUser();
    setLocalJWT('');
    navigate({ to: '/' });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalPassword || !newPassword || !confirmNewPassword) {
      setMessage('Fill in your current password, new password, and confirmation.');
      return;
    }

    if (!isPasswordStrong) {
      setMessage('Choose a stronger new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword: originalPassword,
      newPassword,
    });
    setIsLoading(false);

    if (error) {
      setMessage(error.message || 'Failed to change password.');
      return;
    }

    setMessage('Password changed successfully.');
    setChangePasswordOpen(false);
    setOriginalPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-black relative" aria-label="Settings">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100/50 via-white to-white dark:from-zinc-900/20 dark:via-black dark:to-black opacity-60" />
      <div className="z-10 min-h-0 flex-1 overflow-y-auto py-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-6">
          {message && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm">
              {message}
            </div>
          )}
          {/* Profile card */}
          <section className="rounded-2xl border border-(--line) bg-(--surface-strong) p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-wide mb-6">Account Settings</h2>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-black/50 px-4 py-3 shadow-inner">
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Username</dt>
                    <dd className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{userInfo.data?.name}</dd>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-black/50 px-4 py-3 shadow-inner">
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Email</dt>
                    <dd className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{userInfo.data?.email}</dd>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-black/50 px-4 py-5 sm:col-span-2 flex flex-col items-center text-center gap-3 shadow-inner">
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Password</dt>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95"
                      onClick={() => setChangePasswordOpen((prev) => !prev)}
                    >
                      Change password
                    </button>
                  </div>
                  {changePasswordOpen && (
                    <div className="sm:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-black/40 p-5 text-left shadow-inner">
                      <form className="space-y-4" onSubmit={handleChangePassword} noValidate>
                        <div className="space-y-2">
                          <label className="text-sm font-mono text-zinc-500">Current Password</label>
                          <input
                            type="password"
                            value={originalPassword}
                            onChange={(e) => setOriginalPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-mono text-zinc-500">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                          />
                        </div>

                        <div
                          className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
                            isPasswordStrong
                              ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                              : 'border-rose-500/40 bg-rose-500/5 text-rose-200'
                          }`}
                        >
                          <p className="font-mono">Password strength: {passwordStrength.label}</p>
                          {!isPasswordStrong && (
                            <p className="text-[11px] text-rose-300/90">
                              Use 8+ chars with upper, lower, numbers, and symbols.<br></br>
                            </p>
                          )}
                          <p>
                            <br></br>
                            Encryption strength relies on password complexity, so a stronger password is recommended for
                            better security.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-mono text-zinc-500">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                          />
                        </div>

                        {confirmNewPassword && (
                          <div
                            className={`mt-1 rounded-lg border px-3 py-2 text-xs ${
                              passwordsMatch
                                ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                                : 'border-red-500/40 bg-red-500/5 text-red-300'
                            }`}
                          >
                            <p className="font-mono">
                              {passwordsMatch ? 'Passwords match.' : 'Passwords do not match yet.'}
                            </p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`w-full mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold tracking-wide transition-all ${
                            isLoading
                              ? 'cursor-not-allowed bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600'
                              : 'bg-amber-100 hover:bg-white text-black shadow-md active:scale-95'
                          }`}
                        >
                          {isLoading ? 'Updating...' : 'Update password'}
                        </button>
                      </form>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </section>

          {/* Danger / session */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 shadow-lg">
            <div className="flex flex-col gap-5">
              {/* Header */}
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-wide">Session Management</h2>

              {/* Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-black/50 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 shadow-inner"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} className="text-zinc-500 dark:text-zinc-400" />
                  Sign out
                </button>

                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-95 shadow-inner"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Radiation size={18} className="text-rose-500 dark:text-rose-400" />
                  Delete account
                </button>
              </div>

              {isDeleteDialogOpen && (
                <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 p-4 text-left shadow-inner">
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-2">Are you absolutely sure?</h3>
                  <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-rose-500 text-sm font-bold text-white shadow-md transition-all hover:bg-rose-600 active:scale-95"
                      onClick={handleDeleteUser}
                    >
                      Yes, delete my account
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
