/**
 * Authentication utilities for JWT-based authentication
 * Manages tokens, user role, and session state
 */

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export type UserRole = "admin" | "university" | "user" | null;

/**
 * Accepts a role string in any case/format and returns a normalized UserRole
 * compatible with the rest of the code. Handles legacy values like
 * "NORMAL_USER" or "normal_user".
 */
export function normalizeUserRole(input?: string | UserRole): UserRole {
  if (!input) return null;
  let r = input.toString().toLowerCase();
  // legacy alias
  if (r === "normal_user" || r === "normaluser") {
    r = "user";
  }
  if (r === "admin" || r === "university" || r === "user") {
    return r as UserRole;
  }
  return null;
}

// ============================================================================
// Token Management
// ============================================================================

const ACCESS_TOKEN_KEY = "jh_access_token";
const REFRESH_TOKEN_KEY = "jh_refresh_token";
const USER_ROLE_KEY = "jh_user_role";
const USER_EMAIL_KEY = "jh_user_email";

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setUserRole(role: UserRole): void {
  const norm = normalizeUserRole(role || null);
  if (norm) {
    localStorage.setItem(USER_ROLE_KEY, norm);
  } else {
    localStorage.removeItem(USER_ROLE_KEY);
  }
}

export function getUserRole(): UserRole {
  const role = localStorage.getItem(USER_ROLE_KEY);
  return normalizeUserRole(role as UserRole);
}

export function setUserEmail(email: string): void {
  localStorage.setItem(USER_EMAIL_KEY, email);
}

export function getUserEmail(): string | null {
  return localStorage.getItem(USER_EMAIL_KEY);
}

export function clearAuthState(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}

// ============================================================================
// Session Management
// ============================================================================

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return !!token;
}

export function logout(): void {
  clearAuthState();
  window.location.href = "/login";
}

// ============================================================================
// Auth Guard Hook
// ============================================================================

/**
 * Hook to protect pages and enforce role-based access
 * Usage:
 *   useAuthGuard("user") // ensure user is logged in with "user" role
 *   useAuthGuard() // ensure user is just logged in
 */
export function useAuthGuard(expectedRole?: UserRole) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();

    // Not authenticated - redirect to login
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Role check if specified
    if (expectedRole) {
      const userRole = getUserRole();
      const expected = normalizeUserRole(expectedRole);
      if (!userRole || userRole !== expected) {
        navigate("/login", { replace: true });
        return;
      }
    }
  }, [navigate, expectedRole]);
}

// ============================================================================
// ProtectedRoute Wrapper for Routing
// ============================================================================

/**
 * Returns true if user is authenticated and (optionally) has the expected role
 */
export function canAccess(expectedRole?: UserRole): boolean {
  if (!isAuthenticated()) {
    return false;
  }

  if (expectedRole) {
    const userRole = getUserRole();
    if (!userRole) {
      return false;
    }
    const exp = normalizeUserRole(expectedRole);
    return userRole === exp;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Legacy session helpers (compatibility)
// ---------------------------------------------------------------------------

const USER_ID_KEY = "jh_user_id";

export interface Session {
  userType: UserRole;
  userId: string | null;
}

function broadcastSessionChange() {
  const session = getSession();
  window.dispatchEvent(
    new CustomEvent("jh:session-changed", { detail: session }),
  );
}

/**
 * Store a small session record (role + identifier) in localStorage.
 * This mirrors the old `setSession` API used by many pages.
 */
export function setSession(userType: string, userId: string | null) {
  const norm = normalizeUserRole(userType);
  setUserRole(norm);
  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId);
  } else {
    localStorage.removeItem(USER_ID_KEY);
  }
  broadcastSessionChange();
}

/**
 * Remove any stored session information.
 */
export function clearSession() {
  clearAuthState();
  localStorage.removeItem(USER_ID_KEY);
  broadcastSessionChange();
}

/**
 * Return the current session info or null if not logged in.
 */
export function getSession(): Session | null {
  const role = getUserRole();
  if (!role) {
    return null;
  }
  return {
    userType: role,
    userId: getLoggedInUserId(),
  };
}

/**
 * Helper for pages that only need the numeric/string ID of the logged-in user.
 */
export function getLoggedInUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * Returns true if there is any session information stored (role + id).
 */
export function isAnyUserLoggedIn(): boolean {
  return getSession() !== null;
}
