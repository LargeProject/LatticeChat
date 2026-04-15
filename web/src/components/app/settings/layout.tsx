import { useEffect, useState } from 'react';
import { LogOut, Radiation, User } from 'lucide-react';
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
    <section className="flex h-full min-h-0 flex-1 flex-col bg-(--surface)" aria-label="Settings">
      <div className="min-h-0 flex-1 overflow-y-auto py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6">
          {message && (
            <div className="rounded-xl border border-(--line) bg-(--surface-strong) px-4 py-3 text-sm text-(--text-primary)">
              {message}
            </div>
          )}
          {/* Profile card */}
          <section className="rounded-2xl border border-(--line) bg-(--surface-strong) p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid size-48 place-items-center rounded-full bg-(--link-bg-hover) text-sm font-semibold text-(--text-primary)">
                <User size={48} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-(--text-primary)">Account</h2>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-(--line) bg-(--surface) px-3 py-3">
                    <dt className="text-[11px] uppercase tracking-wide text-(--text-secondary)">Username</dt>
                    <dd className="mt-1 text-sm font-medium text-(--text-primary)">{userInfo.data?.name}</dd>
                  </div>
                  <div className="rounded-xl border border-(--line) bg-(--surface) px-3 py-3">
                    <dt className="text-[11px] uppercase tracking-wide text-(--text-secondary)">Email</dt>
                    <dd className="mt-1 text-sm font-medium text-(--text-primary)">{userInfo.data?.email}</dd>
                  </div>
                  <div className="rounded-xl border border-(--line) bg-(--surface) px-4 py-4 sm:col-span-2 flex flex-col items-center text-center gap-2">
                    <dt className="text-[12px] uppercase tracking-wide text-(--text-secondary)">Password</dt>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--line) px-3 py-2 text-sm font-semibold text-(--text-primary) transition hover:border-(--text-secondary) hover:bg-(--link-bg-hover)"
                      onClick={() => setChangePasswordOpen((prev) => !prev)}
                    >
                      Change password
                    </button>
                  </div>
                  {changePasswordOpen && (
                    <div className="sm:col-span-2 rounded-xl border border-(--line) bg-(--surface) p-4 text-left">
                      <form className="space-y-4" onSubmit={handleChangePassword} noValidate>
                        <div className="space-y-2">
                          <label className="text-sm text-(--text-secondary)">Current Password</label>
                          <input
                            type="password"
                            value={originalPassword}
                            onChange={(e) => setOriginalPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-(--line) bg-(--surface-strong) px-3 py-2 text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-(--text-secondary)">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-(--line) bg-(--surface-strong) px-3 py-2 text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          <label className="text-sm text-(--text-secondary)">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-(--line) bg-(--surface-strong) px-3 py-2 text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className={`inline-flex items-center justify-center gap-2 rounded-lg border border-(--line) px-3 py-2 text-sm font-semibold transition ${
                            isLoading
                              ? 'cursor-not-allowed text-(--text-secondary)'
                              : 'text-(--text-primary) hover:border-(--text-secondary) hover:bg-(--link-bg-hover)'
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
          <section className="rounded-2xl border border-(--line) bg-(--surface-strong) p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <h2 className="text-sm font-semibold text-(--text-primary)">Session</h2>

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
