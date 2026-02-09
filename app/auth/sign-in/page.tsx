'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    const supabase = createClient();
    if (!supabase) {
      setStatus('error');
      setErrorMessage('Auth is not configured');
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B3D2E] relative overflow-hidden">
      {/* Felt texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col p-6 max-w-lg mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href={next !== '/' ? next : '/'}
            className="text-[#E5B94A] text-sm font-body px-2 py-2 -mx-2 -my-2 rounded-lg hover:bg-[#E5B94A]/10 active:bg-[#E5B94A]/20 transition-colors"
          >
            ← Back
          </Link>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Card suit decorations */}
          <div className="flex gap-3 mb-6 text-2xl opacity-40">
            <span className="text-[#C41E3A]">♥</span>
            <span className="text-[#F4D68C]">♠</span>
            <span className="text-[#C41E3A]">♦</span>
            <span className="text-[#F4D68C]">♣</span>
          </div>

          <h1 className="text-[#F4D68C] text-2xl font-display font-bold mb-2 text-center">
            Sign In
          </h1>
          <p className="text-[#F5F0E1]/60 text-sm font-body mb-8 text-center">
            Enter your email to save and share your games
          </p>

          {error === 'auth' && status === 'idle' && (
            <div className="w-full rounded-xl p-3 mb-4 text-center text-sm font-body text-[#C41E3A] bg-[#C41E3A]/10 border border-[#C41E3A]/20">
              Something went wrong. Please try again.
            </div>
          )}

          {status === 'sent' ? (
            <div
              className="w-full rounded-2xl p-6 text-center animate-card-enter"
              style={{
                background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="text-[#10B981] text-lg font-display font-bold mb-2">
                Check your email
              </h2>
              <p className="text-[#F5F0E1]/70 text-sm font-body mb-4">
                We sent a magic link to <span className="text-[#F4D68C]">{email}</span>
              </p>
              <p className="text-[#F5F0E1]/50 text-xs font-body">
                Click the link in the email to sign in. You can close this page.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                  border: '2px solid rgba(229, 185, 74, 0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
              >
                <label htmlFor="email" className="block text-[#F4D68C]/80 text-sm font-body mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#0B3D2E] border-2 border-[#C9972D]/30 text-[#F5F0E1] placeholder:text-[#F5F0E1]/30 font-body focus:outline-none focus:border-[#E5B94A] transition-colors"
                />
              </div>

              {status === 'error' && (
                <p className="text-[#C41E3A] text-sm font-body text-center">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] hover:brightness-110 text-[#1A1A1A] tracking-wide font-body disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 50%, #C9972D 100%)',
                  boxShadow: '0 4px 0 #8B6914, 0 6px 12px rgba(0,0,0,0.3)',
                }}
              >
                {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          )}

          {/* Footer decoration */}
          <div className="flex gap-3 mt-8 text-lg opacity-20">
            <span className="text-[#F4D68C]">♣</span>
            <span className="text-[#C41E3A]">♦</span>
            <span className="text-[#F4D68C]">♠</span>
            <span className="text-[#C41E3A]">♥</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
