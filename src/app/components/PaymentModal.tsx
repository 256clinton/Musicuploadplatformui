import { X, CreditCard, Smartphone, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { projectId } from '../../../utils/supabase/info';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  amount: string;
  description: string;
  plan?: string;
}

export function PaymentModal({ isOpen, onClose, onPaymentComplete, amount, description, plan }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card' | 'bank'>('mobile');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<'MTN' | 'Airtel'>('MTN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [txRef, setTxRef] = useState('');

  if (!isOpen) return null;

  // Convert amount string to number (e.g., "15,000 UGX" -> 15000)
  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setError('Please log in to continue');
      setIsProcessing(false);
      return;
    }

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;

      if (paymentMethod === 'mobile') {
        // Format phone number to international format
        let formattedPhone = phoneNumber.trim();
        if (!formattedPhone.startsWith('256')) {
          if (formattedPhone.startsWith('0')) {
            formattedPhone = '256' + formattedPhone.substring(1);
          } else if (formattedPhone.startsWith('+256')) {
            formattedPhone = formattedPhone.substring(1);
          } else {
            formattedPhone = '256' + formattedPhone;
          }
        }

        // Validate phone number
        if (formattedPhone.length !== 12) {
          setError('Invalid phone number. Please enter a valid 10-digit number (e.g., 0772123456)');
          setIsProcessing(false);
          return;
        }

        const response = await fetch(`${apiUrl}/payment/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            phone_number: formattedPhone,
            network: provider === 'MTN' ? 'MTN' : 'AIRTEL',
            amount: numericAmount,
            currency: 'UGX',
            plan: plan || 'single',
            description: description
          })
        });

        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
          throw new Error(data.error || 'Payment initiation failed');
        }

        setTxRef(data.tx_ref);

        // Start polling for payment status
        pollPaymentStatus(data.tx_ref, accessToken);

      } else {
        // For card and bank, simulate success for now
        setTimeout(() => {
          setPaymentSuccess(true);
          setTimeout(() => {
            onPaymentComplete();
            onClose();
          }, 2000);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (tx_ref: string, accessToken: string) => {
    const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
    let attempts = 0;
    const maxAttempts = 40; // Poll for up to 2 minutes (40 * 3 seconds)

    const poll = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`${apiUrl}/payment/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ tx_ref })
        });

        const data = await response.json();

        if (data.status === 'success') {
          clearInterval(poll);
          setIsProcessing(false);
          setPaymentSuccess(true);
          
          setTimeout(() => {
            onPaymentComplete();
            onClose();
          }, 2000);
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsProcessing(false);
          setError('Payment verification timeout. Please check your transaction status in your dashboard.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsProcessing(false);
          setError('Payment verification failed. Please contact support if money was deducted.');
        }
      }
    }, 3000); // Poll every 3 seconds
  };

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600">
            You can now upload additional tracks to distribute worldwide.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-red-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Complete Payment</h2>
            <p className="text-sm opacity-90">Secure payment processing</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">{description}</p>
            <p className="text-3xl font-bold text-gray-900">{amount}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {isProcessing && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <p className="font-semibold text-blue-900">Processing Payment...</p>
              </div>
              <p className="text-sm text-blue-800">
                💡 Check your phone and enter your {provider} Mobile Money PIN to approve the payment of <strong>{amount}</strong>
              </p>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('mobile')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'mobile'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-semibold">Mobile Money</p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'card'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-semibold">Card</p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-semibold">Bank Transfer</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Money Form */}
            {paymentMethod === 'mobile' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Network
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProvider('MTN')}
                      disabled={isProcessing}
                      className={`p-3 border-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                        provider === 'MTN'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      📱 MTN Mobile Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setProvider('Airtel')}
                      disabled={isProcessing}
                      className={`p-3 border-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                        provider === 'Airtel'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      📱 Airtel Money
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0772 123 456"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your {provider} number (e.g., 0772123456)
                  </p>
                </div>
              </>
            )}

            {/* Credit/Debit Card Form */}
            {paymentMethod === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Bank Transfer Form */}
            {paymentMethod === 'bank' && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Bank Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-semibold">Stanbic Bank Uganda</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-semibold">Adisa Music Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-semibold">9030015678234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-lg">{amount}</span>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Please send payment proof to support@adisamusic.ug after transfer
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${amount}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
