import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastConfig {
  type: ToastType;
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  duration?: number;
  onPress?: () => void;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const queue = useRef<ToastConfig[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const showNext = useCallback(() => {
    if (queue.current.length > 0) {
      const next = queue.current.shift()!;
      setCurrentToast(next);
      setVisible(true);
      clearTimer();
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(showNext, 250);
      }, next.duration ?? DEFAULT_DURATION);
    } else {
      setCurrentToast(null);
    }
  }, []);

  const showToast = useCallback((config: ToastConfig) => {
    queue.current.push(config);
    if (!visible) {
      showNext();
    }
  }, [visible, showNext]);

  const hideToast = useCallback(() => {
    setVisible(false);
    clearTimer();
    setTimeout(showNext, 250);
  }, [showNext]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={visible}
        type={currentToast?.type ?? 'info'}
        title={currentToast?.title ?? ''}
        description={currentToast?.description}
        icon={currentToast?.icon}
        onDismiss={hideToast}
        onPress={currentToast?.onPress}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
