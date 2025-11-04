import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface SessionTimeoutProps {
  warningTime?: number; // Time in minutes before session expires to show warning
  sessionTimeout?: number; // Total session timeout in minutes
}

export function SessionTimeout({ 
  warningTime = 5, 
  sessionTimeout = 30 
}: SessionTimeoutProps) {
  const { isAuthenticated, logout, refreshAuth } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Update last activity time
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Check for user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Session timeout logic
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const sessionTimeoutMs = sessionTimeout * 60 * 1000;
      const warningTimeMs = warningTime * 60 * 1000;
      
      // Check if session should expire
      if (timeSinceActivity >= sessionTimeoutMs) {
        logout();
        toast({
          title: 'Session expired',
          description: 'Your session has expired due to inactivity. Please log in again.',
          variant: 'destructive',
        });
        return;
      }
      
      // Check if warning should be shown
      if (timeSinceActivity >= sessionTimeoutMs - warningTimeMs && !showWarning) {
        setShowWarning(true);
        setTimeLeft(Math.ceil((sessionTimeoutMs - timeSinceActivity) / 1000));
      }
      
      // Update countdown if warning is shown
      if (showWarning) {
        const remaining = Math.ceil((sessionTimeoutMs - timeSinceActivity) / 1000);
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          logout();
          toast({
            title: 'Session expired',
            description: 'Your session has expired due to inactivity. Please log in again.',
            variant: 'destructive',
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, sessionTimeout, warningTime, showWarning, logout, toast]);

  const handleExtendSession = async () => {
    try {
      await refreshAuth();
      updateActivity();
      setShowWarning(false);
      toast({
        title: 'Session extended',
        description: 'Your session has been extended successfully.',
      });
    } catch (error) {
      toast({
        title: 'Failed to extend session',
        description: 'Please log in again.',
        variant: 'destructive',
      });
      logout();
    }
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated || !showWarning) {
    return null;
  }

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
          <DialogDescription>
            Your session will expire in {formatTime(timeLeft)} due to inactivity.
            Would you like to extend your session?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button onClick={handleExtendSession} className="flex-1">
            Extend Session
          </Button>
          <Button onClick={handleLogout} variant="outline" className="flex-1">
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}