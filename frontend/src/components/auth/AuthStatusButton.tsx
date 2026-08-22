import React, { useState, useRef, useEffect } from "react";
import {
  User as UserIcon,
  LogOut,
  LogIn,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../store/useAuth";
import { useCloudSync } from "../../store/useCloudSync";

export const AuthStatusButton: React.FC = () => {
  const { user, isAuthenticated, isLoading, loginWithGoogle, logout } = useAuth();
  const { status: syncStatus, syncNow } = useCloudSync();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      window.addEventListener("click", handleOutsideClick);
    }
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [dropdownOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-stone-900/60 border border-stone-800/80 text-xs text-stone-400">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-500" />
        <span>Checking...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={loginWithGoogle}
        className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 hover:border-emerald-500/60 text-xs font-medium text-emerald-300 hover:text-emerald-200 transition-all duration-200 shadow-sm hover:shadow-emerald-950/40"
        title="Sign in with Google to sync your saved places and trips across devices"
      >
        <LogIn className="w-3.5 h-3.5 text-emerald-400" />
        <span>Sign In</span>
      </button>
    );
  }

  const getSyncIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />;
      case "synced":
        return <Cloud className="w-3.5 h-3.5 text-emerald-400" />;
      case "offline":
        return <CloudOff className="w-3.5 h-3.5 text-stone-400" />;
      case "pending":
        return <Cloud className="w-3.5 h-3.5 text-amber-400" />;
      case "error":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Cloud className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  const getSyncLabel = () => {
    switch (syncStatus) {
      case "syncing":
        return "Syncing…";
      case "synced":
        return "Synced";
      case "offline":
        return "Offline — saved locally";
      case "pending":
        return "Sync pending";
      case "error":
        return "Sync failed (saved locally)";
      default:
        return "Cloud Sync Ready";
    }
  };

  const displayName = user.display_name || user.name || user.email.split("@")[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen((prev) => !prev);
        }}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800/90 border border-stone-800/90 hover:border-stone-700 text-xs font-medium text-stone-200 transition-all shadow-sm"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={displayName}
            className="w-5 h-5 rounded-full object-cover border border-stone-700"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-300 font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-w-[100px] truncate hidden sm:inline">{displayName}</span>
        <span className="opacity-80">{getSyncIcon()}</span>
        <ChevronDown className="w-3 h-3 text-stone-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-stone-950/95 border border-stone-800 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 border-b border-stone-800/80">
            <p className="text-xs font-semibold text-stone-200 truncate">{user.name || displayName}</p>
            <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
          </div>

          <div className="px-4 py-2.5 border-b border-stone-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-stone-300">
              {getSyncIcon()}
              <span className="text-[11px]">{getSyncLabel()}</span>
            </div>
            <button
              onClick={() => {
                syncNow();
              }}
              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/50 hover:bg-emerald-900/50 transition-colors"
            >
              Sync Now
            </button>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
