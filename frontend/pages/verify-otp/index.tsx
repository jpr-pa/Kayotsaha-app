import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { verifyOtp, resendOtp } from '@/lib/api';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(30); // Cooldown in seconds

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await verifyOtp({ otp });
      setSuccess('OTP verified successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Try again.');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResendSuccess('');
    try {
      await resendOtp();
      setResendSuccess('OTP resent successfully.');
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">Verify OTP</h1>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center mb-3">{success}</p>}
        {resendSuccess && <p className="text-green-500 text-sm text-center mb-3">{resendSuccess}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Verify OTP
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            className={`text-indigo-600 text-sm underline disabled:text-gray-400`}
            onClick={handleResendOtp}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}