import { useState, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { ShineBorder } from '@/components/ui/shine-border'
import { motion } from 'framer-motion'

function VerifyEmail() {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const isLoading = false

  const verifyCode = () => {
    const verificationCode = code.join('')
    console.log('Code:', verificationCode)

    // example
    // navigate({ to: "/dashboard" })
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]

    // paste support
    if (value.length > 1) {
      const pasted = value.slice(0, code.length).split('')

      pasted.forEach((char, i) => {
        newCode[i] = char
      })

      setCode(newCode)
      inputRefs.current[Math.min(pasted.length, code.length - 1)]?.focus()
      return
    }

    newCode[index] = value
    setCode(newCode)

    if (value && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyCode()
  }

  useEffect(() => {
    if (code.every(Boolean)) {
      verifyCode()
    }
  }, [code])

  return (
    <main className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-lg p-8 shadow-2xl space-y-6">
      <ShineBorder shineColor={['#34d399', '#22d3ee']}/>
        <h2 className="text-3xl md:text-3xl font-extrabold bg-linear-to-r from-green-400 via-teal-400 to-cyan-500 animate-gradient bg-clip-text text-transparent text-center">
          Verify Your Email
        </h2>
        
        <p className="text-sm text-zinc-400 text-center">
          Enter the 6-digit code we emailed you to confirm your address and
          complete your sign up.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl border border-gray-300 rounded bg-black text-white"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
            className="w-full bg-linear-to-r from-black via-cyan-500 to-black bg-size-[200%_200%] text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-cyan-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 animate-gradient"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </motion.button>
        </form>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmail,
})
