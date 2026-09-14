import type { User, RoutineItem } from '../types';
import { DatabaseService } from './DatabaseService';

export class AuthService {
  private static USERS_KEY = 'synapsa_users';
  private static CURRENT_USER_KEY = 'synapsa_current_user';

  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(this.CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static login(email: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  }

  static register(name: string, email: string): User {
    const users = this.getUsers();
    
    // Check if user exists
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      throw new Error('User already exists');
    }

    user = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date().toISOString(),
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      achievements: [],
      preferences: {
        theme: 'dark',
        notifications: true,
      }
    };

    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  }

  static logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  static updateProfile(userId: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) throw new Error('User not found');
    
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
    
    return updatedUser;
  }
}
