import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ShineBorder } from '@/components/ui/shine-border'
import { motion } from 'framer-motion'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail) {
      setMessage('Enter a valid email to reset.')
      return
    }
    setMessage('If this email exists, a reset link will be sent shortly.')
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-lg p-8 shadow-2xl space-y-6">
        <ShineBorder shineColor={['#ef4444', '#3b82f6']} />
        <div className="space-y-2 text-center">
          <h1 className="text-3xl md:text-3xl font-extrabold bg-[#E1E1E1] bg-clip-text text-transparent">
            Forgot your password?
          </h1>
          <p className="text-sm text-zinc-400">
            We’ll help you reset it. Confirm below to proceed to the reset flow.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-red-500 space-y-2">
          <p>
            All of your messages will be deleted when you reset your password,
            but your account and contacts will remain intact.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left bg-transparent">
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@lattice.com"
              className="w-full bg-zinc-900 text-zinc-200 placeholder:text-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
              required
            />
            <p className="text-xs text-zinc-500">
              We’ll send a secure reset link to this email if it exists.
            </p>
            {message && (
              <p
                className={`text-xs ${
                  message.includes('valid')
                    ? 'text-amber-300'
                    : 'text-emerald-300'
                }`}
              >
                {message}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!email || !isValidEmail}
            className="w-full  text-white font-semibold py-3 rounded-lg hover:bg-zinc-200 active:translate-y-px transition disabled:opacity-60 "
          >
            Send reset link
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
  )
}

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPassword,
})
