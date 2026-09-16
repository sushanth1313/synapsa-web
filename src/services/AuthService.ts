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
      userMode: 'patient', // Default, will be set during onboarding
      assignedPatients: [],
      caregiverPin: '1234', // Default for mock
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

  // --- Mock RBAC & Security ---

  static getAssignedPatients(caregiverId: string): User[] {
    const users = this.getUsers();
    const caregiver = users.find(u => u.id === caregiverId);
    if (!caregiver || caregiver.userMode !== 'caregiver') return [];
    
    // For demo purposes, if no patients assigned, assign all patients to this caregiver automatically
    const allPatients = users.filter(u => u.userMode === 'patient');
    if (!caregiver.assignedPatients || caregiver.assignedPatients.length === 0) {
      return allPatients; 
    }
    
    return allPatients.filter(p => caregiver.assignedPatients?.includes(p.id));
  }

  static authorizePatientAccess(patientId: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    
    // Patient can access their own data
    if (currentUser.id === patientId) return true;
    
    // Caregiver/Healthcare can access if assigned (mock logic grants all for demo if assigned array is empty)
    if (currentUser.userMode === 'caregiver' || currentUser.userMode === 'healthcare') {
      const assigned = this.getAssignedPatients(currentUser.id);
      return assigned.some(p => p.id === patientId);
    }
    
    return false;
  }
}
