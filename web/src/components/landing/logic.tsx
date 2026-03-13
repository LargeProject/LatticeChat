import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ZXCVBNFeedback } from 'zxcvbn'


export function useAuthLogic() {
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

  //replace with actual api calls
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
        label: '',
        feedback: null,
      })
      return
    }

    const timer = setTimeout(async () => {
      const { default: zxcvbn } = await import('zxcvbn') //heavy ass module

      const { score, feedback } = zxcvbn(password)

      const labels = ['Extremely weak', 'Very Weak', 'Weak', 'Okay', 'Strong']

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
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) // ai written regex. placeholder-only

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

  return {
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
  }
}
