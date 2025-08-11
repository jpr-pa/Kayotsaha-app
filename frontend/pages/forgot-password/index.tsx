import { useState } from 'react';
import { useRouter } from 'next/router';
import { requestPasswordResetOtp } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await requestPasswordResetOtp({ identifier });
      setSuccess('OTP sent! Redirecting to verification page...');
      localStorage.setItem('reset_identifier', identifier);
      setTimeout(() => router.push('/forgot-password/verify'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-blue-100">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">Forgot Password</h1>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center mb-3">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
              Email or Mobile Number
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your registered email or mobile"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}