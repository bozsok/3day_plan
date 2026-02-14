import { useState } from 'react';
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

function App() {
  const [step, setStep] = useState(0);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>();

  const nextStep = () => setStep((p) => Math.min(p + 1, 5));
  const prevStep = () => setStep((p) => Math.max(p - 1, 0));

  return (
    <UserProvider>
      <MainLayout>
        {/* StepIndicator – felső idővonal (1-5) */}
        {step > 0 && step < 5 && (
          <div className="flex justify-center w-full mb-4">
            <StepIndicator currentStep={step} totalSteps={4} />
          </div>
        )}

        {/* Step 0: Hero */}
        <Card isActive={step === 0} isBack={false}>
          <Hero onStart={nextStep} onSkip={() => setStep(5)} />
        </Card>

        {/* Step 1: Date Selection */}
        <Card isActive={step === 1} isBack={false}>
          <DateSelection
            selected={selectedDates}
            onSelect={setSelectedDates}
            onNext={nextStep}
            onBack={prevStep}
          />
        </Card>

        {/* Step 2: Map Selection */}
        <Card isActive={step === 2} isBack={false}>
          <MapSelection
            selectedRegionId={selectedRegion}
            onSelect={setSelectedRegion}
            onNext={nextStep}
            onBack={prevStep}
          />
        </Card>

        {/* Step 3: Package Selection (NEW) */}
        <Card isActive={step === 3} isBack={false}>
          <PackageSelection
            regionId={selectedRegion}
            onSelect={(pkgId) => {
              setSelectedPackageId(pkgId);
              nextStep();
            }}
            onNext={nextStep}
            onBack={prevStep}
            selectedPackageId={selectedPackageId}
          />
        </Card>

        {/* Step 4: Program Timeline */}
        <Card isActive={step === 4} isBack={false}>
          <ProgramTimeline
            regionId={selectedRegion}
            packageId={selectedPackageId}
            dates={selectedDates}
            onBack={prevStep}
            onFinish={nextStep}
          />
        </Card>

        {/* Step 5: Summary */}
        <Card isActive={step === 5} isBack={false}>
          <Summary
            onContinue={() => {
              setSelectedDates([]);
              setStep(1);
            }}
            onRegionSelect={(regionId) => {
              setSelectedRegion(regionId);
              setStep(3); // Go to Package Selection instead of Timeline directly
            }}
            onBack={() => setStep(3)}
          />
        </Card>
      </MainLayout>
    </UserProvider>
  );
}

export default App;
