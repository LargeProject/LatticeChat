import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ShineBorder } from '@/components/ui/shine-border';
import { motion } from 'framer-motion';
import { authClient } from '#/lib/auth.ts';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    if (!otp || newPassword.length < 8) {
      setMessage('Enter OTP and a valid new password.');
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
    <main className="min-h-screen bg-black text-zinc-100 flex items-center justify-center px-4 py-16">
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

        {step === 1 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-red-500 space-y-2">
            <p>
              All of your messages will be deleted when you reset your password,
              but your account and contacts will remain intact.
            </p>
          </div>
        )}

        <form
          onSubmit={step === 1 ? handleSendOtp : handleResetPassword}
          noValidate
          className="space-y-4"
        >
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
              <p className="text-xs text-zinc-500">
                We’ll send a secure reset link to this email if it exists.
              </p>
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
            </>
          )}

          {message && (
            <p
              className={`text-xs ${message.includes('valid') || step === 2 ? 'text-amber-300' : 'text-red-300'}`}
            >
              {message}
            </p>
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
            {isLoading
              ? 'Processing...'
              : step === 1
                ? 'Send reset link'
                : 'Reset Password'}
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
