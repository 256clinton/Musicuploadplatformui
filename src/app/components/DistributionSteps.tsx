import { CheckCircle2, Circle } from 'lucide-react';

interface DistributionStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Release Info', description: 'Track details and upload' },
  { number: 2, title: 'Platforms', description: 'Distribution channels' },
  { number: 3, title: 'Metadata', description: 'Credits and artwork' },
  { number: 4, title: 'Payment', description: 'Choose your plan' },
  { number: 5, title: 'Review', description: 'Submit for distribution' },
];

export function DistributionSteps({ currentStep }: DistributionStepsProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                currentStep > step.number
                  ? 'bg-green-500 border-green-500'
                  : currentStep === step.number
                  ? 'bg-red-600 border-red-600'
                  : 'bg-white border-gray-300'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <span className={`font-bold ${
                    currentStep === step.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.number}
                  </span>
                )}
              </div>
              <div className="text-center mt-2">
                <p className={`text-sm font-semibold ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 -mt-10 ${
                currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
