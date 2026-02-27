import { useState } from 'react';
import { Music2, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function Login() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;

      if (isSignUp) {
        // Sign up
        const response = await fetch(`${apiUrl}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email,
            password,
            name,
            role: isAdmin ? 'admin' : 'artist'
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sign up');
        }

        // After signup, automatically sign in
        const signInResponse = await fetch(`${apiUrl}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password })
        });

        const signInData = await signInResponse.json();

        if (!signInResponse.ok) {
          throw new Error(signInData.error || 'Failed to sign in after signup');
        }

        // Store auth data
        localStorage.setItem('accessToken', signInData.accessToken);
        localStorage.setItem('user', JSON.stringify(signInData.user));
        localStorage.setItem('userProfile', JSON.stringify(signInData.profile));

        // Navigate based on role
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Sign in
        const response = await fetch(`${apiUrl}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sign in');
        }

        // Store auth data
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userProfile', JSON.stringify(data.profile));

        // Navigate based on role
        if (data.profile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-500 via-red-600 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Adisa Music</h1>
          <p className="text-gray-600 mt-2">Global Distribution Platform</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              !isSignUp
                ? 'bg-gradient-to-r from-yellow-500 to-red-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              isSignUp
                ? 'bg-gradient-to-r from-yellow-500 to-red-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {isSignUp && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isAdmin
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Artist
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isAdmin
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Admin
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>{isSignUp ? 'Create Account' : 'Sign In'}</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}