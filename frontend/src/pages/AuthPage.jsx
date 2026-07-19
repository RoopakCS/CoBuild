import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = isLogin 
        ? await authApi.login({ email: formData.email, password: formData.password })
        : await authApi.register(formData);
      
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans text-zinc-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <div className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {isLogin ? 'Enter your details to access your projects.' : 'Sign up to start collaborating.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Name</label>
              <input 
                type="text" 
                required
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Email</label>
            <input 
              type="email" 
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Password</label>
            <input 
              type="password" 
              required
              minLength={8}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to={isLogin ? '/register' : '/login'}
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}
