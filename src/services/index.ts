// ============================================================
// SYNAPSA — Service Layer
// Clean abstractions ready to connect to real APIs
// ============================================================

// ── Types ────────────────────────────────────────────────────

export * from './AuthService';
export * from './DatabaseService';
export * from './GamificationService';

export type AIState = 'idle' | 'listening' | 'thinking' | 'searching' | 'speaking' | 'success' | 'concern';

export type GameType = 'MEMORY' | 'PATTERN';

export type UIState =
  | 'HOME'
  | 'COMPANION'
  | 'MEMORY_GAME'
  | 'PATTERN_GAME'
  | 'ROUTINE'
  | 'CALM'
  | 'CAREGIVER';

export type VisualPrompt =
  | '3D_TEA_GARDEN_AMBIENCE'
  | '3D_WATER_GLASS'
  | '3D_MEDICATION'
  | '3D_MEMORY_OBJECTS'
  | 'CALM_RIVER'
  | 'SUNRISE_HILLS';

export interface AIOutput {
  speech_output: string;
  language_code: string;
  ui_state: UIState;
  game_type?: GameType;
  adaptive_difficulty_level: number;
  caregiver_alert_flag: boolean;
  visual_prompt_trigger: VisualPrompt;
}

export interface GameResult {
  gameType: GameType;
  level: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  avgResponseTimeMs: number;
  timestamp: number;
}

export interface CaregiverData {
  memoryAccuracy: number;         // 0–100
  avgResponseTimeMs: number;
  gamesCompleted: number;
  routineAdherence: number;       // 0–100
  hydrationCount: number;         // out of 8
  medicationTaken: boolean;
  activityScore: number;          // 0–100
  lastSync: number;               // timestamp
  isOffline: boolean;
  weeklyTrend: number[];          // 7 days of scores
  interactionFrequency: number[]; // 7 days hourly counts
  alerts: CaregiverAlert[];
}

export interface CaregiverAlert {
  id: string;
  type: 'medication' | 'hydration' | 'activity' | 'cognitive';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

// ── AIService ───────────────────────────────────────────────

export class AIService {
  private static mockResponses: AIOutput[] = [
    {
      speech_output: "Hello! I am NOVA. Take your time. I am here.",
      language_code: "en-IN",
      ui_state: "HOME",
      adaptive_difficulty_level: 1,
      caregiver_alert_flag: false,
      visual_prompt_trigger: "3D_TEA_GARDEN_AMBIENCE",
    },
    {
      speech_output: "Very good! You remembered that correctly.",
      language_code: "en-IN",
      ui_state: "MEMORY_GAME",
      game_type: "MEMORY",
      adaptive_difficulty_level: 2,
      caregiver_alert_flag: false,
      visual_prompt_trigger: "3D_MEMORY_OBJECTS",
    },
  ];

  static async greet(languageCode: string): Promise<AIOutput> {
    await this.delay(600);
    return { ...this.mockResponses[0], language_code: languageCode };
  }

  static async processVoiceInput(_audioBlob: Blob, languageCode: string): Promise<AIOutput> {
    await this.delay(1200);
    return { ...this.mockResponses[0], language_code: languageCode };
  }

  static async getGameInstruction(
    gameType: GameType,
    level: number,
    languageCode: string
  ): Promise<AIOutput> {
    await this.delay(300);
    return {
      speech_output: level <= 1 ? "Look at the objects carefully." : "Try to remember the pattern.",
      language_code: languageCode,
      ui_state: gameType === 'MEMORY' ? 'MEMORY_GAME' : 'PATTERN_GAME',
      game_type: gameType,
      adaptive_difficulty_level: level,
      caregiver_alert_flag: false,
      visual_prompt_trigger: '3D_MEMORY_OBJECTS',
    };
  }

