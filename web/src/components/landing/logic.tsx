import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ZXCVBNFeedback } from 'zxcvbn';
import { authClient } from '#/lib/auth';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useAuthLogic() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailAvailability, setEmailAvailability] = useState<string | null>(
    null,
  );
  const [usernameAvailability, setUsernameAvailability] = useState<
    string | null
  >(null);
  const [isPending, setIsPending] = useState(false);

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null); // clear errors on toggle
  };

  async function signup() {
    if (isPending) return;

    await authClient.signUp.email(
      {
        email,
        password,
        name: username,
        callbackURL: '/verify-email',
      },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onSuccess: () => {
          setIsPending(false);
          sendVerificationCode();
        },
        onError: (ctx) => {
          // display the error message
          // if email is taken, setEmailAvailability(true)
          alert(ctx.error.message);
          setIsPending(false);
        },
      },
    );
  }

  async function sendVerificationCode() {
    await authClient.emailOtp.sendVerificationOtp({
      email: email,
      type: 'email-verification',
    });
  }

  async function signin() {
    if (isPending) return;

    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: '/app',
      },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onSuccess: () => {
          setIsPending(false);
        },
        onError: () => {
          setIsPending(false);
        },
      },
    );
  }

  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required';
    if (!email.includes('@')) return 'Enter a valid email address';

    if (mode === 'signup') {
      if (!username.trim()) return 'Username is required';
      if (username.trim().length < 3)
        return 'Username must be at least 3 characters';
      if (username.trim().length > 20)
        return 'Username must be at most 20 characters';
    }

    if (!password) return 'Password is required';
    if (!isPasswordStrong) return 'Password is not strong enough';

    if (mode === 'signup') {
      if (!confirmPassword) return 'Confirm your password';
      if (confirmPassword !== password) return 'Passwords do not match';
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (mode == 'signup') {
      signup();
    } else {
      signin();
    }
  };

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    feedback: ZXCVBNFeedback | null;
  }>({
    score: 0,
    label: '',
    feedback: null,
  });

  useEffect(() => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        label: '',
        feedback: null,
      });
      return;
    }

    const timer = setTimeout(async () => {
      const { default: zxcvbn } = await import('zxcvbn'); // heavy module

      const { score, feedback } = zxcvbn(password);

      const labels = ['Extremely weak', 'Very Weak', 'Weak', 'Okay', 'Strong'];

      setPasswordStrength({
        score,
        label: labels[score],
        feedback,
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [password]);

  const isPasswordStrong = passwordStrength.score >= 3;
  const passwordsMatch =
    mode !== 'signup' || !confirmPassword ? true : confirmPassword === password;

  const debouncedEmail = useDebounce(email, 500);
  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    if (mode !== 'signup' || !email) {
      setEmailAvailability(null);
      setIsCheckingEmail(false);
      return;
    }

    if (email !== debouncedEmail) {
      setIsCheckingEmail(true);
      return;
    }

    const trimmed = debouncedEmail.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed); // ai written regex. placeholder-only

    if (!isValidEmail) {
      setEmailAvailability('Enter a valid email to check availability.');
      setIsCheckingEmail(false);
      return;
    }

    const looksTaken =
      trimmed.endsWith('@taken.com') || trimmed.includes('taken@');
    setEmailAvailability(
      looksTaken ? 'Email appears taken.' : 'Email looks available.',
    );
    setIsCheckingEmail(false);
  }, [mode, email, debouncedEmail]);

  useEffect(() => {
    if (mode !== 'signup' || !username) {
      setUsernameAvailability(null);
      setIsCheckingUsername(false);
      return;
    }

    if (username !== debouncedUsername) {
      setIsCheckingUsername(true);
      return;
    }

    const trimmedUsername = debouncedUsername.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      setUsernameAvailability('Username must be at least 3 characters.');
      setIsCheckingUsername(false);
      return;
    }

    if (trimmedUsername.length > 20) {
      setUsernameAvailability('Username must be at most 20 characters.');
      setIsCheckingUsername(false);
      return;
    }

    const looksTaken = trimmedUsername.includes('taken');
    setUsernameAvailability(
      looksTaken ? 'Username appears taken.' : 'Username looks available.',
    );
    setIsCheckingUsername(false);
  }, [mode, username, debouncedUsername]);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

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
  };
}
