import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(mode)
  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.style.colorScheme = mode
}

export function AnimatedThemeToggler() {
  const [theme, setTheme] = useState<ThemeMode>('light')

  useEffect(() => {
    const initial = getInitialMode()
    setTheme(initial)
    applyThemeMode(initial)
  }, [])

  const toggleTheme = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'

    if (!document.startViewTransition) {
      setTheme(newTheme)
      applyThemeMode(newTheme)
      window.localStorage.setItem('theme', newTheme)
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = document.startViewTransition(() => {
      setTheme(newTheme)
      applyThemeMode(newTheme)
      window.localStorage.setItem('theme', newTheme)
    })

    await transition.ready

    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]

    document.documentElement.animate(
      {
        clipPath: theme === 'dark' ? [...clipPath].reverse() : clipPath,
      },
      {
        duration: 400,
        easing: 'ease-in-out',
        pseudoElement:
          theme === 'dark'
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
      },
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex size-10 items-center justify-center rounded-full bg-transparent text-(--sea-ink) transition-transform active:scale-95 dark:text-white"
    >
      <div className="relative size-6">
        <Sun className="absolute inset-0 size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}