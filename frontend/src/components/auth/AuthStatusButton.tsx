import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  LogIn,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../store/useAuth";
import { useCloudSync } from "../../store/useCloudSync";

interface AuthStatusButtonProps {
  onOpenAuth?: () => void;
}

export const AuthStatusButton: React.FC<AuthStatusButtonProps> = ({ onOpenAuth }) => {
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
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] text-xs text-[#70798B]">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B87B22]" />
        <span>Checking...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const handleSignIn = () => {
      if (onOpenAuth) {
        onOpenAuth();
      } else {
        loginWithGoogle();
      }
    };

    return (
      <button
        onClick={handleSignIn}
        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#12161E] hover:bg-[#263244] text-white text-xs font-semibold transition-all duration-150 shadow-xs cursor-pointer"
        title="Sign in with Google to sync your saved places and trips across devices"
      >
        <LogIn className="w-3.5 h-3.5 text-[#B87B22]" />
        <span>Sign In</span>
      </button>
    );
  }

  const getSyncIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B87B22]" />;
      case "synced":
        return <Cloud className="w-3.5 h-3.5 text-[#2F523E]" />;
      case "offline":
        return <CloudOff className="w-3.5 h-3.5 text-[#70798B]" />;
      case "pending":
        return <Cloud className="w-3.5 h-3.5 text-[#B87B22]" />;
      case "error":
        return <AlertCircle className="w-3.5 h-3.5 text-[#A84825]" />;
      default:
        return <Cloud className="w-3.5 h-3.5 text-[#70798B]" />;
    }
  };

  const getSyncLabel = () => {
    switch (syncStatus) {
      case "syncing":
        return "Syncing…";
      case "synced":
        return "Synced";
      case "offline":
        return "Offline (saved locally)";
      case "pending":
        return "Sync pending";
      case "error":
        return "Sync failed";
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
        className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-medium text-[#12161E] transition-all shadow-xs cursor-pointer"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={displayName}
            className="w-5 h-5 rounded-full object-cover border border-[#E5DFD5]"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#B87B22]/20 border border-[#B87B22]/40 flex items-center justify-center text-[10px] text-[#B87B22] font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-w-[100px] truncate hidden sm:inline font-semibold">{displayName}</span>
        <span className="opacity-80">{getSyncIcon()}</span>
        <ChevronDown className="w-3 h-3 text-[#70798B]" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#12161E]">
          <div className="px-4 py-2 border-b border-[#E5DFD5]">
            <p className="text-xs font-bold text-[#12161E] truncate">{user.name || displayName}</p>
            <p className="text-[11px] text-[#70798B] truncate font-mono">{user.email}</p>
          </div>

          <div className="px-4 py-2.5 border-b border-[#E5DFD5] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-[#3D4654]">
              {getSyncIcon()}
              <span className="text-[11px] font-medium">{getSyncLabel()}</span>
            </div>
            <button
              onClick={() => {
                syncNow();
              }}
              className="text-[10px] font-semibold text-[#B87B22] hover:text-[#A0691B] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DFD5] transition-colors cursor-pointer"
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
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-[#A84825] hover:bg-[#FFF7ED] rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
