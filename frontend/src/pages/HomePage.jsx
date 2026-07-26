import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Code, Users, Rocket, TerminalWindow } from '@phosphor-icons/react';

export function HomePage() {
  if (localStorage.getItem('token')) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-surface overflow-x-hidden">
      {/* Navigation (Landing Page specific) */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-[1200px] mx-auto relative z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">CoBuild</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-ghost hidden sm:block">Sign In</Link>
          <Link to="/register" className="btn-primary font-semibold">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto flex flex-col items-center text-center mt-12 md:mt-20">
        {/* Background glow effects (Glassmorphism inspired) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-tertiary/10 rounded-full blur-[100px] -z-10 animate-fade-in" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -z-10" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border-subtle mb-8 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
          <span className="label-mono text-primary font-semibold">CoBuild 2.0 is now live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[1.05] text-primary max-w-5xl animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          Build the next big thing, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">together.</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-text-muted max-w-2xl animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          Stop building in isolation. Find co-founders, join ambitious projects, and turn your side hustles into startups with the developer network designed for action.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <Link to="/register" className="btn-primary btn-lg flex items-center justify-center group h-14 px-8 rounded-lg text-[16px] font-semibold">
            Start Building for Free
            <ArrowRight size={20} weight="bold" className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/discover" className="btn-secondary btn-lg flex items-center justify-center h-14 px-8 rounded-lg text-[16px] font-semibold bg-surface hover:bg-surface-dim">
            Explore Projects
          </Link>
        </div>
        
        {/* Hero Image/Mockup */}
        <div className="mt-20 w-full relative animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="surface-2 rounded-xl p-2 md:p-3 aspect-[16/9] w-full max-w-5xl mx-auto ring-1 ring-border-subtle bg-surface-dim overflow-hidden flex shadow-2xl relative">
            {/* Minimal App Mockup UI */}
            <div className="w-64 border-r border-border-subtle hidden md:flex flex-col gap-4 p-4 bg-surface rounded-l-lg z-0">
               <div className="h-8 w-3/4 bg-surface-dim rounded-md border border-border-subtle" />
               <div className="h-4 w-1/2 bg-surface-dim rounded border border-border-subtle mt-4" />
               <div className="h-4 w-2/3 bg-surface-dim rounded border border-border-subtle" />
               <div className="h-4 w-full bg-surface-dim rounded border border-border-subtle" />
            </div>
            <div className="flex-1 p-6 flex flex-col gap-6 bg-background rounded-r-lg z-0">
               {/* Search/Header mockup */}
               <div className="flex gap-4 items-center">
                 <div className="h-10 flex-1 bg-surface rounded-md border border-border-subtle shadow-sm" />
                 <div className="h-10 w-24 bg-primary/20 rounded-md border border-primary/30" />
               </div>
               {/* Grid mockup */}
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                 <div className="h-40 bg-surface rounded-lg border border-border-subtle shadow-sm" />
                 <div className="h-40 bg-surface rounded-lg border border-border-subtle shadow-sm" />
                 <div className="h-40 bg-surface rounded-lg border border-border-subtle shadow-sm hidden lg:block" />
               </div>
               <div className="h-full w-full bg-surface rounded-lg border border-border-subtle shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Props (Bento-ish Grid) */}
      <section className="py-24 px-4 sm:px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Everything you need to ship.</h2>
          <p className="mt-4 text-text-muted body-lg">Purpose-built tools to find your team and build faster.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Users size={28} className="text-tertiary" weight="fill" />,
              title: "Find Co-Founders",
              desc: "Match with developers and designers who complement your skill set."
            },
            {
              icon: <Code size={28} className="text-tertiary" weight="fill" />,
              title: "Discover Projects",
              desc: "Browse through hundreds of open projects looking for contributors like you."
            },
            {
              icon: <Rocket size={28} className="text-tertiary" weight="fill" />,
              title: "Launch Faster",
              desc: "Collaborate effortlessly and take your project from idea to production."
            }
          ].map((feature, i) => (
            <div key={i} className="surface-1 rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300 group">
              <div className="w-12 h-12 bg-surface-dim rounded-xl flex items-center justify-center mb-6 border border-border-subtle group-hover:border-tertiary/30 transition-colors">
                {feature.icon}
              </div>
              <h3 className="headline-lg mb-3">{feature.title}</h3>
              <p className="body-md text-text-muted leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto bg-primary text-surface rounded-[2rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative blur inside CTA */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-tertiary blur-[120px] opacity-40 rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary blur-[120px] opacity-20 rounded-full" />
          
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 relative z-10">Ready to build?</h2>
          <p className="text-surface/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 relative z-10">
            Join thousands of developers turning their ideas into reality. Your next great project is waiting.
          </p>
          <div className="relative z-10 flex justify-center">
            <Link to="/register" className="bg-surface text-primary font-bold px-8 py-4 rounded-lg flex items-center hover:bg-surface-dim hover:scale-105 transition-all group shadow-lg">
              Get Started for Free
              <ArrowRight size={20} weight="bold" className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 text-center text-text-muted body-sm">
        <p>© {new Date().getFullYear()} CoBuild. All rights reserved.</p>
      </footer>
    </div>
  );
}
