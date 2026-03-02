Step 1: Create Flutterwave Account
Go to Flutterwave Developer Portal

Sign up for a free account

Verify your email and business information

Access your dashboard at dashboard.flutterwave.com

Step 2: Get API Credentials
From your dashboard:

Navigate to Settings → API Keys

Copy the following:

PUBLIC_KEY

SECRET_KEY

ENCRYPTION_KEY

Save them in your .env file:

env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_ENCRYPTION_KEY=your-encryption-key
FLUTTERWAVE_ENVIRONMENT=sandbox  # Change to 'live' for production
Step 3: Install Flutterwave SDK
bash
npm install flutterwave-node-v3
# or
yarn add flutterwave-node-v3
Step 4: Create Payment Service
Create src/services/flutterwave.service.ts:

typescript
import Flutterwave from 'flutterwave-node-v3';

export interface MobileMoneyPaymentRequest {
  phone_number: string;
  network: 'MTN' | 'AIRTEL';
  amount: number;
  currency: 'UGX';
  email: string;
  tx_ref: string;
  fullname?: string;
}

export interface PaymentResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
  };
}

class FlutterwaveService {
  private flw: any;

  constructor() {
    this.flw = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY,
      process.env.FLUTTERWAVE_ENCRYPTION_KEY
    );
  }

  /**
   * Initialize a mobile money payment
   */
  async initiateMobileMoneyPayment(
    paymentData: MobileMoneyPaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const payload = {
        phone_number: paymentData.phone_number,
        network: paymentData.network,
        amount: paymentData.amount,
        currency: paymentData.currency,
        email: paymentData.email,
        tx_ref: paymentData.tx_ref,
        fullname: paymentData.fullname || 'Customer',
      };

      const response = await this.flw.MobileMoney.uganda(payload);
      
      return {
        status: 'success',
        message: 'Payment initiated successfully',
        data: response,
      };
    } catch (error: any) {
      console.error('Flutterwave payment error:', error);
      return {
        status: 'error',
        message: error.message || 'Payment initiation failed',
      };
    }
  }

  /**
   * Verify a transaction
   */
  async verifyTransaction(tx_ref: string): Promise<PaymentResponse> {
    try {
      const response = await this.flw.Transaction.verify({ id: tx_ref });
      
      return {
        status: 'success',
        message: 'Transaction verified',
        data: response,
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Generate unique transaction reference
   */
  generateTransactionReference(): string {
    return `TX-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
}

export const flutterwaveService = new FlutterwaveService();
Step 5: Create Payment Component
Create src/app/components/MobileMoneyPayment.tsx:

typescript
import { useState } from 'react';
import { flutterwaveService } from '@/services/flutterwave.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Smartphone } from 'lucide-react';

interface MobileMoneyPaymentProps {
  amount: number;
  planName: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export const MobileMoneyPayment = ({ 
  amount, 
  planName, 
  onSuccess, 
  onClose 
}: MobileMoneyPaymentProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState<'MTN' | 'AIRTEL'>('MTN');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'otp'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to continue',
        variant: 'destructive',
      });
      return;
    }

    // Validate phone number (Ugandan format)
    const ugandaPhoneRegex = /^256[0-9]{9}$/;
    if (!ugandaPhoneRegex.test(phoneNumber)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid Ugandan phone number (format: 256XXXXXXXXX)',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      const tx_ref = flutterwaveService.generateTransactionReference();
      
      const response = await flutterwaveService.initiateMobileMoneyPayment({
        phone_number: phoneNumber,
        network,
        amount,
        currency: 'UGX',
        email: user.email || '',
        tx_ref,
        fullname: profile?.full_name || 'Customer',
      });

      if (response.status === 'success') {
        setStep('otp');
        toast({
          title: 'Payment initiated',
          description: `Please check your phone for the payment prompt on ${network}`,
        });
        
        // In production, you would set up webhook to confirm payment
        // For demo, we'll simulate success after 10 seconds
        setTimeout(() => {
          onSuccess(tx_ref);
          toast({
            title: 'Payment successful!',
            description: `Your ${planName} subscription is now active.`,
          });
          onClose();
        }, 10000);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2">Mobile Money Payment</h2>
      <p className="text-gray-600 mb-6">
        Pay {amount.toLocaleString()} UGX for {planName} plan
      </p>

      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Network
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNetwork('MTN')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  network === 'MTN'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300'
                }`}
              >
                <div className="w-10 h-10 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">MTN</span>
              </button>
              
              <button
                type="button"
                onClick={() => setNetwork('AIRTEL')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  network === 'AIRTEL'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="w-10 h-10 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">AIRTEL</span>
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="256XXXXXXXXX"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your MTN or Airtel number with country code (e.g., 256772123456)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay ${amount.toLocaleString()} UGX`
            )}
          </button>
        </form>
      )}

      {step === 'processing' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Initiating Payment</h3>
          <p className="text-gray-600">
            Please wait while we connect to {network}...
          </p>
        </div>
      )}

      {step === 'otp' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Check Your Phone</h3>
          <p className="text-gray-600 mb-4">
            Enter your PIN on the {network} prompt to complete payment
          </p>
          <p className="text-sm text-gray-500">
            Waiting for confirmation... This may take a few moments
          </p>
        </div>
      )}
    </div>
  );
};
Step 6: Set Up Webhook Handler
Create an API route to handle Flutterwave webhooks. For Supabase Edge Functions, create supabase/functions/flutterwave-webhook/index.ts:

typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface WebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
    customer: {
      email: string;
      phone_number: string;
    };
  };
}

serve(async (req: Request) => {
  try {
    // Verify webhook signature (implement proper verification)
    const signature = req.headers.get('verif-hash');
    
    // Parse payload
    const payload: WebhookPayload = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Handle different webhook events
    switch (payload.event) {
      case 'charge.completed':
        if (payload.data.status === 'successful') {
          // Update transaction status in database
          await supabaseClient
            .from('transactions')
            .update({ 
              status: 'completed',
              flutterwave_reference: payload.data.flw_ref,
              completed_at: new Date().toISOString()
            })
            .eq('reference', payload.data.tx_ref);

          // Activate subscription
          await supabaseClient
            .from('profiles')
            .update({ 
              subscription_status: 'active',
              subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('email', payload.data.customer.email);
        }
        break;

      case 'charge.failed':
        await supabaseClient
          .from('transactions')
          .update({ status: 'failed' })
          .eq('reference', payload.data.tx_ref);
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
Step 7: Update Pricing Section to Use Mobile Money
Modify your PricingSection.tsx to include the mobile money payment option:

typescript
// Add this to your PricingSection component
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [selectedPlan, setSelectedPlan] = useState<any>(null);

const handleMobileMoneyPayment = (plan: any) => {
  setSelectedPlan(plan);
  setShowPaymentModal(true);
};

// In your plan card button, add:
<Button 
  variant={plan.buttonVariant} 
  className="w-full"
  onClick={() => handleMobileMoneyPayment(plan)}
>
  Pay with Mobile Money
</Button>

// Add modal
{showPaymentModal && selectedPlan && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <MobileMoneyPayment
      amount={parseInt(selectedPlan.price.replace(/[^0-9]/g, ''))}
      planName={selectedPlan.name}
      onSuccess={(reference) => {
        // Handle success
        setShowPaymentModal(false);
        // Refresh subscription status
      }}
      onClose={() => setShowPaymentModal(false)}
    />
  </div>
)}
🚀 Option 2: Direct MTN MoMo API Integration (Advanced)
If you prefer direct integration, here's how to work with MTN's API directly.

Step 1: Register as MTN Developer
Go to MTN MoMo Developer Portal

Create an account and verify your email

Apply for access to the Collections product

Wait for approval (can take several days)

Step 2: Get API Credentials
Once approved, you'll receive:

Primary Key (Subscription key)

Secondary Key

API User ID (after creation)

Step 3: Create MTN MoMo Service
Install dependencies:

bash
npm install axios uuid
Create src/services/mtn-momo.service.ts:

typescript
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface MtnConfig {
  baseUrl: string;
  primaryKey: string;
  secondaryKey: string;
  callbackHost: string;
  environment: 'sandbox' | 'production';
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class MtnMomoService {
  private config: MtnConfig;
  private apiUser: string | null = null;
  private apiKey: string | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: MtnConfig) {
    this.config = config;
  }

  /**
   * Step 1: Create API User
   */
  async createApiUser(): Promise<string> {
    const referenceId = uuidv4();
    
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v1_0/apiuser`,
        {
          providerCallbackHost: this.config.callbackHost,
        },
        {
          headers: {
            'X-Reference-Id': referenceId,
            'Ocp-Apim-Subscription-Key': this.config.primaryKey,
            'Content-Type': 'application/json',
          },
        }
      );

      this.apiUser = referenceId;
      
      // Store API User ID securely
      await this.storeCredentials('api_user', referenceId);
      
      return referenceId;
    } catch (error: any) {
      throw new Error(`Failed to create API User: ${error.message}`);
    }
  }

  /**
   * Step 2: Create API Key
   */
  async createApiKey(apiUser: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v1_0/apiuser/${apiUser}/apikey`,
        {},
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.config.primaryKey,
          },
        }
      );

      this.apiKey = response.data.apiKey;
      
      // Store API Key securely
      await this.storeCredentials('api_key', this.apiKey);
      
      return this.apiKey;
    } catch (error: any) {
      throw new Error(`Failed to create API Key: ${error.message}`);
    }
  }

  /**
   * Step 3: Get OAuth Token
   */
  async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    if (!this.apiUser || !this.apiKey) {
      await this.loadCredentials();
    }

    const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');

    try {
      const response = await axios.post<TokenResponse>(
        `${this.config.baseUrl}/collection/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Ocp-Apim-Subscription-Key': this.config.primaryKey,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error: any) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Step 4: Request to Pay
   */
  async requestToPay(
    amount: number,
    currency: string,
    phoneNumber: string,
    externalId: string,
    payerMessage: string = 'Payment for services',
    payeeNote: string = 'Thank you for your payment'
  ): Promise<string> {
    const referenceId = uuidv4();
    const token = await this.getAccessToken();

    // Format phone number (should include country code)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber}`;

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/collection/v1_0/requesttopay`,
        {
          amount: amount.toString(),
          currency,
          externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: formattedPhone,
          },
          payerMessage,
          payeeNote,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': this.config.environment === 'production' ? 'production' : 'sandbox',
            'Ocp-Apim-Subscription-Key': this.config.primaryKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 202) {
        return referenceId;
      } else {
        throw new Error('Payment request failed');
      }
    } catch (error: any) {
      throw new Error(`Request to pay failed: ${error.message}`);
    }
  }

  /**
   * Step 5: Get Transaction Status
   */
  async getTransactionStatus(referenceId: string): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.config.environment === 'production' ? 'production' : 'sandbox',
            'Ocp-Apim-Subscription-Key': this.config.primaryKey,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Get Account Balance
   */
  async getBalance(): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.config.baseUrl}/collection/v1_0/account/balance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.config.environment === 'production' ? 'production' : 'sandbox',
            'Ocp-Apim-Subscription-Key': this.config.primaryKey,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Check if account is active
   */
  async isAccountActive(phoneNumber: string): Promise<boolean> {
    const token = await this.getAccessToken();
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    try {
      const response = await axios.get(
        `${this.config.baseUrl}/collection/v1_0/accountholder/msisdn/${formattedPhone}/active`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.config.environment === 'production' ? 'production' : 'sandbox',
            'Ocp-Apim-Subscription-Key': this.config.primaryKey,
          },
        }
      );

      return response.data.result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Store credentials securely (implement with your database)
   */
  private async storeCredentials(key: string, value: string): Promise<void> {
    // Store in your database or secure storage
    console.log(`Storing ${key} securely`);
  }

  /**
   * Load stored credentials
   */
  private async loadCredentials(): Promise<void> {
    // Load from your database
    // this.apiUser = stored value
    // this.apiKey = stored value
  }
}
Step 6: Initialize MTN Service
Create src/config/mtn.config.ts:

typescript
import { MtnMomoService } from '@/services/mtn-momo.service';

const mtnConfig = {
  baseUrl: process.env.MTN_API_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
  primaryKey: process.env.MTN_PRIMARY_KEY || '',
  secondaryKey: process.env.MTN_SECONDARY_KEY || '',
  callbackHost: process.env.MTN_CALLBACK_HOST || 'your-domain.com',
  environment: (process.env.MTN_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
};

export const mtnMomoService = new MtnMomoService(mtnConfig);
🚀 Option 3: Direct Airtel Money API Integration
Step 1: Register as Airtel Developer
Go to Airtel Africa Developer Portal

Create an account

Apply for API access

Get your client_id and client_secret

Step 2: Install Airtel SDK
bash
npm install airtelmoney
# or
yarn add airtelmoney
Step 3: Create Airtel Service
Create src/services/airtel-money.service.ts:

typescript
import axios from 'axios';

interface AirtelConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  country: string;
  currency: string;
  grantType: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class AirtelMoneyService {
  private config: AirtelConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: AirtelConfig) {
    this.config = config;
  }

  /**
   * Get OAuth token
   */
  async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    try {
      const response = await axios.post<TokenResponse>(
        `${this.config.baseUrl}/auth/oauth2/token`,
        {
          grant_type: this.config.grantType,
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error: any) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Initiate payment collection
   */
  async initiatePayment(
    amount: number,
    phoneNumber: string,
    reference: string,
    transactionId?: string
  ): Promise<any> {
    const token = await this.getAccessToken();
    const txnId = transactionId || `TXN${Date.now()}`;

    // Format phone number (remove country code if present)
    const formattedPhone = phoneNumber.replace('+256', '').replace('256', '');

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/merchant/v1/payments/`,
        {
          reference,
          subscriber: {
            country: this.config.country,
            currency: this.config.currency,
            msisdn: formattedPhone,
          },
          transaction: {
            amount,
            country: this.config.country,
            currency: this.config.currency,
            id: txnId,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Country': this.config.country,
            'X-Currency': this.config.currency,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Payment initiation failed: ${error.message}`);
    }
  }

  /**
   * Check transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.config.baseUrl}/standard/v1/payments/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Country': this.config.country,
            'X-Currency': this.config.currency,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Disburse money (payout)
   */
  async disburseMoney(
    amount: number,
    phoneNumber: string,
    transactionId: string
  ): Promise<any> {
    const token = await this.getAccessToken();
    const formattedPhone = phoneNumber.replace('+256', '').replace('256', '');

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/merchant/v1/disburse/`,
        {
          transactionId,
          amount,
          currency: this.config.currency,
          country: this.config.country,
          subscriber: {
            msisdn: formattedPhone,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Country': this.config.country,
            'X-Currency': this.config.currency,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Disbursement failed: ${error.message}`);
    }
  }
}
📝 Complete Payment Flow for Your App
Here's how to integrate everything into your existing subscription flow:

1. Create Transaction Table in Supabase
Run this SQL:

sql
-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  reference TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'UGX',
  payment_method TEXT NOT NULL, -- 'mtn', 'airtel', 'flutterwave'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  phone_number TEXT,
  network TEXT,
  flutterwave_reference TEXT,
  mtn_reference TEXT,
  airtel_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Create index for lookups
CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
2. Create Unified Payment Hook
Create src/hooks/useMobileMoneyPayment.ts:

typescript
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface PaymentOptions {
  amount: number;
  phoneNumber: string;
  network: 'MTN' | 'AIRTEL';
  planName: string;
  planType: 'listener' | 'artist' | 'pro_artist';
}

export const useMobileMoneyPayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const initiatePayment = async (options: PaymentOptions) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to continue',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);

    try {
      // Generate unique reference
      const reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

      // Create transaction record
      const { data: transaction, error: dbError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          reference,
          amount: options.amount,
          payment_method: options.network.toLowerCase(),
          phone_number: options.phoneNumber,
          network: options.network,
          status: 'pending',
          metadata: {
            plan_name: options.planName,
            plan_type: options.planType,
          },
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Call your backend API to initiate payment
      const response = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          reference,
          amount: options.amount,
          phoneNumber: options.phoneNumber,
          network: options.network,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment initiation failed');
      }

      toast({
        title: 'Payment initiated',
        description: `Please check your phone for the ${options.network} prompt`,
      });

      return {
        reference,
        transaction,
        ...result,
      };
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (reference: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference', reference)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  };

  return {
    initiatePayment,
    checkPaymentStatus,
    loading,
  };
};
3. Environment Variables (.env)
env
# Flutterwave (Recommended)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_ENCRYPTION_KEY=your-encryption-key
FLUTTERWAVE_ENVIRONMENT=sandbox

# MTN Direct (if using)
MTN_API_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_PRIMARY_KEY=your-primary-key
MTN_SECONDARY_KEY=your-secondary-key
MTN_CALLBACK_HOST=your-domain.com
MTN_ENVIRONMENT=sandbox

# Airtel Direct (if using)
AIRTEL_CLIENT_ID=your-client-id
AIRTEL_CLIENT_SECRET=your-client-secret
AIRTEL_API_BASE_URL=https://openapi.airtel.africa
AIRTEL_COUNTRY=UG
AIRTEL_CURRENCY=UGX
🎯 Testing Checklist
Sandbox Testing
Create test accounts on developer portals

Use test phone numbers (MTN sandbox provides test numbers)

Simulate successful payments

Test failure scenarios

Verify webhook handling

Production Readiness
Complete KYC verification

Submit production access requests

Configure production webhook endpoints

Set up proper error logging

Implement idempotency for retries

Add comprehensive monitoring

🔒 Security Best Practices
Never store API keys in client-side code

Always verify webhook signatures

Use HTTPS for all API calls

Implement rate limiting

Log all transactions for audit

Encrypt sensitive data at rest

Regular security audits

📚 Resources
Flutterwave Uganda Documentation 

MTN MoMo API Documentation 

Airtel Developer Portal

For your Adisa Music Platform, I strongly recommend starting with Flutterwave as it provides the fastest path to production with support for both MTN and Airtel through a single, well-documented API . Once your user base grows, you can consider direct integrations for lower fees.

This response is AI-generated, for reference only.