  static async adaptDifficulty(result: GameResult): Promise<number> {
    await this.delay(200);
    const accuracy = (result.correctAnswers / result.totalQuestions) * 100;
    const responseGood = result.avgResponseTimeMs < 8000;
    if (accuracy >= 80 && responseGood && result.level < 5) return result.level + 1;
    if (accuracy < 40 && result.level > 1) return result.level - 1;
    return result.level;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ── GameService ─────────────────────────────────────────────

export interface MemoryObject {
  id: string;
  emoji: string;
  label: string;
  culturalNote?: string;
  color: string;
}

const CULTURAL_OBJECTS: MemoryObject[] = [
  { id: 'jaapi', emoji: '🎋', label: 'Jaapi', culturalNote: 'Traditional Assamese hat', color: '#C8960C' },
  { id: 'pitcher', emoji: '🫙', label: 'Brass Pitcher', color: '#D97706' },
  { id: 'teacup', emoji: '🍵', label: 'Assam Tea Cup', color: '#1B4D3E' },
  { id: 'basket', emoji: '🧺', label: 'Bamboo Basket', color: '#8B5E3C' },
  { id: 'flower', emoji: '🌸', label: 'Kopou Phool', culturalNote: 'Orchid flower', color: '#FF6B9D' },
  { id: 'fish', emoji: '🐟', label: 'Hilsa Fish', color: '#4A90D9' },
  { id: 'leaf', emoji: '🍃', label: 'Tea Leaf', color: '#2A6B57' },
  { id: 'bell', emoji: '🔔', label: 'Temple Bell', color: '#F59E0B' },
  { id: 'lamp', emoji: '🪔', label: 'Diyo', color: '#FF8C00' },
  { id: 'lotus', emoji: '🪷', label: 'Lotus', color: '#FF6B9D' },
  { id: 'butterfly', emoji: '🦋', label: 'Butterfly', color: '#8B5CF6' },
  { id: 'mango', emoji: '🥭', label: 'Mango', color: '#F59E0B' },
  { id: 'bihu_dhol', emoji: '🥁', label: 'Bihu Dhol', culturalNote: 'Traditional Assamese Drum', color: '#8B5E3C' },
  { id: 'gamosa', emoji: '🧣', label: 'Gamosa', culturalNote: 'Traditional Assamese Cloth', color: '#EF4444' },
  { id: 'muga_silk', emoji: '🥻', label: 'Muga Silk', culturalNote: 'Golden Silk of Assam', color: '#FBBF24' },
  { id: 'rhino', emoji: '🦏', label: 'One-Horned Rhino', culturalNote: 'Pride of Kaziranga', color: '#6B7280' },
];

export class GameService {
  static getObjectsForLevel(level: number): MemoryObject[] {
    const count = Math.min(3 + level, CULTURAL_OBJECTS.length);
    const shuffled = [...CULTURAL_OBJECTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static generateMemoryRound(level: number): {
    objects: MemoryObject[];
    missingObject: MemoryObject;
    options: MemoryObject[];
    memorizeDurationMs: number;
  } {
    const objects = this.getObjectsForLevel(level);
    const missingIndex = Math.floor(Math.random() * objects.length);
    const missingObject = objects[missingIndex];
    const displayObjects = objects.filter((_, i) => i !== missingIndex);

    // Generate options (correct + distractors)
    const distractors = CULTURAL_OBJECTS
      .filter(o => !objects.find(x => x.id === o.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const options = [...distractors, missingObject].sort(() => Math.random() - 0.5);

    const memorizeDurationMs = Math.max(2000, 5000 - (level - 1) * 500);

    return { objects: displayObjects, missingObject, options, memorizeDurationMs };
  }

  static generatePatternRound(level: number): {
    sequence: MemoryObject[];
    nextItem: MemoryObject;
    options: MemoryObject[];
  } {
    const poolSize = Math.min(4 + level, CULTURAL_OBJECTS.length);
    const pool = [...CULTURAL_OBJECTS].sort(() => Math.random() - 0.5).slice(0, poolSize);
    const patternLength = Math.min(2 + level, 4);
    const pattern = Array.from({ length: patternLength }, (_, i) => pool[i % pool.length]);
    const nextItem = pool[patternLength % pool.length];
    const distractors = pool.filter(o => o.id !== nextItem.id).slice(0, 2);
    const options = [...distractors, nextItem].sort(() => Math.random() - 0.5);
    return { sequence: pattern, nextItem, options };
  }

  static computeResult(
    answers: { correct: boolean; responseTimeMs: number }[],
    gameType: GameType,
    level: number
  ): GameResult {
    const correctAnswers = answers.filter(a => a.correct).length;
    const avgResponseTimeMs = answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / answers.length;
    return {
      gameType,
      level,
      score: Math.round((correctAnswers / answers.length) * 100),
      totalQuestions: answers.length,
      correctAnswers,
      avgResponseTimeMs,
      timestamp: Date.now(),
    };
  }
}

// ── ReminderService (Deprecated in favor of DatabaseService, keeping dummy for now if needed) ─────────────────────────────────────────

export class ReminderService {
  static getDailyRoutine(): any[] {
    return [];
  }

  static markComplete(items: any[], id: string): any[] {
    return items;
  }

  static getAdherence(items: any[]): number {
    return 0;
  }
}

// ── AnalyticsService ────────────────────────────────────────

export class AnalyticsService {
  static getMockCaregiverData(): CaregiverData {
    return {
      memoryAccuracy: 72,
      avgResponseTimeMs: 6200,
      gamesCompleted: 14,
      routineAdherence: 85,
      hydrationCount: 5,
      medicationTaken: true,
      activityScore: 68,
      lastSync: Date.now() - 1000 * 60 * 5,
      isOffline: false,
      weeklyTrend: [58, 62, 70, 65, 72, 78, 72],
      interactionFrequency: [0, 0, 0, 0, 0, 0, 1, 3, 4, 2, 1, 0, 2, 3, 1, 0, 2, 4, 3, 1, 0, 0, 0, 0],
      alerts: [
        {
          id: 'alert-1',
          type: 'hydration',
          message: 'Hydration target not met yesterday',
          severity: 'low',
          timestamp: Date.now() - 1000 * 60 * 60 * 8,
        },
      ],
    };
  }

  static recordGameResult(result: GameResult): void {
    if (SyncService.getStatus() === 'offline') {
      SyncService.addToQueue('RECORD_GAME', result);
      return;
    }
    // Mock: push to backend
    const existing = JSON.parse(localStorage.getItem('synapsa_results') ?? '[]');
    existing.push(result);
    localStorage.setItem('synapsa_results', JSON.stringify(existing.slice(-100)));
  }

  static recordRoutineAction(id: string, completed: boolean): void {
    if (SyncService.getStatus() === 'offline') {
      SyncService.addToQueue('ROUTINE_ACTION', { id, completed });
      return;
    }
    // Mock: sync to backend
  }
}

// ── VoiceService ────────────────────────────────────────────

export class VoiceService {
  static speak(text: string, lang = 'en-IN'): void {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean up text for better speech synthesis (remove emojis, etc)
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '')
                          .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
                          .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
                          .replace(/[\u{1F700}-\u{1F77F}]/gu, '')
                          .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')
                          .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')
                          .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
                          .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
                          .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
                          .replace(/[\u{2600}-\u{26FF}]/gu, '')
                          .replace(/[\u{2700}-\u{27BF}]/gu, '');
                          
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  static stopSpeaking(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

// ── SyncService ─────────────────────────────────────────────

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced';

export * from './AudioService';

export class SyncService {
  private static DB_NAME = 'SynapsaOfflineDB';
  private static STORE_NAME = 'syncQueue';
  private static DB_VERSION = 1;

  private static getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  static getStatus(): SyncStatus {
    return navigator.onLine ? 'synced' : 'offline';
  }

  static onStatusChange(callback: (status: SyncStatus) => void): () => void {
    const onOnline = () => {
      callback('syncing');
      this.flushQueue().then(() => callback('synced')).catch(() => callback('offline'));
    };
    const onOffline = () => callback('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }

  static async addToQueue(action: string, payload: any) {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const item = { id: crypto.randomUUID(), action, payload, timestamp: Date.now() };
      store.add(item);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Offline storage failed', e);
    }
  }

  static async getQueue(): Promise<any[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.getAll();
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to get queue', e);
      return [];
    }
  }

  static async flushQueue() {
    const q = await this.getQueue();
    if (q.length === 0) return;

    console.log(`Syncing ${q.length} items to backend via IndexedDB...`);
    // Simulated network delay
    await new Promise(r => setTimeout(r, 1000));
    
    // Process items
    for (const item of q) {
      if (item.action === 'RECORD_GAME') {
        const existing = JSON.parse(localStorage.getItem('synapsa_results') ?? '[]');
        existing.push(item.payload);
        localStorage.setItem('synapsa_results', JSON.stringify(existing.slice(-100)));
      }
      // other actions can be processed here
    }

    // Clear IndexedDB queue after successful sync
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      store.clear();
    } catch (e) {
      console.error('Failed to clear sync queue', e);
    }
    
    console.log('IndexedDB Sync complete');
  }
}
