import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface LoginPageProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigateTo }) => {
  const { isRTL } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.message || 'Failed to login with Google');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error(isRTL ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
      navigateTo(Page.DASHBOARD);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.message || (isRTL ? 'فشل تسجيل الدخول' : 'Failed to login'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error('Please enter a phone number');

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      if (error) throw error;
      setOtpSent(true);
      toast.success('OTP sent! Check your phone.');
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');

    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      toast.success('Login successful!');
      navigateTo(Page.DASHBOARD);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-zinc-900 border border-gold-500/30 rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold-500 mb-2">Gatekeeper</h1>
          <p className="text-zinc-400">Identify yourself to proceed.</p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-4 rounded-md hover:bg-zinc-200 transition-colors mb-6"
        >
          {loading ? 'Processing...' : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-zinc-500">{isRTL ? 'أو عبر البريد الإلكتروني' : 'Or with email'}</span>
          </div>
        </div>

        {/* Email Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">{isRTL ? 'كلمة المرور' : 'Password'}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-gold-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-md transition-colors border border-zinc-700"
          >
            {loading ? (isRTL ? 'جاري التحقق...' : 'Logging in...') : (isRTL ? 'تسجيل الدخول' : 'Login')}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-zinc-500">{isRTL ? 'أو عبر الهاتف' : 'Or with phone'}</span>
          </div>
        </div>

        {/* Phone Login */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-gold-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-transparent border border-gold-500 text-gold-500 font-semibold py-2 px-4 rounded-md hover:bg-gold-500/10 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Code via SMS'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Enter OTP</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-gold-500 focus:outline-none tracking-widest text-center text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-black font-bold py-2 px-4 rounded-md hover:bg-gold-400 transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-sm text-zinc-500 hover:text-zinc-300 mt-2"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
