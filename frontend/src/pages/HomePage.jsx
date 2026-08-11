import { Link, Navigate } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function HomePage() {
  if (localStorage.getItem('token')) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <div className="h-screen h-dvh bg-background font-sans selection:bg-primary selection:text-surface overflow-hidden flex flex-col justify-between">
      {/* Navigation (Landing Page specific) */}
      <nav className="flex items-center justify-between px-6 py-4 sm:py-6 max-w-[1200px] w-full mx-auto shrink-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">CoBuild</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="btn-ghost hidden sm:block">Sign In</Link>
          <Link to="/register" className="btn-primary font-semibold">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-[1200px] w-full mx-auto -mt-6 sm:-mt-10">
        {/* Background glow effects (Glassmorphism inspired) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[400px] md:h-[600px] bg-tertiary/10 rounded-full blur-[100px] -z-10 animate-fade-in pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-primary/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.03em] leading-[1.1] text-primary max-w-5xl animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          Build the next big thing, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">together.</span>
        </h1>
        
        <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-text-muted max-w-2xl animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          Stop building in isolation. Find co-founders, join ambitious projects, and turn your side hustles into startups with the developer network designed for action.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <Link to="/register" className="btn-primary btn-lg flex items-center justify-center group px-8 rounded-md text-[16px] font-semibold">
            Start Building for Free
          </Link>
        </div>
      </section>

      {/* Bottom spacer for centering balance */}
      <div className="h-4 sm:h-8 shrink-0 pointer-events-none" />
    </div>
  );
}


