// ============================================================
// SYNAPSA — Custom Hooks
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';

// ── useReducedMotion ─────────────────────────────────────────
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ── useCountdown ─────────────────────────────────────────────
export function useCountdown(initialMs: number, onEnd?: () => void) {
  const [remaining, setRemaining] = useState(initialMs);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setRemaining(initialMs);
    setRunning(true);
  }, [initialMs]);

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 100) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          onEnd?.();
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onEnd]);

  return { remaining, running, progress: 1 - remaining / initialMs, start, stop };
}


// ── useTimer ─────────────────────────────────────────────────
export function useTimer() {
  const startRef = useRef<number>(0);
  const start = useCallback(() => { startRef.current = Date.now(); }, []);
  const getElapsed = useCallback(() => Date.now() - startRef.current, []);
  return { start, getElapsed };
}

// ── useOnline ─────────────────────────────────────────────────
export function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

// ── useTimeOfDay ─────────────────────────────────────────────
export function useTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ── useAnimatedValue ─────────────────────────────────────────
export function useAnimatedValue(target: number, durationMs = 1000): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = Date.now();
    const startVal = value;
    const diff = target - startVal;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease out quad
      const eased = 1 - (1 - progress) ** 2;
      setValue(startVal + diff * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

// ── useVoiceAmplitude ────────────────────────────────────────
export function useVoiceAmplitude(isListening: boolean): number {
  const [amplitude, setAmplitude] = useState(0);
  
  useEffect(() => {
    if (!isListening) {
      setAmplitude(0);
      return;
    }
    const interval = setInterval(() => {
      setAmplitude(Math.random() * 0.5 + 0.2);
    }, 100);
    return () => clearInterval(interval);
  }, [isListening]);

  return amplitude;
}
