import { useState } from 'react';
import { UserProvider } from './context/UserContext';
import { MainLayout } from './components/layout/MainLayout';
import { Hero } from './components/steps/Hero';
import { DateSelection } from './components/steps/DateSelection';
import { MapSelection } from './components/steps/MapSelection';
import { ProgramTimeline } from './components/steps/ProgramTimeline';
import { Summary } from './components/steps/Summary';
import { StepIndicator } from './components/common/StepIndicator';
import { Card } from './components/common/Card';

function App() {
  const [step, setStep] = useState(0);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();

  const nextStep = () => setStep((p) => Math.min(p + 1, 4));
  const prevStep = () => setStep((p) => Math.max(p - 1, 0));

  return (
    <UserProvider>
      <MainLayout>
        {/* StepIndicator – felső idővonal (1-2-3) */}
        {step > 0 && step < 4 && (
          <div className="flex justify-center w-full mb-4">
            <StepIndicator currentStep={step} totalSteps={3} />
          </div>
        )}

        {/* Step 0: Hero */}
        <Card isActive={step === 0} isBack={false}>
          <Hero onStart={nextStep} onSkip={() => setStep(4)} />
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

        {/* Step 3: Program Timeline */}
        <Card isActive={step === 3} isBack={false}>
          <ProgramTimeline
            regionId={selectedRegion}
            dates={selectedDates}
            onBack={prevStep}
            onFinish={nextStep}
          />
        </Card>

        {/* Step 4: Summary */}
        <Card isActive={step === 4} isBack={false}>
          <Summary
            onContinue={() => {
              setSelectedDates([]); // Tiszta lappal indítunk, hogy új időpontot válasszon
              setStep(1);
            }}
            onRegionSelect={(regionId) => {
              setSelectedRegion(regionId);
              setStep(3);
            }}
          />
        </Card>
      </MainLayout>
    </UserProvider>
  );
}

export default App;
