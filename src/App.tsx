import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { UserProvider } from './context/UserContext';
import { MainLayout } from './components/layout/MainLayout';
import { Hero } from './components/steps/Hero';
import { DateSelection } from './components/steps/DateSelection';
import { MapSelection } from './components/steps/MapSelection';
import { ProgramTimeline } from './components/steps/ProgramTimeline';
import { Summary } from './components/steps/Summary';
import { PackageSelection } from './components/steps/PackageSelection';
import { StepIndicator } from './components/common/StepIndicator';
import { Card } from './components/common/Card';
import { useState } from 'react';

function App() {
  const location = useLocation();
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>();

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
    <UserProvider>
      <MainLayout>
        {/* StepIndicator – stabil fejléc helyfoglalással az ugrálás ellen */}
        <div className="w-full flex justify-center mb-8 h-[50px] relative">
          <AnimatePresence>
            {step > 0 && step < 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex justify-center"
              >
                <StepIndicator currentStep={step} totalSteps={4} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full relative">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
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
              className="w-full"
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
                    <Summary onContinue={() => setSelectedDates([])} onRegionSelect={setSelectedRegion} />
                  </Card>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </MainLayout>
    </UserProvider>
  );
}

export default App;
