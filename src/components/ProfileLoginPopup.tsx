import React from 'react';
import { LogIn, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './Button';

interface ProfileLoginPopupProps {
  onClose: () => void;
}

export const ProfileLoginPopup: React.FC<ProfileLoginPopupProps> = ({ onClose }) => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    onClose();
  };

  return (
    <div className="w-72">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gcal-blue to-purple-500 flex items-center justify-center">
          <LogIn size={32} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gcal-text mb-1">Welcome Back!</h3>
        <p className="text-sm text-gcal-muted">Sign in to sync your habits</p>
      </div>

      <div className="space-y-3">
        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full px-4 py-3 gap-3 transition-all duration-200 bg-gcal-surface-solid border border-gcal-border rounded-2xl text-gcal-text hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gcal-blue"
        >
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
          <span className="font-medium">Continue with Google</span>
        </button>

        {/* Email Login - Placeholder for future implementation */}
        <button
          disabled
          className="flex items-center justify-center w-full px-4 py-3 gap-3 transition-all duration-200 bg-gcal-surface/50 border border-gcal-border rounded-2xl text-gcal-muted cursor-not-allowed opacity-50"
          title="Email login coming soon"
        >
          <Mail size={20} />
          <span className="font-medium">Continue with Email</span>
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gcal-border">
        <p className="text-xs text-center text-gcal-muted">
          Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  );
};
