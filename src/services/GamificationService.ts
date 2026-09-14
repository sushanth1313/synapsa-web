import type { User } from '../types';
import { AuthService } from './AuthService';

export const ACHIEVEMENTS = {
  FIRST_STEP: { id: 'first_step', title: 'First Step', desc: 'Complete your first routine.', icon: '🏆' },
  WARRIOR_7: { id: 'warrior_7', title: '7 Day Warrior', desc: 'Maintain a 7-day streak.', icon: '🔥' },
  MEMORY_MASTER: { id: 'memory_master', title: 'Memory Master', desc: 'Achieve 90%+ accuracy in a memory game.', icon: '🧠' },
  SPEED_DEMON: { id: 'speed_demon', title: 'Speed Demon', desc: 'Complete a challenge under the target time.', icon: '⚡' },
  PERFECT_ROUND: { id: 'perfect_round', title: 'Perfect Round', desc: 'Get 100% accuracy.', icon: '💯' }
};

export class GamificationService {
  /**
   * Adds XP to the current user, calculates level ups, and persists.
   * XP logic: Level = floor(XP / 100) + 1
   */
  static addXP(amount: number): { leveledUp: boolean, newLevel: number, newXP: number } | null {
    const user = AuthService.getCurrentUser();
    if (!user) return null;

    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > user.level;

    AuthService.updateProfile(user.id, { xp: newXP, level: newLevel });

    return { leveledUp, newLevel, newXP };
  }

  /**
   * Updates streak based on today's activity. Call this when completing a routine item.
   */
  static updateStreak(): { currentStreak: number, streakExtended: boolean } | null {
    const user = AuthService.getCurrentUser();
    if (!user) return null;

    const today = new Date().toDateString();
    let { currentStreak, longestStreak, lastActiveDate } = user;
    let streakExtended = false;

    if (lastActiveDate !== today) {
      if (lastActiveDate) {
        const lastActive = new Date(lastActiveDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive.toDateString() === yesterday.toDateString()) {
          // Consecutive day
          currentStreak += 1;
        } else {
          // Streak broken
          currentStreak = 1;
        }
      } else {
        // First active day
        currentStreak = 1;
      }

      streakExtended = true;
      lastActiveDate = today;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      AuthService.updateProfile(user.id, { currentStreak, longestStreak, lastActiveDate });

      if (currentStreak >= 7) {
        this.unlockAchievement('warrior_7');
      }
    }

    return { currentStreak, streakExtended };
  }

  /**
   * Unlocks an achievement if not already unlocked.
   */
  static unlockAchievement(achievementId: string): boolean {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    if (!user.achievements.includes(achievementId)) {
      const updatedAchievements = [...user.achievements, achievementId];
      AuthService.updateProfile(user.id, { achievements: updatedAchievements });
      return true;
    }
    
    return false;
  }
}
