import type { ActivityHistory, RoutineItem, MemoryEntry } from '../types';

export class DatabaseService {
  private static ACTIVITY_KEY = 'synapsa_activity';
  private static ROUTINE_KEY = 'synapsa_routine';
  private static DIFFICULTY_KEY = 'synapsa_difficulty';

  // --- Adaptive Difficulty ---

  static getDifficulty(userId: string, domain: 'MEMORY' | 'ATTENTION' | 'RECOGNITION' | 'DAILY_RECALL'): number {
    try {
      const data = localStorage.getItem(this.DIFFICULTY_KEY);
      const all = data ? JSON.parse(data) : {};
      return all[`${userId}_${domain}`] || 1; // Default level 1
    } catch {
      return 1;
    }
  }

  static updateDifficulty(userId: string, domain: 'MEMORY' | 'ATTENTION' | 'RECOGNITION' | 'DAILY_RECALL', score: number, timeMs: number): number {
    const currentLevel = this.getDifficulty(userId, domain);
    let newLevel = currentLevel;
    
    // Adaptive Logic:
    // score >= 80 -> +1
    // score < 60 -> -1
    // 60-79 -> maintain
    if (score >= 80 && currentLevel < 3) {
      newLevel = currentLevel + 1;
    } else if (score < 60 && currentLevel > 1) {
      newLevel = currentLevel - 1;
    }

    if (newLevel !== currentLevel) {
      try {
        const data = localStorage.getItem(this.DIFFICULTY_KEY);
        const all = data ? JSON.parse(data) : {};
        all[`${userId}_${domain}`] = newLevel;
        localStorage.setItem(this.DIFFICULTY_KEY, JSON.stringify(all));
      } catch (e) {
        console.error('Error saving difficulty', e);
      }
    }
    return newLevel;
  }

  // --- Activity History ---

  static getActivities(userId: string): ActivityHistory[] {
    try {
      const data = localStorage.getItem(this.ACTIVITY_KEY);
      const all: ActivityHistory[] = data ? JSON.parse(data) : [];
      return all.filter(a => a.userId === userId);
    } catch {
      return [];
    }
  }

  static saveActivity(activity: Omit<ActivityHistory, 'id' | 'timestamp'>): ActivityHistory {
    try {
      const data = localStorage.getItem(this.ACTIVITY_KEY);
      const all: ActivityHistory[] = data ? JSON.parse(data) : [];
      
      const newActivity: ActivityHistory = {
        ...activity,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      
      all.push(newActivity);
      localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(all));
      return newActivity;
    } catch {
      throw new Error("Failed to save activity");
    }
  }

  // --- Routines ---

  static getRoutines(userId: string): RoutineItem[] {
    try {
      const data = localStorage.getItem(this.ROUTINE_KEY);
      const all: RoutineItem[] = data ? JSON.parse(data) : [];
      
      // Reset daily routines if they were completed on a previous day
      const today = new Date().toDateString();
      let modified = false;

      const userRoutines = all.filter(r => r.userId === userId).map(routine => {
        if (routine.completedAt && routine.repeat === 'daily') {
          const completedDate = new Date(routine.completedAt).toDateString();
          if (completedDate !== today) {
            routine.completedAt = undefined;
            modified = true;
          }
        }
        return routine;
      });

      if (modified) {
        this.saveAllRoutines(all);
      }

      return userRoutines.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    } catch {
      return [];
    }
  }

  static saveRoutine(routine: Omit<RoutineItem, 'id'>): RoutineItem {
    const all = this.getAllRoutines();
    const newRoutine: RoutineItem = {
      ...routine,
      id: crypto.randomUUID(),
    };
    all.push(newRoutine);
    this.saveAllRoutines(all);
    return newRoutine;
  }

  static updateRoutine(routineId: string, updates: Partial<RoutineItem>): void {
    const all = this.getAllRoutines();
    const index = all.findIndex(r => r.id === routineId);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      this.saveAllRoutines(all);
    }
  }

  static deleteRoutine(routineId: string): void {
    const all = this.getAllRoutines();
    const filtered = all.filter(r => r.id !== routineId);
    this.saveAllRoutines(filtered);
  }

  private static getAllRoutines(): RoutineItem[] {
    try {
      const data = localStorage.getItem(this.ROUTINE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static saveAllRoutines(routines: RoutineItem[]): void {
    localStorage.setItem(this.ROUTINE_KEY, JSON.stringify(routines));
  }

  // --- Memory Vault ---
  private static MEMORY_KEY = 'synapsa_memories';

  static getMemories(userId: string): MemoryEntry[] {
    try {
      const data = localStorage.getItem(this.MEMORY_KEY);
      const all: MemoryEntry[] = data ? JSON.parse(data) : [];
      return all.filter(m => m.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  }

  static saveMemory(memory: Omit<MemoryEntry, 'id' | 'createdAt'>): MemoryEntry {
    const all = this.getAllMemories();
    const newMemory: MemoryEntry = {
      ...memory,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    all.push(newMemory);
    this.saveAllMemories(all);
    return newMemory;
  }

  static updateMemory(memoryId: string, updates: Partial<MemoryEntry>): void {
    const all = this.getAllMemories();
    const index = all.findIndex(m => m.id === memoryId);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      this.saveAllMemories(all);
    }
  }

  static deleteMemory(memoryId: string): void {
    const all = this.getAllMemories();
    const filtered = all.filter(m => m.id !== memoryId);
    this.saveAllMemories(filtered);
  }

  private static getAllMemories(): MemoryEntry[] {
    try {
      const data = localStorage.getItem(this.MEMORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static saveAllMemories(memories: MemoryEntry[]): void {
    localStorage.setItem(this.MEMORY_KEY, JSON.stringify(memories));
  }
}
