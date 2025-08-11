import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await loginUser(formData);
      localStorage.setItem('token', res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-green-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Login to Kayotsaha</h1>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-indigo-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
