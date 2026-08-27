import React, { useEffect, useState } from 'react';
import type { StitchTab } from '../../components/stitch/StitchNavbar';
import { useAuth } from '../../store/useAuth';
import { useCloudSync } from '../../store/useCloudSync';

interface StitchSignInPageProps {
  onNavigate: (tab: StitchTab, params?: Record<string, string>) => void;
  nextTab?: StitchTab;
}

export const StitchSignInPage: React.FC<StitchSignInPageProps> = ({
  onNavigate,
  nextTab = 'discover',
}) => {
  const { user, isAuthenticated, isLoading, error, loginWithGoogle, logout } = useAuth();
  const { status: syncStatus, syncNow } = useCloudSync();
  const [oauthErrorMsg, setOauthErrorMsg] = useState<string | null>(null);

  // Check URL query parameters for OAuth error codes on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const authErr = params.get('auth_error');
      if (authErr) {
        if (authErr === 'access_denied') {
          setOauthErrorMsg('Google authentication was cancelled. You can sign in anytime.');
        } else if (authErr === 'authentication_failed') {
          setOauthErrorMsg('Authentication failed with Google. Please try again.');
        } else {
          setOauthErrorMsg(`Sign-in notice: ${authErr}`);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleReturn = () => {
    onNavigate(nextTab);
  };

  return (
    <div className="w-full pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Return to Explorer Back Button */}
      <div>
        <button
          onClick={handleReturn}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#70798B] hover:text-[#12161E] transition-colors cursor-pointer group"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
          <span>Back to Expedition Explorer</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-[#E5DFD5] rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm space-y-8">
        {/* Header Lockup */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#B87B22]/10 text-[#B87B22] px-3.5 py-1 rounded-full text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2F523E]"></span>
            <span>Traveler Profile &amp; Cloud Sync</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#12161E] tracking-tight">
            {isAuthenticated && user ? 'Your Traveler Profile' : 'Sign in to O-Travelz'}
          </h1>
          <p className="text-sm md:text-base font-body text-[#70798B] leading-relaxed">
            {isAuthenticated && user
              ? 'Your Google account is connected. Saved sanctuaries, custom circuits, and travel preferences are automatically synchronized across all your devices.'
              : 'Sign in with your Google account to seamlessly synchronize your custom multi-day circuits, saved sanctuaries, and personalized traveler preferences across all devices.'}
          </p>
        </div>

        {/* OAuth Error Feedback */}
        {(oauthErrorMsg || error) && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-body flex items-start gap-3 shadow-xs">
            <span className="material-symbols-outlined text-rose-600 text-base shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1">
              <strong className="block font-semibold">Sign-in Notice</strong>
              <span>{oauthErrorMsg || error}</span>
            </div>
            <button
              onClick={() => {
                setOauthErrorMsg(null);
              }}
              className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-3 border-[#B87B22] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-[#70798B]">Verifying authentication state...</p>
          </div>
        ) : isAuthenticated && user ? (
          /* ========================================================================= */
          /* AUTHENTICATED USER STATE                                                  */
          /* ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* User Profile Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 bg-[#FBF9F5] rounded-2xl border border-[#E5DFD5]">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name || user.name || 'User Avatar'}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E5DFD5] shadow-xs shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center font-display font-bold text-3xl border-2 border-[#B87B22]/20 shrink-0">
                  {user.display_name
                    ? user.display_name[0].toUpperCase()
                    : user.name
                    ? user.name[0].toUpperCase()
                    : 'U'}
                </div>
              )}

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-xl text-[#12161E]">
                    {user.display_name || user.name || 'Odisha Explorer'}
                  </h3>
                  <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-mono font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Active Session</span>
                  </span>
                </div>
                <p className="text-xs font-body text-[#70798B]">{user.email}</p>
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono text-[#3D4654]">
                  <span className="px-2.5 py-1 bg-white border border-[#E5DFD5] rounded-lg">
                    Provider: Google
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#E5DFD5] rounded-lg flex items-center gap-1">
                    <span>Sync:</span>
                    <span className="font-semibold text-emerald-700">
                      {syncStatus === 'syncing' ? 'Syncing...' : 'Connected'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sync Status & Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl space-y-1">
                <span className="text-[11px] font-mono text-[#70798B] uppercase">Saved Sanctuaries</span>
                <p className="text-sm font-semibold text-[#12161E] font-display">Cloud Synchronized</p>
              </div>
              <div className="p-4 bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl space-y-1">
                <span className="text-[11px] font-mono text-[#70798B] uppercase">Multi-Day Circuits</span>
                <p className="text-sm font-semibold text-[#12161E] font-display">Encrypted &amp; Stored</p>
              </div>
              <div className="p-4 bg-[#FBF9F5] border border-[#E5DFD5] rounded-xl space-y-1">
                <span className="text-[11px] font-mono text-[#70798B] uppercase">Security Standard</span>
                <p className="text-sm font-semibold text-[#12161E] font-display">PKCE S256 + HttpOnly</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => onNavigate('plan')}
                className="flex-1 py-3.5 px-6 bg-[#B87B22] hover:bg-[#A0691B] text-white font-body text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                <span>Open Trip Planner</span>
              </button>
              <button
                onClick={() => syncNow()}
                disabled={syncStatus === 'syncing'}
                className="py-3.5 px-6 bg-white hover:bg-[#F2EEE7] text-[#12161E] border border-[#E5DFD5] font-body text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-lg ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
              </button>
              <button
                onClick={logout}
                className="py-3.5 px-6 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-body text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* UNAUTHENTICATED SIGN-IN PROMPT                                            */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* Primary Google Sign-In Action */}
            <div className="max-w-md mx-auto space-y-4">
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3.5 bg-white hover:bg-[#F2EEE7] text-[#12161E] border-2 border-[#E5DFD5] hover:border-[#B87B22] p-4 rounded-2xl font-body text-base font-bold transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span className="material-symbols-outlined text-lg text-[#70798B] group-hover:text-[#12161E] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </button>

              <p className="text-[11px] font-mono text-center text-[#70798B]">
                Protected by Google OAuth 2.0 PKCE &amp; HttpOnly session tokens.
              </p>
            </div>

            {/* Value Proposition Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#E5DFD5]">
              <div className="p-5 bg-[#FBF9F5] border border-[#E5DFD5] rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#B87B22]/10 text-[#B87B22] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">cloud_sync</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#12161E]">Cloud Sync Across Devices</h4>
                <p className="text-xs font-body text-[#70798B] leading-relaxed">
                  Start crafting your expedition on desktop and access your exact itinerary and saved landmarks on mobile in the field.
                </p>
              </div>

              <div className="p-5 bg-[#FBF9F5] border border-[#E5DFD5] rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#2F523E]/10 text-[#2F523E] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">offline_pin</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#12161E]">Offline-First Resilience</h4>
                <p className="text-xs font-body text-[#70798B] leading-relaxed">
                  All cloud data syncs with your device cache, guaranteeing instant access even in remote highland sanctuary corridors.
                </p>
              </div>

              <div className="p-5 bg-[#FBF9F5] border border-[#E5DFD5] rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#1B5E6B]/10 text-[#1B5E6B] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">security</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#12161E]">Zero-Password Security</h4>
                <p className="text-xs font-body text-[#70798B] leading-relaxed">
                  Fast, frictionless 1-click Google authentication with cryptographic token hashing and zero credential tracking.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
