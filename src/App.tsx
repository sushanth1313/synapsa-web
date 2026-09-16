import React, { useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './components/navigation/BottomNav';
import { ToastNotification, Loader } from './components/ui/UI';
import { useAppStore } from './store';
import { SyncService } from './services';
import { useReducedMotion } from './hooks';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { GlobalEnvironment3D } from './components/3d/GlobalEnvironment3D';

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const GamesPage = lazy(() => import('./pages/GamesPage').then(m => ({ default: m.GamesPage })));
const MemoryGamePage = lazy(() => import('./pages/MemoryGamePage').then(m => ({ default: m.MemoryGamePage })));
const PatternGamePage = lazy(() => import('./pages/PatternGamePage').then(m => ({ default: m.PatternGamePage })));
const ReactionRushPage = lazy(() => import('./pages/ReactionRushPage').then(m => ({ default: m.ReactionRushPage })));
const FocusFlowPage = lazy(() => import('./pages/FocusFlowPage').then(m => ({ default: m.FocusFlowPage })));
const RoutinePage = lazy(() => import('./pages/RoutinePage').then(m => ({ default: m.RoutinePage })));
const CompanionPage = lazy(() => import('./pages/CompanionPage').then(m => ({ default: m.CompanionPage })));
const CalmSpacePage = lazy(() => import('./pages/CalmSpacePage').then(m => ({ default: m.CalmSpacePage })));
const CaregiverDashboard = lazy(() => import('./pages/CaregiverDashboard').then(m => ({ default: m.CaregiverDashboard })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then(m => ({ default: m.ProgressPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const MemoryVaultPage = lazy(() => import('./pages/MemoryVaultPage').then(m => ({ default: m.MemoryVaultPage })));

// New Games
const ObjectRecallPage = lazy(() => import('./pages/ObjectRecallPage').then(m => ({ default: m.ObjectRecallPage })));
const FindChangePage = lazy(() => import('./pages/FindChangePage').then(m => ({ default: m.FindChangePage })));
const PatternMemoryPage = lazy(() => import('./pages/PatternMemoryPage').then(m => ({ default: m.PatternMemoryPage })));
const SequenceOrderPage = lazy(() => import('./pages/SequenceOrderPage').then(m => ({ default: m.SequenceOrderPage })));
const OddOneOutPage = lazy(() => import('./pages/OddOneOutPage').then(m => ({ default: m.OddOneOutPage })));
const CategorySortPage = lazy(() => import('./pages/CategorySortPage').then(m => ({ default: m.CategorySortPage })));
const VisualPathPage = lazy(() => import('./pages/VisualPathPage').then(m => ({ default: m.VisualPathPage })));
const NumberMemoryPage = lazy(() => import('./pages/NumberMemoryPage').then(m => ({ default: m.NumberMemoryPage })));
const WordMemoryPage = lazy(() => import('./pages/WordMemoryPage').then(m => ({ default: m.WordMemoryPage })));
const FaceMemoryPage = lazy(() => import('./pages/FaceMemoryPage').then(m => ({ default: m.FaceMemoryPage })));
const SoundMemoryPage = lazy(() => import('./pages/SoundMemoryPage').then(m => ({ default: m.SoundMemoryPage })));
const RoutineOrderPage = lazy(() => import('./pages/RoutineOrderPage').then(m => ({ default: m.RoutineOrderPage })));
const MemoryJourneyPage = lazy(() => import('./pages/MemoryJourneyPage').then(m => ({ default: m.MemoryJourneyPage })));
const MoodCheckPage = lazy(() => import('./pages/MoodCheckPage').then(m => ({ default: m.MoodCheckPage })));
const FamilyConnectPage = lazy(() => import('./pages/FamilyConnectPage').then(m => ({ default: m.FamilyConnectPage })));

import { pageVariants } from './tokens/variants';

// ── Page Transition Wrapper ───────────────────────────────────

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAppStore();
  if (!currentUser) {
    return <Navigate to="/landing" replace />;
  }
  return <>{children}</>;
};

// ── Animated Routes ───────────────────────────────────────────

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<Loader message="Just a moment…" />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/landing" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
          
          {/* Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><PageTransition><OnboardingPage /></PageTransition></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><PageTransition><HomePage /></PageTransition></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><PageTransition><GamesPage /></PageTransition></ProtectedRoute>} />
          <Route path="/memory-game" element={<ProtectedRoute><PageTransition><MemoryGamePage /></PageTransition></ProtectedRoute>} />
          <Route path="/pattern-game" element={<ProtectedRoute><PageTransition><PatternGamePage /></PageTransition></ProtectedRoute>} />
          <Route path="/reaction-rush" element={<ProtectedRoute><PageTransition><ReactionRushPage /></PageTransition></ProtectedRoute>} />
          <Route path="/focus-flow" element={<ProtectedRoute><PageTransition><FocusFlowPage /></PageTransition></ProtectedRoute>} />
          <Route path="/routine" element={<ProtectedRoute><PageTransition><RoutinePage /></PageTransition></ProtectedRoute>} />
          <Route path="/companion" element={<ProtectedRoute><PageTransition><CompanionPage /></PageTransition></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><PageTransition><ProgressPage /></PageTransition></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/calm" element={<ProtectedRoute><PageTransition><CalmSpacePage /></PageTransition></ProtectedRoute>} />
          <Route path="/caregiver" element={<ProtectedRoute><PageTransition><CaregiverDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/vault" element={<ProtectedRoute><PageTransition><MemoryVaultPage /></PageTransition></ProtectedRoute>} />
          
          {/* New Game Routes */}
          <Route path="/object-recall" element={<ProtectedRoute><PageTransition><ObjectRecallPage /></PageTransition></ProtectedRoute>} />
          <Route path="/find-change" element={<ProtectedRoute><PageTransition><FindChangePage /></PageTransition></ProtectedRoute>} />
          <Route path="/pattern-memory" element={<ProtectedRoute><PageTransition><PatternMemoryPage /></PageTransition></ProtectedRoute>} />
          <Route path="/sequence-order" element={<ProtectedRoute><PageTransition><SequenceOrderPage /></PageTransition></ProtectedRoute>} />
          <Route path="/odd-one-out" element={<ProtectedRoute><PageTransition><OddOneOutPage /></PageTransition></ProtectedRoute>} />
          <Route path="/category-sort" element={<ProtectedRoute><PageTransition><CategorySortPage /></PageTransition></ProtectedRoute>} />
          <Route path="/visual-path" element={<ProtectedRoute><PageTransition><VisualPathPage /></PageTransition></ProtectedRoute>} />
          <Route path="/number-memory" element={<ProtectedRoute><PageTransition><NumberMemoryPage /></PageTransition></ProtectedRoute>} />
          <Route path="/word-memory" element={<ProtectedRoute><PageTransition><WordMemoryPage /></PageTransition></ProtectedRoute>} />
          <Route path="/face-memory" element={<ProtectedRoute><PageTransition><FaceMemoryPage /></PageTransition></ProtectedRoute>} />
          <Route path="/sound-memory" element={<ProtectedRoute><PageTransition><SoundMemoryPage /></PageTransition></ProtectedRoute>} />
          <Route path="/routine-order" element={<ProtectedRoute><PageTransition><RoutineOrderPage /></PageTransition></ProtectedRoute>} />
          <Route path="/memory-journey" element={<ProtectedRoute><PageTransition><MemoryJourneyPage /></PageTransition></ProtectedRoute>} />
          <Route path="/mood-check" element={<ProtectedRoute><PageTransition><MoodCheckPage /></PageTransition></ProtectedRoute>} />
          <Route path="/family-connect" element={<ProtectedRoute><PageTransition><FamilyConnectPage /></PageTransition></ProtectedRoute>} />
          
          {/* Catch-all redirects to home (which will redirect to landing if not auth) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};


import { LanguageSelector } from './components/ui/LanguageSelector';

// ── App Root ──────────────────────────────────────────────────

function App() {
  const { toast, clearToast, setSyncStatus, setReducedMotion } = useAppStore();

  // Sync online/offline
  useEffect(() => {
    const cleanup = SyncService.onStatusChange(setSyncStatus);
    return cleanup;
  }, [setSyncStatus]);

  // Reduced motion listener
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setReducedMotion]);

  return (
    <BrowserRouter>
      {/* Unified Global 3D Rendering Pipeline */}
      <div id="gl" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
        <Canvas
          eventSource={document.getElementById('root') || undefined}
          camera={{ position: [0, 0.5, 9], fov: 65 }}
          gl={{ alpha: false, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2, powerPreference: "high-performance" }}
          style={{ background: '#010304', pointerEvents: 'none' }}
        >
          <GlobalEnvironment3D />
        </Canvas>
      </div>
      <div id="vignette"></div>
      <div id="grain"></div>
      
      <LanguageSelector />

      <div className="page app-layout">
        <AnimatedRoutes />
        
        {/* Only show bottom nav on authenticated routes where we didn't explicitly hide it */}
        <BottomNav />

        {/* Global Toast */}
        <AnimatePresence>
          {toast && (
            <div className="toast-container">
              <ToastNotification
                message={toast.message}
                type={toast.type}
                onClose={clearToast}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

export default App;
