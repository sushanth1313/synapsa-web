// ============================================================
// Smarani NER — Global State (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Locale } from '../i18n';
import type { AIState, SyncStatus, CaregiverData } from '../services';
import { AnalyticsService, SyncService, AuthService, DatabaseService, GamificationService } from '../services';
import type { User, RoutineItem } from '../types';

interface AppState {
  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  // Language
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // AI Companion
  aiState: AIState;
  setAIState: (state: AIState) => void;
  lastSpeech: string;
  setLastSpeech: (text: string) => void;

  // Game
  currentLevel: number;
  totalScore: number;
  gamesPlayed: number;
  setLevel: (level: number) => void;
  incrementScore: (points: number) => void;
  incrementGamesPlayed: () => void;
  completeGameActivity: (gameId: string, score: number, accuracy: number, timeSec: number, level: number) => void;

  // Routine
  routineItems: RoutineItem[];
  fetchRoutines: () => void;
  completeRoutineItem: (id: string) => void;

  // Caregiver
  caregiverData: CaregiverData;
  refreshCaregiverData: () => void;

  // Sync
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;

  // Active Reminder
  activeReminder: RoutineItem | null;
  setActiveReminder: (item: RoutineItem | null) => void;

  // Reduced Motion
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  // Toast
  toast: { message: string; type: 'success' | 'warning' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: AuthService.getCurrentUser(),
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => {
    AuthService.logout();
    set({ currentUser: null, routineItems: [] });
  },

  // Language
  locale: 'en',
  setLocale: (locale) => set({ locale }),

  // AI Companion
  aiState: 'idle',
  setAIState: (aiState) => set({ aiState }),
  lastSpeech: '',
  setLastSpeech: (lastSpeech) => set({ lastSpeech }),

  // Game
  currentLevel: 1,
  totalScore: 0,
  gamesPlayed: 0,
  setLevel: (currentLevel) => set({ currentLevel }),
  incrementScore: (points) => set(s => ({ totalScore: s.totalScore + points })),
  incrementGamesPlayed: () => set(s => ({ gamesPlayed: s.gamesPlayed + 1 })),
  completeGameActivity: (gameId, score, accuracy, timeSec, level) => {
    const user = get().currentUser;
    if (!user) return;
    
    DatabaseService.saveActivity({
      userId: user.id,
      gameId,
      score,
      accuracy,
      timeSec,
      level
    });

    GamificationService.updateStreak();
    const result = GamificationService.addXP(score);
    
    if (result && result.leveledUp) {
      get().showToast(`Level Up! You are now Level ${result.newLevel} 🎉`, 'success');
    } else {
      get().showToast(`+${score} XP`, 'success');
    }

    set({ currentUser: AuthService.getCurrentUser() });
  },

  // Routine
  routineItems: AuthService.getCurrentUser() ? DatabaseService.getRoutines(AuthService.getCurrentUser()!.id) : [],
  fetchRoutines: () => {
    const user = get().currentUser;
    if (user) {
      set({ routineItems: DatabaseService.getRoutines(user.id) });
    }
  },
  completeRoutineItem: (id) => {
    const user = get().currentUser;
    if (!user) return;
    
    DatabaseService.updateRoutine(id, { completedAt: new Date().toISOString() });
    
    // Refresh routines
    set({ routineItems: DatabaseService.getRoutines(user.id) });
    
    // Gamification
    GamificationService.updateStreak();
    const result = GamificationService.addXP(50);
    
    if (result && result.leveledUp) {
      get().showToast(`Level Up! You are now Level ${result.newLevel} 🎉`, 'success');
    } else {
      get().showToast('+50 XP', 'success');
    }

    // Update currentUser state to reflect new XP/streak
    set({ currentUser: AuthService.getCurrentUser() });

    AnalyticsService.recordRoutineAction(id, true);
  },

  // Caregiver
  caregiverData: AnalyticsService.getMockCaregiverData(),
  refreshCaregiverData: () => set({ caregiverData: AnalyticsService.getMockCaregiverData() }),

  // Sync
  syncStatus: SyncService.getStatus(),
  setSyncStatus: (syncStatus) => set({ syncStatus }),

  // Active Reminder
  activeReminder: null,
  setActiveReminder: (activeReminder) => set({ activeReminder }),

  // Reduced Motion
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  // Toast
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  clearToast: () => set({ toast: null }),
}));
