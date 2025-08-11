import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { resetForgotPassword } from '@/lib/api';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [strength, setStrength] = useState('');
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('reset_identifier');
    if (!id) router.push('/forgot-password');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await resetForgotPassword({ newPassword });
      setSuccess('Password reset successful! Redirecting to login...');
      localStorage.removeItem('reset_identifier');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Reset failed. Try again.');
    }
  };

  const evaluateStrength = (password: string) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /\d/.test(password) && /[\W_]/.test(password)) return 'Strong';
    return 'Moderate';
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setStrength(evaluateStrength(value));
  };

  const strengthColor = {
    Weak: 'text-red-500',
    Moderate: 'text-yellow-500',
    Strong: 'text-green-600',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-indigo-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">Reset Your Password</h1>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center mb-3">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            {newPassword && (
              <p className={`text-xs mt-1 ${strengthColor[strength]}`}>
                Password strength: {strength}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}