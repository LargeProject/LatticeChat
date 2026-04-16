import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShineBorder } from '@/components/ui/shine-border';
import Label from '../components/landing/label';
import { useAuthLogic } from '../components/landing/logic';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

const LatticeAnimation = lazy(() => import('@/components/ui/lattice'));

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // this is the brain of the auth page that has all of the functions api developer :) ily
  const {
    mode,
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    emailAvailability,
    usernameAvailability,
    isCheckingEmail,
    isCheckingUsername,
    passwordStrength,
    isPasswordStrong,
    passwordsMatch,
    toggleMode,
    handleSubmit,
    isMobile,
    isPending,
    navigate,
  } = useAuthLogic();

  return (
    <motion.div 
      className="min-h-screen bg-zinc-950 flex overflow-hidden w-screen"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div className="flex w-full h-screen relative" initial={false}>
        {/* Animated Background Panel */}
        <motion.div
          className="absolute top-0 h-full z-10 hidden md:block"
          initial={false}
          animate={{
            left: mode === 'login' ? 0 : '33.3333%',
            width: '66.6667%',
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 25,
            mass: 1,
          }}
        >
          <div className="w-full h-full relative">
            <Suspense fallback={null}>
              <LatticeAnimation />
            </Suspense>
            <Label />
          </div>
        </motion.div>

        {/* Form Panel */}
        <motion.div
          className="absolute top-0 h-full w-full md:w-1/3 z-20 flex p-4 md:p-8 pb-12 md:pb-16 overflow-y-auto"
          initial={false}
          animate={{
            left: isMobile ? 0 : mode === 'login' ? '66.6667%' : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 25,
            mass: 1,
          }}
        >
          <motion.div className="w-full max-w-md my-auto py-12 md:py-0 mx-auto" layout>
            <div className="relative">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute bottom-full left-0 w-full mb-6 p-4 rounded-lg bg-red-500/15 border border-red-500/30 backdrop-blur-sm shadow-lg shadow-red-500/20 z-30"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-mono text-red-300">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-black rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse" />

                <div className="relative bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl overflow-hidden">
                  <ShineBorder shineColor={['#ffdf00', '#dfe6d5']} />

                  <motion.div
                    className="mb-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2
                      className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient"
                      style={{
                        backgroundSize: '200% 200%',
                        animation: 'gradient 5s ease infinite',
                      }}
                    >
                      {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-zinc-500 text-sm">
                      {mode === 'login' ? 'Sign in to continue your chats' : 'Join to speak freely.'}
                    </p>
                  </motion.div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-mono text-zinc-500">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full bg-zinc-950 border ${
                            mode === 'signup' && emailAvailability && !emailAvailability.includes('taken')
                              ? 'border-emerald-500/50 focus:border-emerald-500'
                              : 'border-zinc-800 focus:border-zinc-600'
                          } rounded-lg px-10 py-2.5 text-zinc-400 font-mono text-sm focus:outline-none transition-all`}
                          placeholder="you@example.com"
                        />
                      </div>
                      {mode === 'signup' && (
                        <div
                          className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
                            isCheckingEmail
                              ? 'border-amber-500/50 bg-amber-500/5 text-amber-300'
                              : emailAvailability
                                ? emailAvailability.includes('taken')
                                  ? 'border-red-500/40 bg-red-500/5 text-red-300'
                                  : 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                                : 'border-zinc-700 bg-zinc-900/60 text-zinc-400'
                          }`}
                        >
                          <p className="font-mono flex items-center gap-2">
                            {isCheckingEmail ? (
                              <>
                                <motion.span
                                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                                  animate={{ opacity: [1, 0.3, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                Checking email availability...
                              </>
                            ) : (
                              <>
                                {emailAvailability && !emailAvailability.includes('taken') && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                )}
                                {emailAvailability ?? 'Enter email to check availability.'}
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {mode === 'signup' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <label className="block text-sm font-mono text-zinc-500">Username</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value.slice(0, 20))}
                              className={`w-full bg-zinc-950 border ${
                                isCheckingUsername
                                  ? 'border-amber-500/50 focus:border-amber-500'
                                  : 'border-zinc-800 focus:border-zinc-600'
                              } rounded-lg px-10 py-2.5 text-zinc-400 font-mono text-sm focus:outline-none transition-all`}
                              placeholder="your-handle"
                            />
                          </div>
                          <div
                            className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
                              isCheckingUsername
                                ? 'border-amber-500/50 bg-amber-500/5 text-amber-300'
                                : usernameAvailability
                                  ? usernameAvailability.includes('taken')
                                    ? 'border-red-500/40 bg-red-500/5 text-red-300'
                                    : 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                                  : 'border-zinc-700 bg-zinc-900/60 text-zinc-400'
                            }`}
                          >
                            <p className="font-mono flex items-center gap-2">
                              {isCheckingUsername ? (
                                <>
                                  <motion.span
                                    className="w-1.5 h-1.5 rounded-full bg-amber-400"
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                                  Checking username availability...
                                </>
                              ) : (
                                (usernameAvailability ?? 'Enter username to check availability.')
                              )}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-mono text-zinc-500">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-10 py-2.5 text-zinc-400 font-mono text-sm focus:outline-none transition-all"
                          placeholder="••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {mode === 'signup' && (
                        <div
                          className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
                            isPasswordStrong
                              ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                              : 'border-rose-500/40 bg-rose-500/5 text-rose-200'
                          }`}
                        >
                          <p className="font-mono">Password strength: {passwordStrength.label}</p>
                          {!isPasswordStrong && (
                            <p className="text-[11px] text-rose-300/90 mt-1">
                              Use 8+ chars with upper, lower, numbers, and symbols.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {mode === 'signup' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <label className="block text-sm font-mono text-zinc-500">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg px-10 py-2.5 text-zinc-400 font-mono text-sm focus:outline-none transition-all"
                              placeholder="••••••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {confirmPassword && (
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
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={isPending || (mode === 'login' ? !email || !password : !email || !username || !password || !confirmPassword)}
                      className="w-full mt-4 relative group overflow-hidden rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={!isPending && (mode === 'login' ? email && password : email && username && password && confirmPassword) ? { scale: 1.02 } : undefined}
                      whileTap={!isPending && (mode === 'login' ? email && password : email && username && password && confirmPassword) ? { scale: 0.98 } : undefined}
                    >
                      <div className="absolute inset-0 bg-white text-clip opacity-100 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute inset-0 bg-white text-clip opacity-0 group-hover:opacity-100 blur transition-opacity" />
                      <span className="relative block py-2.5 text-black font-mono font-bold text-sm tracking-wide">
                        {isPending ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}
                      </span>
                    </motion.button>

                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => navigate({ to: '/forgot-password' })}
                        className="w-full mt-3 text-sm font-mono text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}

                    <div className="text-center pt-4">
                      <p className="text-sm text-zinc-400 font-mono">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                          type="button"
                          onClick={toggleMode}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                        >
                          {mode === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.div>
  );
}

export const Route = createFileRoute('/')({
  component: Auth,
});
