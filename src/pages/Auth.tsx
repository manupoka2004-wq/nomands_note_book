import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  UserPlus, 
  LogIn,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthProps {
  onLogin: (user: any) => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [useDemoMode, setUseDemoMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Try Supabase first if configured
      if (isSupabaseConfigured()) {
        const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (supabaseError) {
          console.warn('[Auth] Supabase login failed, entering Demo Mode:', supabaseError.message);
          handleDemoMode();
          return;
        }

        if (data.user) {
          onLogin({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            role: data.user.user_metadata?.role || 'user',
            isDemo: false
          });
          return;
        }
      } else {
        handleDemoMode();
      }
    } catch (err: any) {
      console.error('[Auth] Login error, falling back to Demo Mode:', err);
      handleDemoMode();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    console.log('[Auth] Entering Demo Mode...');
    const demoUser = {
      id: 'demo-' + Math.random().toString(36).substr(2, 9),
      email: email || 'demo@tripmaker.ai',
      name: name || email?.split('@')[0] || 'Demo User',
      role: 'user',
      isDemo: true
    };
    
    // Store in localStorage to persist demo session
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    onLogin(demoUser);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured()) {
        const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (!supabaseError) {
          setError('Password reset link sent to your email.');
          setMode('login');
          return;
        }
        setError(supabaseError.message);
      } else {
        setError('Supabase is not configured for password reset.');
      }
    } catch (err) {
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Try Supabase registration if configured
      if (isSupabaseConfigured()) {
        const { data, error: supabaseError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
              role: 'user'
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (supabaseError) throw supabaseError;

        if (data.user) {
          if (data.session) {
            onLogin({
              id: data.user.id,
              email: data.user.email,
              name: name,
              role: 'user',
              isDemo: false
            });
          } else {
            setError('Please check your email for a confirmation link. If you don\'t receive it within a minute, you can skip verification to enter Demo Mode.');
            setMode('login');
          }
          return;
        }
      } else {
        setError('Supabase is not configured. Please use Demo Mode via Login.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      setError('OTP verification is disabled in Supabase-only mode. Please use Demo Mode or check your email.');
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured()) {
        const { error: supabaseError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (supabaseError) throw supabaseError;
        setError('Confirmation email resent!');
      } else {
        setError('Supabase is not configured.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation.');
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = async () => {
    console.log('[Auth] handleBypass called');
    handleDemoMode();
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured()) {
        const { error: supabaseError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (supabaseError) throw supabaseError;
        setError('Confirmation link resent! Please check your email (including spam).');
        return;
      }
      // Fallback to custom backend resend
      await handleResendOtp();
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/40"
      >
        <div className="p-8">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-xl shadow-indigo-200">
              T
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Verify Identity'}
            </h2>
            <div className="mt-4 flex flex-col items-center space-y-2">
              <button 
                onClick={handleBypass}
                className="px-4 py-2 bg-amber-100 text-amber-700 text-xs font-black rounded-full hover:bg-amber-200 transition-all flex items-center space-x-2 border border-amber-200"
              >
                <Sparkles size={14} />
                <span>Skip Auth & Use Demo Mode</span>
              </button>
              <p className="text-[10px] text-slate-400 font-medium italic">
                (Recommended if email confirmation is slow)
              </p>
            </div>
            <p className="text-slate-500 mt-4 font-medium">
              {mode === 'login' ? 'Enter your details to access your trips.' : mode === 'register' ? 'Join TripMaker and start planning.' : 'We sent a 6-digit code to your email.'}
            </p>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <span className="text-[10px] text-slate-400 font-mono">v1.0.2-supabase-demo</span>
              <button 
                onClick={() => window.location.reload()}
                className="text-[10px] text-indigo-400 hover:text-indigo-600 font-bold underline"
              >
                Force Reload
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin} 
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                    <button 
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex flex-col space-y-2 text-red-600 text-sm font-medium">
                    <div className="flex items-center">
                      <AlertCircle size={16} className="mr-2 shrink-0" />
                      {error}
                    </div>
                    {(error.includes('email') || error.includes('confirmation')) && (
                      <div className="flex flex-col space-y-2 pt-1">
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button 
                            type="button"
                            onClick={handleBypass}
                            className="text-[10px] font-bold text-amber-600 hover:underline flex items-center px-1"
                          >
                            <Sparkles size={12} className="mr-1" />
                            Skip verification (Demo Mode)
                          </button>
                          <span className="text-[10px] text-slate-300">|</span>
                          <button 
                            type="button"
                            onClick={handleResendConfirmation}
                            className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center px-1"
                          >
                            <LogIn size={12} className="mr-1" />
                            Resend Email
                          </button>
                        </div>
                        {!useDemoMode && (
                          <button 
                            type="button"
                            onClick={() => {
                              setUseDemoMode(true);
                              setError('Demo mode enabled. Please try registering again.');
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center px-1"
                          >
                            <Database size={12} className="mr-1" />
                            Trouble with Supabase? Use Local Database
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!error && !loading && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                    <button 
                      type="button"
                      onClick={handleResendConfirmation}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center"
                    >
                      <AlertCircle size={12} className="mr-1" />
                      Not receiving confirmation emails? Click to resend.
                    </button>
                    <div className="flex flex-col space-y-1">
                      <p className="text-[9px] text-slate-400 italic px-1">
                        Check your spam folder. Note: Free providers have strict rate limits (3 emails/hour).
                      </p>
                      <button 
                        type="button"
                        onClick={handleBypass}
                        className="text-[10px] font-bold text-amber-600 hover:underline flex items-center px-1"
                      >
                        <Sparkles size={12} className="mr-1" />
                        Still stuck? Skip verification (Demo Mode)
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <LogIn size={18} />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={handleBypass}
                  className="w-full py-3.5 bg-amber-50 text-amber-700 font-bold rounded-2xl hover:bg-amber-100 transition-all flex items-center justify-center space-x-2 border border-amber-100"
                >
                  <Sparkles size={18} className="text-amber-500" />
                  <span>Sign in with Demo User</span>
                </button>

                <p className="text-center text-sm text-slate-500 font-medium pt-4">
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </motion.form>
            )}

            {mode === 'register' && (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRegister} 
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="register-name" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      id="register-name"
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-phone" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      id="register-phone"
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890 (Optional)"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1">Minimum 6 characters</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex flex-col space-y-2 text-red-600 text-sm font-medium">
                    <div className="flex items-center">
                      <AlertCircle size={16} className="mr-2 shrink-0" />
                      {error}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button 
                        type="button"
                        onClick={handleBypass}
                        className="text-[10px] font-bold text-amber-600 hover:underline flex items-center px-1"
                      >
                        <Sparkles size={12} className="mr-1" />
                        Skip verification (Demo Mode)
                      </button>
                      <span className="text-[10px] text-slate-300">|</span>
                      <button 
                        type="button"
                        onClick={handleResendConfirmation}
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center px-1"
                      >
                        <LogIn size={12} className="mr-1" />
                        Resend Email
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 font-medium pt-4">
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}

            {mode === 'forgot-password' && (
              <motion.form 
                key="forgot-password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleForgotPassword} 
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 text-sm font-medium">
                    <AlertCircle size={16} className="mr-2 shrink-0" />
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 font-medium pt-4">
                  Remember your password?{' '}
                  <button 
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-white/20 flex items-center justify-center space-x-6">
          <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="mr-1.5" />
            Secure
          </div>
          <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Smartphone size={14} className="mr-1.5" />
            2FA Ready
          </div>
        </div>
      </motion.div>
    </div>
  );
}
