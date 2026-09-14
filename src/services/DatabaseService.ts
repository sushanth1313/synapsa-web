import type { ActivityHistory, RoutineItem } from '../types';

export class DatabaseService {
  private static ACTIVITY_KEY = 'synapsa_activity';
  private static ROUTINE_KEY = 'synapsa_routine';

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
}
