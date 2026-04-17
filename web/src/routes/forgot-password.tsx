import { useState, useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ShineBorder } from '@/components/ui/shine-border';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '#/lib/auth.ts';
import type { ZXCVBNFeedback } from 'zxcvbn';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
  const navigate = useNavigate();

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

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) {
      setMessage('Enter a valid email to reset.');
      return;
    }

    setIsLoading(true);
    const { error } = await authClient.emailOtp.requestPasswordReset({
      email,
    });

    setIsLoading(false);
    if (error) {
      setMessage(error.message || 'Failed to send reset link.');
    } else {
      setStep(2);
      setMessage(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !isPasswordStrong) {
      setMessage('Ensure you have entered the correct OTP and a strong new password.');
      return;
    }

    setIsLoading(true);
    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password: newPassword,
    });

    setIsLoading(false);
    if (error) {
      setMessage(error.message || 'Failed to reset password.');
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center px-4 py-16">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mb-4 w-full max-w-lg"
          >
            <div className="bg-red-500/15 border border-red-500/40 text-red-100 rounded-xl backdrop-blur px-4 py-3 shadow-lg shadow-red-500/20">
              <p className="text-sm font-medium">{message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-lg p-8 shadow-2xl space-y-6">
        <ShineBorder shineColor={['#ef4444', '#3b82f6']} />
        <div className="space-y-2 text-center">
          <h1 className="text-3xl md:text-3xl font-extrabold bg-[#E1E1E1] bg-clip-text text-transparent">
            {step === 1 ? 'Forgot your password?' : 'Reset your password'}
          </h1>
          <p className="text-sm text-zinc-400">
            {step === 1
              ? 'We’ll help you reset it. Confirm below to proceed to the reset flow.'
              : 'Enter the code we sent to your email, along with your new password.'}
          </p>
        </div>

        <form onSubmit={step === 1 ? handleSendOtp : handleResetPassword} noValidate className="space-y-4">
          {step === 1 ? (
            <div className="space-y-2 text-left bg-transparent">
              <label className="text-sm text-zinc-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lattice.com"
                className="w-full bg-zinc-900 text-zinc-200 placeholder:text-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
              />
              <p className="text-xs text-zinc-500">We’ll send a secure reset link to this email if it exists.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-left bg-transparent">
                <label className="text-sm text-zinc-400">Reset Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-zinc-900 text-zinc-200 placeholder:text-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
                />
              </div>
              <div className="space-y-2 text-left bg-transparent">
                <label className="text-sm text-zinc-400">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 text-zinc-200 placeholder:text-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
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
                    Use 8+ chars with upper, lower, numbers, and symbols.
                    <br></br>
                  </p>
                )}
                <p>
                  <br></br>
                  Encryption strength relies on password complexity, so a stronger password is recommended for better
                  security.
                </p>
              </div>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || (step === 1 && !isValidEmail)}
            className={`w-full font-semibold py-3 rounded-lg transition active:translate-y-px ${
              isLoading || (step === 1 && !isValidEmail)
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200 hover:-translate-y-px shadow-lg shadow-white/10'
            }`}
          >
            {isLoading ? 'Processing...' : step === 1 ? 'Send reset link' : 'Reset Password'}
          </motion.button>
        </form>

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full text-center text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition"
          >
            Go back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPassword,
});
