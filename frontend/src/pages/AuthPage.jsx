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
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 font-sans text-slate-50 selection:bg-green-500/30 selection:text-green-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/50 bg-slate-800/40 p-10 shadow-2xl backdrop-blur-md">
        <div className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 mb-6 shadow-lg shadow-green-500/20">
            <span className="text-xl font-bold text-slate-900">CB</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-3 text-sm text-slate-400 font-medium">
            {isLogin ? 'Enter your details to access your projects.' : 'Sign up to start collaborating.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-slate-300">Name</label>
              <input 
                type="text" 
                required
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-300">Email</label>
            <input 
              type="email" 
              required
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-300">Password</label>
            <input 
              type="password" 
              required
              minLength={8}
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-sm font-bold text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none focus:outline-none focus:ring-4 focus:ring-green-500/30"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
          <Link 
            to={isLogin ? '/register' : '/login'}
            className="text-sm font-medium text-slate-400 hover:text-green-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}
