import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { 
  Terminal, EnvelopeSimple, Lock, Eye, EyeSlash, ArrowRight, 
  ShieldCheck, CheckCircle, Check, ArrowLeft, PencilSimple 
} from '@phosphor-icons/react';

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('pendingRegistration');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000 && parsed.formData) {
          return parsed.formData;
        }
      } catch (e) {}
    }
    return { name: '', email: '', password: '', confirmPassword: '' };
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration step: 1 = Details, 2 = Email Verification
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('pendingRegistration');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000 && parsed.step === 2) {
          return 2;
        }
      } catch (e) {}
    }
    return 1;
  });

  const [authCode, setAuthCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(() => {
    const saved = sessionStorage.getItem('pendingRegistration');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000 && parsed.generatedCode) {
          return parsed.generatedCode;
        }
      } catch (e) {}
    }
    return '';
  });

  const [resendCountdown, setResendCountdown] = useState(0);

  // Real-time password criteria
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSymbol = /[^A-Za-z0-9]/.test(formData.password);
  const isMatching = formData.password.length > 0 && formData.password === formData.confirmPassword;

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Redirect if logged in (must be placed after all Hooks!)
  if (localStorage.getItem('token')) {
    return <Navigate to="/discover" replace />;
  }

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasSymbol) {
      setError('Password must contain at least 8 characters, 1 uppercase letter, and 1 symbol');
      return;
    }
    if (!isMatching) {
      setError('Password is not same');
      return;
    }

    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    setGeneratedCode(code);
    setStep(2);
    setResendCountdown(60);

    // Save pending state to sessionStorage so reload stays on Step 2
    sessionStorage.setItem('pendingRegistration', JSON.stringify({
      formData,
      step: 2,
      generatedCode: code,
      timestamp: Date.now()
    }));

    try {
      // Dispatch verification code to user's email via Gmail SMTP
      await authApi.sendCode(formData.email, code);
    } catch (err) {
      console.warn('Background email delivery notice:', err.message);
      // If email is duplicate, return to Step 1 and show validation error
      if (err.response?.data?.message?.includes('already exists')) {
        setError(err.response.data.message);
        setStep(1);
        sessionStorage.removeItem('pendingRegistration');
      }
      // Network timeouts/502 Bad Gateway are treated as background exceptions without showing red error boxes
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authCode.trim() !== generatedCode) {
      setError('Invalid authentication code. Please check and try again.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      sessionStorage.removeItem('pendingRegistration');
      localStorage.setItem('token', data.token);
      navigate('/discover');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login({
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', data.token);
      navigate('/discover');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-10 py-3 bg-surface border border-border-subtle rounded-md body-md text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-dim selection:bg-primary selection:text-surface relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-[440px] animate-fade-in">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="headline-xl text-primary tracking-tight font-black">CoBuild</h1>
          <p className="body-md text-text-muted mt-1">Precision-built for developers.</p>
        </div>

        {/* Auth Card */}
        <div className="surface-1 rounded-2xl p-8 shadow-xl border border-border-subtle/60 backdrop-blur-sm">
          
          {/* Card Header & Stepper */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="headline-lg text-primary font-bold">
                {isLogin ? 'Welcome back' : (step === 1 ? 'Create account' : 'Verify Email')}
              </h2>

              {!isLogin && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-dim border border-border-subtle text-text-muted">
                  Step {step} of 2
                </span>
              )}
            </div>

            <p className="body-sm text-text-muted mt-1">
              {isLogin 
                ? 'Build your next team today.' 
                : (step === 1 ? 'Start discovering and building together.' : `Enter the 6-digit code sent to ${formData.email}`)}
            </p>

            {/* Stepper Progress Bar */}
            {!isLogin && (
              <div className="w-full bg-surface-dim h-1.5 rounded-full mt-4 overflow-hidden border border-border-subtle">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-out" 
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            )}
          </div>

          {/* LOGIN FORM */}
          {isLogin && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block label-mono text-text-muted uppercase text-xs font-semibold">Email Address</label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="email" 
                    required
                    className={inputClass}
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="name@company.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block label-mono text-text-muted uppercase text-xs font-semibold">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    className={inputClass}
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-error-container border border-error/20 p-3.5 rounded-lg">
                  <p className="body-sm font-semibold text-error">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-3.5 rounded-lg font-semibold flex items-center justify-center group disabled:opacity-50 shadow-md"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight size={18} weight="bold" className="ml-2 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}

          {/* REGISTER STEP 1: Details */}
          {!isLogin && step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <label className="block label-mono text-text-muted uppercase text-xs font-semibold">Name</label>
                <div className="relative">
                  <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="text" 
                    required
                    className={inputClass}
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block label-mono text-text-muted uppercase text-xs font-semibold">Email Address</label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="email" 
                    required
                    className={inputClass}
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="name@company.com"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block label-mono text-text-muted uppercase text-xs font-semibold">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    className={inputClass}
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block label-mono text-text-muted uppercase text-xs font-semibold">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className={inputClass}
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password strength checklist */}
              {formData.password.length > 0 && (
                <div className="bg-surface-dim border border-border-subtle p-3 rounded-lg text-xs space-y-1.5 animate-slide-up">
                  <p className="font-semibold text-text-muted uppercase text-[10px] tracking-wider mb-1">Password Requirements</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-success-green font-medium' : 'text-text-muted'}`}>
                      <Check size={14} className={hasMinLength ? 'text-success-green' : 'opacity-40'} />
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-success-green font-medium' : 'text-text-muted'}`}>
                      <Check size={14} className={hasUppercase ? 'text-success-green' : 'opacity-40'} />
                      <span>1 uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSymbol ? 'text-success-green font-medium' : 'text-text-muted'}`}>
                      <Check size={14} className={hasSymbol ? 'text-success-green' : 'opacity-40'} />
                      <span>1 symbol</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isMatching ? 'text-success-green font-medium' : 'text-text-muted'}`}>
                      <Check size={14} className={isMatching ? 'text-success-green' : 'opacity-40'} />
                      <span>Passwords match</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-error-container border border-error/20 p-3.5 rounded-lg">
                  <p className="body-sm font-semibold text-error">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-3.5 rounded-lg font-semibold flex items-center justify-center group disabled:opacity-50 shadow-md mt-2"
              >
                <span>{loading ? 'Sending Verification Code...' : 'Continue to Verification'}</span>
                {!loading && <ArrowRight size={18} weight="bold" className="ml-2 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}

          {/* REGISTER STEP 2: Email Authentication Code */}
          {!isLogin && step === 2 && (
            <form onSubmit={handleVerifyAndSubmit} className="space-y-5 animate-slide-up">
              
              {/* Email Badge display with edit button */}
              <div className="flex items-center justify-between bg-surface-dim border border-border-subtle px-3.5 py-2.5 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <EnvelopeSimple className="text-primary shrink-0" size={18} />
                  <span className="body-sm font-semibold text-primary truncate">{formData.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); sessionStorage.removeItem('pendingRegistration'); }}
                  className="text-xs text-text-muted hover:text-primary flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-surface transition-colors shrink-0"
                >
                  <PencilSimple size={14} />
                  <span>Edit</span>
                </button>
              </div>

              {/* Compact Email Sent Confirmation Card */}
              <div className="bg-surface-dim border border-border-subtle p-3 rounded-lg flex items-center gap-3 animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <EnvelopeSimple size={15} weight="bold" />
                </div>
                <div className="text-left space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs font-semibold text-primary">Code Sent</p>
                  <p className="text-[11px] text-text-muted leading-tight truncate">
                    Sent to <span className="font-semibold text-primary">{formData.email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="block label-mono text-text-muted uppercase text-xs font-semibold">Enter 6-Digit Code</label>
                  <button 
                    type="button"
                    disabled={resendCountdown > 0}
                    onClick={handleSendCode}
                    className="text-xs text-primary font-semibold hover:underline disabled:opacity-50"
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                  </button>
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={20} />
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    autoFocus
                    className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border-subtle rounded-lg font-mono text-xl font-bold text-center tracking-[0.4em] text-primary placeholder:text-text-muted/40 placeholder:tracking-normal focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    value={authCode} 
                    onChange={e => setAuthCode(e.target.value.replace(/\D/g, ''))} 
                    placeholder="123456"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-error-container border border-error/20 p-3.5 rounded-lg">
                  <p className="body-sm font-semibold text-error">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || authCode.length < 6}
                className="w-full btn-primary py-3.5 rounded-lg font-semibold flex items-center justify-center group disabled:opacity-50 shadow-md"
              >
                {loading ? 'Verifying & Registering...' : 'Verify & Create Account'}
                {!loading && <CheckCircle size={18} weight="bold" className="ml-2" />}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); sessionStorage.removeItem('pendingRegistration'); }}
                className="w-full btn-ghost py-2.5 text-xs font-semibold text-text-muted hover:text-primary flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Account Info</span>
              </button>
            </form>
          )}

        </div>

        {/* Secondary Action */}
        <p className="text-center mt-8 body-sm text-text-muted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link 
            to={isLogin ? '/register' : '/login'}
            className="text-primary font-bold hover:underline"
            onClick={() => {
              setError('');
              setStep(1);
              setAuthCode('');
            }}
          >
            {isLogin ? 'Register' : 'Sign In'}
          </Link>
        </p>
      </main>
    </div>
  );
}


