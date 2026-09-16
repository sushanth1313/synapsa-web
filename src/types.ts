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
  userMode?: 'patient' | 'caregiver' | 'healthcare';
  caregiverPin?: string;
  assignedPatients?: string[]; // IDs of assigned patients
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
  type: 'medication' | 'activity' | 'meal' | 'hydration' | 'medical_appointment' | 'other';
  icon?: string;
  activityId?: string;
  doctorName?: string;
  hospital?: string;
  notes?: string;
  scheduledTime: string; // HH:mm format or ISO
  repeat: 'never' | 'daily' | 'weekly';
  reminderEnabled: boolean;
  completedAt?: string;
}

export interface MemoryEntry {
  id: string;
  userId: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  category: 'People' | 'Places' | 'Events' | 'Favorites' | 'Other';
  isFavorite: boolean;
  createdAt: string;
}
