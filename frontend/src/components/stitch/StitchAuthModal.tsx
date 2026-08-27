import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { buildApiUrl } from '../../api/config';
import type { UserResponse } from '../../types/api';

interface StitchAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: UserResponse) => void;
  onLogoutSuccess?: () => void;
}

export const StitchAuthModal: React.FC<StitchAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onLogoutSuccess,
}) => {
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check current session on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const checkSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await apiClient.getCurrentUser();
        if (isMounted && user) {
          setCurrentUser(user);
          if (onLoginSuccess) onLoginSuccess(user);
        }
      } catch (err) {
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSession();
    return () => { isMounted = false; };
  }, [isOpen, onLoginSuccess]);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth 2.0 PKCE flow, respecting cross-domain API URL
    window.location.href = buildApiUrl("/auth/google/start");
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiClient.logout();
      setCurrentUser(null);
      if (onLogoutSuccess) onLogoutSuccess();
    } catch (err) {
      console.warn('Logout note:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-[#FBF9F5] border border-[#E5DFD5] rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#B87B22] font-semibold">
              Traveler Profile &amp; Cloud Sync
            </span>
            <h3 className="text-2xl font-display font-bold text-[#12161E] mt-0.5">
              {currentUser ? 'Your Account' : 'Sign in to O-Travelz'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#70798B] hover:text-[#12161E] p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-[#A84825]/10 border border-[#A84825]/30 text-[#A84825] text-xs p-3 rounded-lg mb-4 font-mono">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#70798B]">
            Synchronizing authentication state...
          </div>
        ) : currentUser ? (
          /* Authenticated User Profile View */
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E5DFD5] shadow-xs">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.display_name || 'User Avatar'}
                  className="w-14 h-14 rounded-full object-cover border border-[#E5DFD5]"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center font-display font-bold text-xl border border-[#B87B22]/20">
                  {currentUser.display_name ? currentUser.display_name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <h4 className="font-display font-bold text-base text-[#12161E] truncate">
                  {currentUser.display_name || 'Odisha Explorer'}
                </h4>
                <p className="font-body text-xs text-[#70798B] truncate">
                  {currentUser.email}
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2F523E] mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F523E]"></span>
                  <span>Google Cloud Connected</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5DFD5] rounded-xl p-4 space-y-2.5 text-xs font-body text-[#3D4654]">
              <div className="flex justify-between items-center py-1 border-b border-[#E5DFD5]/60">
                <span className="text-[#70798B]">Saved Journeys Sync</span>
                <span className="font-mono text-[#2F523E] font-semibold">Active &amp; Encrypted</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E5DFD5]/60">
                <span className="text-[#70798B]">Cross-Device Trips</span>
                <span className="font-mono text-[#12161E] font-semibold">Automatic</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#70798B]">Account Type</span>
                <span className="font-mono text-[#12161E]">Verified Traveler</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-white border border-[#E5DFD5] hover:bg-[#F2EEE7] text-[#A84825] font-body text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Unauthenticated Login Prompt */
          <div className="space-y-6">
            <p className="font-body text-xs md:text-sm text-[#3D4654] leading-relaxed">
              Sign in with your Google account to sync your saved circuits, custom itineraries, and personal traveler preferences securely across all your devices.
            </p>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] p-3.5 rounded-xl font-body text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="pt-2 border-t border-[#E5DFD5] text-center">
              <span className="text-[11px] font-mono text-[#70798B]">
                Protected by Google OAuth 2.0 PKCE &amp; HttpOnly session tokens.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
