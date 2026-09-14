// ============================================================
// SYNAPSA — Design Tokens
// Centralized source of truth for all design values
// ============================================================

export const colors = {
  // Primary palette
  teaGreen: '#1B4D3E',
  teaGreenLight: '#2A6B57',
  teaGreenDark: '#123529',

  // Secondary palette
  brahmaputraIndigo: '#1A365D',
  brahmaputraIndigoLight: '#2A4A7A',

  // Action
  terracottaAmber: '#D97706',
  terracottaAmberLight: '#F59E0B',
  terracottaAmberDark: '#B45309',

  // Background
  riceHuskCream: '#FDFBF7',
  riceHuskCreamDark: '#F5F0E8',

  // Emergency
  gentleCrimson: '#DC2626',
  gentleCrimsonLight: '#EF4444',

  // Neutrals
  inkDark: '#1C1917',
  inkMid: '#44403C',
  inkLight: '#78716C',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F3ED',
  border: '#E7E0D5',

  // Semantic
  success: '#15803D',
  warning: '#D97706',
  info: '#1A365D',

  // Cultural accents
  kopouPhool: '#FF6B9D',    // Wild orchid pink
  bambooGold: '#C8960C',    // Bamboo golden
  silkSaffron: '#FF8C00',   // Eri silk
  mist: 'rgba(253,251,247,0.7)',
  mistDark: 'rgba(27,77,62,0.08)',
} as const;

export const motion = {
  // Durations (ms)
  fast: 120,
  micro: 180,
  standard: 300,
  emphasis: 450,
  cinematic: 800,
  cinematicLong: 1200,
  reward: 1000,

  // CSS string values
  durationFast: '120ms',
  durationMicro: '180ms',
  durationStandard: '300ms',
  durationEmphasis: '450ms',
  durationCinematic: '800ms',

  // Easing
  easeStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  easeAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

  // Framer Motion spring configs
  springGentle: { type: 'spring', stiffness: 200, damping: 25 },
  springTactile: { type: 'spring', stiffness: 400, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 300, damping: 20 },
  springReward: { type: 'spring', stiffness: 150, damping: 12 },
} as const;

export const typography = {
  fontFamily: "'Lexend', 'Atkinson Hyperlegible', system-ui, sans-serif",

  // Font sizes (px)
  xs: '14px',
  sm: '18px',
  base: '20px',
  md: '24px',          // Minimum body
  lg: '30px',
  xl: '36px',
  xxl: '42px',
  xxxl: '52px',
  hero: '64px',

  // Font weights
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,

  // Line heights
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
  section: '96px',
} as const;

export const radius = {
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 3px rgba(27,77,62,0.08), 0 1px 2px rgba(27,77,62,0.06)',
  md: '0 4px 12px rgba(27,77,62,0.10), 0 2px 4px rgba(27,77,62,0.06)',
  lg: '0 12px 32px rgba(27,77,62,0.14), 0 4px 8px rgba(27,77,62,0.08)',
  xl: '0 24px 64px rgba(27,77,62,0.18), 0 8px 16px rgba(27,77,62,0.10)',
  glow: '0 0 32px rgba(217,119,6,0.35)',
  glowGreen: '0 0 32px rgba(27,77,62,0.40)',
  glowPink: '0 0 24px rgba(255,107,157,0.35)',
  inset: 'inset 0 2px 8px rgba(27,77,62,0.12)',
} as const;

export const zIndex = {
  base: 0,
  ambient: 1,
  content: 10,
  card: 20,
  nav: 50,
  modal: 100,
  toast: 200,
  overlay: 300,
} as const;

export const breakpoints = {
  xs: '360px',
  sm: '390px',
  md: '768px',
  lg: '1024px',
  xl: '1440px',
} as const;
