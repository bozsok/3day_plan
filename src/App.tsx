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
import { StepIndicator } from './components/common/StepIndicator';
import { Card } from './components/common/Card';
import { useState, useEffect } from 'react';

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

  const getStepNumber = (pathname: string) => {
    switch (pathname) {
      case '/': return 0;
      case '/terv/idopont': return 1;
      case '/terv/helyszin': return 2;
      case '/terv/csomagok': return 3;
      case '/terv/program': return 4;
      case '/terv/osszegzes': return 5;
      default: return 0;
    }
  };

  const step = getStepNumber(location.pathname);

  return (
    <ThemeProvider>
      <UserProvider>
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
                  <Route path="/" element={<Card><Hero /></Card>} />
                  <Route path="/terv/idopont" element={
                    <Card>
                      <DateSelection selected={selectedDates} onSelect={setSelectedDates} />
                    </Card>
                  } />
                  <Route path="/terv/helyszin" element={
                    <Card>
                      <MapSelection selectedRegionId={selectedRegion} onSelect={setSelectedRegion} />
                    </Card>
                  } />
                  <Route path="/terv/csomagok" element={
                    <Card>
                      <PackageSelection regionId={selectedRegion} onSelect={setSelectedPackageId} selectedPackageId={selectedPackageId} />
                    </Card>
                  } />
                  <Route path="/terv/program" element={
                    <Card>
                      <ProgramTimeline regionId={selectedRegion} packageId={selectedPackageId} dates={selectedDates} />
                    </Card>
                  } />
                  <Route path="/terv/osszegzes" element={
                    <Card>
                      <Summary onContinue={() => {
                        setSelectedDates([]);
                        setSelectedRegion(undefined);
                        setSelectedPackageId(undefined);
                        localStorage.removeItem('3nap_selected_dates');
                        localStorage.removeItem('3nap_selected_region');
                        localStorage.removeItem('3nap_selected_package');
                      }} onRegionSelect={setSelectedRegion} />
                    </Card>
                  } />
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
