import { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await api.post(url, { email, password });
      // Expect: { token, user }
      login(res.data);
      window.location.href = '/questions';
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Auth failed');
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <div className="w-full max-w-md rounded-xl border p-6">
        <h1 className="text-xl font-semibold mb-4">
          {mode === 'login' ? 'Login' : 'Create an account'}
        </h1>

        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            className="border rounded-md px-3 py-2"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <input
            className="border rounded-md px-3 py-2"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <button className="bg-black text-white rounded-md px-4 py-2">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          className="mt-3 text-sm underline"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
}
