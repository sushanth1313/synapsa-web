// ============================================================
// Smarani NER — Custom Hooks
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

// ── useVoiceAmplitude ────────────────────────────────────────
export function useVoiceAmplitude(active: boolean): number {
  const [amplitude, setAmplitude] = useState(0);
  const animRef = useRef<number>(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!active) {
      setAmplitude(0);
      cancelAnimationFrame(animRef.current);
      contextRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
      return;
    }

    let mounted = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      const ctx = new AudioContext();
      contextRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      src.connect(analyzer);
      analyzerRef.current = analyzer;
      const data = new Uint8Array(analyzer.frequencyBinCount);
      const tick = () => {
        if (!mounted) return;
        analyzer.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAmplitude(avg / 128);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    }).catch(() => {
      // Simulate amplitude for demo
      const tick = () => {
        if (!mounted) return;
        setAmplitude(0.3 + Math.random() * 0.4);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(animRef.current);
      contextRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [active]);

  return amplitude;
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
