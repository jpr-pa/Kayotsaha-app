import { useState } from 'react';
import { useRouter } from 'next/router';
import { registerUser } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
      setPasswordMatch(value === formData.confirmPassword);
    }

    if (name === 'confirmPassword') {
      setPasswordMatch(formData.password === value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordMatch) {
      setError('Passwords do not match');
      return;
    }

    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });

      setSuccess('Registration successful! Redirecting to OTP verification...');
      setTimeout(() => router.push('/verify-otp'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return 'Weak';
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[\W_]/.test(password))
      return 'Strong';
    if (password.length >= 8) return 'Moderate';
    return 'Weak';
  };

  const strengthColor = {
    Weak: 'text-red-500',
    Moderate: 'text-yellow-500',
    Strong: 'text-green-600',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-indigo-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">Create your Kayotsaha Account</h1>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              pattern="[0-9]{10}"
              required
              value={formData.mobile}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="10-digit mobile number"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            {formData.password && (
              <p className={`text-xs mt-1 ${strengthColor[passwordStrength]}`}>
                Password strength: {passwordStrength}
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
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            {!passwordMatch && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-green-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}