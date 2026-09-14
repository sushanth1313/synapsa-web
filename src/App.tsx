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
          
          {/* Catch-all redirects to home (which will redirect to landing if not auth) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};


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
      {/* Kage Global Background Layers */}
      <div id="gl">
        <GlobalEnvironment3D />
      </div>
      <div id="vignette"></div>
      <div id="grain"></div>

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
