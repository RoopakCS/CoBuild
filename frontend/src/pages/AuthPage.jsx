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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 sm:p-6 font-sans text-slate-100 relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-900/60 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10 animate-fade-in">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <span className="text-3xl font-extrabold tracking-tight text-slate-100 font-display">CoBuild</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 font-display">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            {isLogin ? 'Enter your credentials to access your workspace.' : 'Sign up to start discovering and building together.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold tracking-wider uppercase text-slate-300">Name</label>
              <input 
                type="text" 
                required
                className="w-full rounded-2xl bg-slate-950/70 border border-slate-800 px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold tracking-wider uppercase text-slate-300">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full rounded-2xl bg-slate-950/70 border border-slate-800 px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold tracking-wider uppercase text-slate-300">Password</label>
            <input 
              type="password" 
              required
              minLength={8}
              className="w-full rounded-2xl bg-slate-950/70 border border-slate-800 px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-xs font-bold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-3.5 text-sm font-bold transition-all duration-200 shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <Link 
            to={isLogin ? '/register' : '/login'}
            className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-blue-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}
