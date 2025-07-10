'use client';
import React from 'react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import AuthErrorDisplay from './AuthErrorDisplay';
import { validateEmail, validatePassword, calculatePasswordStrength } from '../lib/validation';
import Spinner from './ui/Spinner';

export default function SignUpForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError(undefined);
    setPasswordError(undefined);

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message);
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await signUp(email, password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
    } else if (data?.user?.confirmation_sent_at) {
      setVerificationSent(true);
      setEmail('');
      setPassword('');
      setPasswordStrength(0);
    }
  };

  return (
    <div className="max-w-md w-full p-6 sm:p-8 space-y-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-900">
        Create a new account
      </h2>
      {error && <AuthErrorDisplay error={error} />}
      {verificationSent ? (
        <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded">
          <p>A verification email has been sent to your email address.</p>
          <p className="mt-2">
            Please check your inbox and click the link to verify your
            account.
          </p>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={loading}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                const validation = validateEmail(e.target.value);
                setEmailError(validation.valid ? undefined : validation.message);
              }}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={loading}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                const validation = validatePassword(e.target.value);
                setPasswordError(validation.valid ? undefined : validation.message);
                setPasswordStrength(calculatePasswordStrength(e.target.value));
              }}
              minLength={8}
            />
            <div className="mt-2 flex gap-1 h-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    passwordStrength >= i
                      ? passwordStrength >= 4
                        ? 'bg-green-500'
                        : passwordStrength >= 2
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Signing up...
              </span>
            ) : (
              'Sign up'
            )}
          </button>
        </form>
      )}
    </div>
  );
}