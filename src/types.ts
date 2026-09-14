export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  achievements: string[];
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

export interface ActivityHistory {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  accuracy: number;
  timeSec: number;
  level: number;
  timestamp: string;
}

export interface RoutineItem {
  id: string;
  userId: string;
  title: string;
  type: 'medication' | 'activity' | 'meal' | 'hydration' | 'other';
  icon?: string;
  activityId?: string;
  scheduledTime: string; // HH:mm format or ISO
  repeat: 'never' | 'daily' | 'weekly';
  reminderEnabled: boolean;
  completedAt?: string;
}
