import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { ShineBorder } from '@/components/ui/shine-border'
const Lattice = lazy(() => import('@/components/ui/lattice'))
import type { ZXCVBNFeedback } from 'zxcvbn'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [emailAvailability, setEmailAvailability] = useState<string | null>(
    null,
  )
  const [usernameAvailability, setUsernameAvailability] = useState<
    string | null
  >(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError(null) // clear errors on toggle
  }

  // Example mutation – replace with your actual API calls
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: {
      email: string
      password: string
      username?: string
    }) => {
      const endpoint = mode === 'login' ? '/api/login' : '/api/signup'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Authentication failed')
      return res.json()
    },
    onSuccess: () => {
      // Redirect to about page after successful auth
      navigate({ to: '/about' })
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    mutate({
      email,
      password,
      username: mode === 'signup' ? username : undefined,
    })
  }

  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    label: string
    feedback: ZXCVBNFeedback | null
  }>({
    score: 0,
    label: '',
    feedback: null,
  })

  useEffect(() => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        label: "",
        feedback: null,
      })
      return
    }
  
    const timer = setTimeout(async () => {
      const { default: zxcvbn } = await import("zxcvbn")
  
      const { score, feedback } = zxcvbn(password)
  
      const labels = [
        "Extremely weak",
        "Very Weak",
        "Weak",
        "Okay",
        "Strong",
      ]
  
      setPasswordStrength({
        score,
        label: labels[score],
        feedback,
      })
    }, 200)
  
    return () => clearTimeout(timer)
  }, [password])

  const isPasswordStrong = passwordStrength.score >= 3
  const passwordsMatch =
    mode !== 'signup' || !confirmPassword ? true : confirmPassword === password

  useEffect(() => {
    if (mode !== 'signup') {
      setEmailAvailability(null)
      setIsCheckingEmail(false)
      return
    }

    if (!email) {
      setEmailAvailability(null)
      setIsCheckingEmail(false)
      return
    }

    setIsCheckingEmail(true)
    const timer = setTimeout(() => {
      const trimmed = email.trim().toLowerCase()
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)

      if (!isValidEmail) {
        setEmailAvailability('Enter a valid email to check availability.')
        setIsCheckingEmail(false)
        return
      }

      const looksTaken =
        trimmed.endsWith('@taken.com') || trimmed.includes('taken@')
      setEmailAvailability(
        looksTaken ? 'Email appears taken.' : 'Email looks available.',
      )
      setIsCheckingEmail(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [mode, email])

  useEffect(() => {
    if (mode !== 'signup') {
      setUsernameAvailability(null)
      setIsCheckingUsername(false)
      return
    }

    if (!username) {
      setUsernameAvailability(null)
      setIsCheckingUsername(false)
      return
    }

    setIsCheckingUsername(true)
    const timer = setTimeout(() => {
      const looksTaken = username.trim().toLowerCase().includes('taken')
      setUsernameAvailability(
        looksTaken ? 'Username appears taken.' : 'Username looks available.',
      )
      setIsCheckingUsername(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [mode, username])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return (
    <main className="relative min-h-screen w-screen bg-black overflow-hidden flex items-stretch justify-center">
      <div className="relative w-full h-screen md:h-screen overflow-hidden bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 " />

        {!isMobile && (
          <motion.div
            className="pointer-events-auto absolute inset-y-0 left-0 w-2/3 z-20"
            initial={false}
            animate={{ x: mode === 'login' ? '0%' : '50%' }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          >
            <Suspense fallback={null}>
              <Lattice />
            </Suspense>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative max-w-md space-y-4 rounded-xl border border-zinc-800 bg-black/90 backdrop-blur-1xl p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] z-30">
                <h1
                  className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 via-purple-400 to-blue-500 bg-clip-text text-transparent bg-size-[200%_200%] animate-gradient
"
                >
                  Lattice Chat
                </h1>

                <p className="text-zinc-400 text-base leading-relaxed">
                  End-to-end encrypted messaging powered by
                  <span className="text-zinc-200 font-semibold">
                    {' '}
                    post-quantum cryptography
                  </span>
                  .
                </p>

                <p className="text-black-500 text-sm leading-relaxed">
                  Key exchange uses the
                  <span className="text-purple-400 font-semibold">
                    {' '}
                    Kyber lattice algorithm
                  </span>
                  , designed to remain secure even against future quantum
                  computers.
                </p>

                <div className="flex gap-4 justify-center pt-2 text-[12px] font-mono text-black-500">
                  <span className="border border-zinc-800 px-2 py-1 rounded">
                    E2EE
                  </span>
                  <span className="border border-zinc-800 px-2 py-1 rounded">
                    Post-Quantum
                  </span>
                  <span className="border border-zinc-800 px-2 py-1 rounded">
                    Kyber KEM
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="relative z-10 grid h-full grid-cols-1 md:grid-cols-3">
          <div className="flex items-center p-8 md:col-span-1">
            <AnimatePresence mode="wait">
              {mode === 'signup' ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full"
                >
                  <div className="space-y-2 mb-6 text-left">
                    <h1 className="text-4xl font-extrabold bg-linear-to-r from-cyan-400 via-purple-500 to-blue-500 bg-size-[200%_200%] animate-gradient bg-clip-text text-transparent tracking-tight">
                      Create Account
                    </h1>
                    <p className="text-zinc-500 text-sm">
                      Join to speak freely.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-left mb-4">
                      <p className="text-red-400 text-sm font-mono">{error}</p>
                    </div>
                  )}

                  <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
                    <ShineBorder shineColor={['#ffdf00', '#dfe6d5']} />

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-zinc-500 text-sm">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono outline-none focus:border-zinc-600 transition-colors"
                          required
                        />
                      </div>

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
                        <p className="font-mono">
                          {isCheckingEmail
                            ? 'Checking email availability...'
                            : (emailAvailability ??
                              'Enter email to check availability.')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-zinc-500 text-sm">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="your-handle"
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono outline-none focus:border-zinc-600 transition-colors"
                          required
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
                        <p className="font-mono">
                          {isCheckingUsername
                            ? 'Checking username availability...'
                            : (usernameAvailability ??
                              'Enter username to check availability.')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-zinc-500 text-sm">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono outline-none focus:border-zinc-600 transition-colors"
                          required
                        />
                      </div>

                      <div
                        className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
                          isPasswordStrong
                            ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                            : 'border-amber-500/40 bg-amber-500/5 text-amber-200'
                        }`}
                      >
                        <p className="font-mono">
                          Password strength: {passwordStrength.label}
                        </p>
                        {!isPasswordStrong && (
                          <p className="text-[11px] text-amber-300/90">
                            Use 12+ chars with upper, lower, numbers, and
                            symbols.<br></br>
                          </p>
                        )}
                        <p>
                          <br></br>
                          Encryption strength relies on password complexity, so
                          a stronger password is recommended for better
                          security.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-zinc-500 text-sm">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono outline-none focus:border-zinc-600 transition-colors"
                          required
                        />
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
                            {passwordsMatch
                              ? 'Passwords match.'
                              : 'Passwords do not match yet.'}
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-zinc-100 text-black p-3 text-sm font-bold mt-2 cursor-pointer disabled:opacity-50 transition-all duration-200 ease-out hover:bg-zinc-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                      >
                        {isPending ? 'Processing...' : 'Sign Up'}
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 text-left">
                    <button
                      onClick={toggleMode}
                      className="text-sm text-zinc-400 hover:text-zinc-300 underline transition-colors"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full text-zinc-500 text-sm space-y-3"
                ></motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-start md:items-center p-6 pt-12 md:p-8 md:col-start-3">
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full"
                >
                  <div className="space-y-2 mb-6 text-left md:text-right">
                    <h1 className="text-4xl font-extrabold bg-linear-to-r from-cyan-400 via-purple-500 to-blue-500 bg-size-[200%_200%] animate-gradient bg-clip-text text-transparent tracking-tight">
                      Welcome Back
                    </h1>
                    <p className="text-zinc-500 text-sm">
                      Sign in to continue your encrypted chats{' '}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-left md:text-right mb-4">
                      <p className="text-red-400 text-sm font-mono">{error}</p>
                    </div>
                  )}

                  <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
                    <ShineBorder shineColor={['#ffdf00', '#dfe6d5']} />

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-zinc-500 text-sm">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono outline-none focus:border-zinc-600 transition-colors"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-zinc-500 text-sm">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono outline-none focus:border-zinc-600 transition-colors"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-zinc-100 text-black p-3 text-sm font-bold mt-2 cursor-pointer disabled:opacity-50 transition-all duration-200 ease-out hover:bg-zinc-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                      >
                        {isPending ? 'Processing...' : 'Sign In'}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate({ to: '/forgot' })}
                        className="w-full mt-3 text-sm font-mono text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 text-left md:text-right">
                    <button
                      onClick={toggleMode}
                      className="text-sm text-zinc-400 hover:text-zinc-300 underline transition-colors"
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div
                  key="login-covered"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.25 }}
                  className="w-full text-right text-xs text-zinc-500"
                ></motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/')({
  component: Auth,
})
