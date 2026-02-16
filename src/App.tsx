import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';
import { Hero } from './components/steps/Hero';
import { DateSelection } from './components/steps/DateSelection';
import { MapSelection } from './components/steps/MapSelection';
import { ProgramTimeline } from './components/steps/ProgramTimeline';
import { Summary } from './components/steps/Summary';
import { PackageSelection } from './components/steps/PackageSelection';
import { PackageBuilder } from './components/admin/PackageBuilder';
import { StepIndicator } from './components/common/StepIndicator';
import { useState, useEffect } from 'react';

const getStepNumber = (pathname: string) => {
  switch (pathname) {
    case '/': return 0;
    case '/terv/helyszin': return 1;
    case '/terv/csomagok': return 2;
    case '/terv/program': return 3;
    case '/terv/idopont': return 4;
    case '/terv/osszegzes': return 5;
    default: return 0;
  }
};

/**
 * Route Observer: Figyeli a visszalépéseket az URL-ben
 */
import { useRef } from 'react';
import { api } from './api/client';
import { useUser } from './context/UserContext';

function ProgressSync() {
  const location = useLocation();
  const { user } = useUser();
  const lastPath = useRef(location.pathname);

  useEffect(() => {
    if (!user) return;

    const currentStep = getStepNumber(location.pathname);
    const prevStep = getStepNumber(lastPath.current);

    // Ha visszalépünk legalább egy szintet
    if (currentStep < prevStep) {
      if (currentStep === 0) {
        api.progress.update(user.id, { hasDates: false, regionId: null, packageId: null }).catch(() => { });
      } else if (currentStep === 1) {
        // Visszamentünk a régióhoz -> töröljük a mögötte lévőket
        api.progress.update(user.id, { packageId: null, hasDates: false }).catch(() => { });
      } else if (currentStep === 2) {
        // Visszamentünk a csomaghoz -> töröljük a dátumot
        api.progress.update(user.id, { hasDates: false }).catch(() => { });
      }
    }

    lastPath.current = location.pathname;
  }, [location.pathname, user]);

  return null;
}

function App() {
  const location = useLocation();

  // Állapotok betöltése localStorage-ból inicializáláskor
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>(() => {
    const saved = localStorage.getItem('3nap_selected_dates');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map(d => new Date(d)) : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(() => {
    return localStorage.getItem('3nap_selected_region') || undefined;
  });

  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(() => {
    return localStorage.getItem('3nap_selected_package') || undefined;
  });

  // Állapotok mentése localStorage-ba változáskor
  useEffect(() => {
    if (selectedDates) {
      localStorage.setItem('3nap_selected_dates', JSON.stringify(selectedDates));
    }
    if (selectedRegion) {
      localStorage.setItem('3nap_selected_region', selectedRegion);
    } else {
      localStorage.removeItem('3nap_selected_region');
    }
    if (selectedPackageId) {
      localStorage.setItem('3nap_selected_package', selectedPackageId);
    } else {
      localStorage.removeItem('3nap_selected_package');
    }
  }, [selectedDates, selectedRegion, selectedPackageId]);

  const resetSelection = () => {
    setSelectedDates([]);
    setSelectedRegion(undefined);
    setSelectedPackageId(undefined);
    localStorage.removeItem('3nap_selected_dates');
    localStorage.removeItem('3nap_selected_region');
    localStorage.removeItem('3nap_selected_package');
  };

  const step = getStepNumber(location.pathname);

  return (
    <ThemeProvider>
      <UserProvider>
        <ProgressSync />
        <MainLayout>
          {/* Dinamikus idővonal konténer – összehúzódik, ha nincs rá szükség (Step 0 és 5) */}
          <motion.div
            id="step-indicator-animation-wrapper"
            animate={{
              height: (step > 0 && step < 5) ? 50 : 0,
              marginBottom: (step > 0 && step < 5) ? 32 : 0,
              opacity: (step > 0 && step < 5) ? 1 : 0
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full flex justify-center relative overflow-hidden will-change-[height,opacity]"
          >
            <div id="step-indicator-centering-box" className="absolute inset-0 flex justify-center items-center">
              <StepIndicator currentStep={step} totalSteps={4} />
            </div>
          </motion.div>

          <div id="main-content-router-wrapper" className="w-full relative">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                id="page-transition-layer"
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  zIndex: 0
                }}
                transition={{ duration: 0.3, ease: "linear" }}
                className="w-full transform-gpu will-change-[opacity]"
              >
                <Routes location={location}>
                  <Route path="/" element={<Hero />} />
                  <Route path="/terv/helyszin" element={
                    <MapSelection selectedRegionId={selectedRegion} onSelect={setSelectedRegion} />
                  } />
                  <Route path="/terv/csomagok" element={
                    <PackageSelection regionId={selectedRegion} onSelect={setSelectedPackageId} selectedPackageId={selectedPackageId} />
                  } />
                  <Route path="/terv/program" element={
                    <ProgramTimeline regionId={selectedRegion} packageId={selectedPackageId} dates={selectedDates} />
                  } />
                  <Route path="/terv/idopont" element={
                    <DateSelection selected={selectedDates} onSelect={setSelectedDates} onVoteSuccess={resetSelection} regionId={selectedRegion} packageId={selectedPackageId} />
                  } />
                  <Route path="/terv/osszegzes" element={
                    <Summary onContinue={() => {
                      resetSelection();
                    }} onRegionSelect={setSelectedRegion} />
                  } />
                  <Route path="/admin" element={<PackageBuilder />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </MainLayout>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
