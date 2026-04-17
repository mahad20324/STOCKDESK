import { useEffect, useRef } from 'react';
import { logout, updateToken } from '../utils/auth';
import { refreshToken as refreshTokenAPI } from '../utils/api';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity = logout
const TOKEN_REFRESH_INTERVAL_MS = 20 * 60 * 1000; // Refresh token every 20 minutes to keep session alive
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll'];

export default function useInactivityLogout(isAuthenticated) {
  const timeoutRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return undefined;
    }

    const startTimer = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        logout({
          message: 'You have been logged out due to inactivity.',
          redirectTo: '/login',
        });
      }, INACTIVITY_TIMEOUT_MS);
    };

    const handleActivity = () => {
      startTimer();
    };

    // Refresh token periodically while user is authenticated
    const refreshTokenPeriodically = async () => {
      try {
        const response = await refreshTokenAPI();
        if (response && response.token && response.user) {
          updateToken(response.token, response.user);
        }
      } catch (error) {
        console.warn('Token refresh failed:', error);
        // If refresh fails, log out
        logout({
          message: 'Session expired. Please log in again.',
          redirectTo: '/login',
        });
      }
    };

    startTimer();
    
    // Start token refresh interval
    refreshIntervalRef.current = window.setInterval(refreshTokenPeriodically, TOKEN_REFRESH_INTERVAL_MS);
    
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity);
    });

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [isAuthenticated]);
}