import { Check, Zap, Star, Crown } from 'lucide-react';

interface PaymentPlansProps {
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
}

const plans = [
  {
    id: 'single',
    name: 'Single Track',
    price: '15,000',
    currency: 'UGX',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    features: [
      'Distribute 1 track',
      'All major platforms',
      'Keep 100% royalties',
      'Basic analytics',
      'Release within 48 hours',
    ],
  },
  {
    id: 'album',
    name: 'EP/Album',
    price: '45,000',
    currency: 'UGX',
    icon: Star,
    color: 'from-yellow-500 to-red-600',
    popular: true,
    features: [
      'Distribute up to 10 tracks',
      'All major platforms',
      'Keep 100% royalties',
      'Advanced analytics',
      'Priority distribution',
      'Release within 24 hours',
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited Plan',
    price: '120,000',
    currency: 'UGX',
    period: '/year',
    icon: Crown,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Unlimited tracks & albums',
      'All major platforms',
      'Keep 100% royalties',
      'Premium analytics',
      'Instant distribution',
      'Release within 12 hours',
      'Priority support',
      'Custom label name',
    ],
  },
];

export function PaymentPlans({ selectedPlan, onSelectPlan }: PaymentPlansProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2 text-lg">Choose Your Plan</h3>
      <p className="text-sm text-gray-600 mb-6">
        One-time payment • No hidden fees • Keep all your earnings
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? 'border-green-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => onSelectPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-500 to-red-600 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.currency}</span>
                  {plan.period && (
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className={`w-6 h-6 rounded-full border-2 transition-all mx-auto ${
                  selectedPlan === plan.id
                    ? 'border-green-500 bg-green-500 flex items-center justify-center'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === plan.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>💳 Payment Methods:</strong> Mobile Money (MTN, Airtel), Bank Transfer, Credit/Debit Card
        </p>
      </div>
    </div>
  );
}
