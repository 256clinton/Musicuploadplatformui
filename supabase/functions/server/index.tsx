import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage bucket for audio files
const AUDIO_BUCKET = 'make-d629660d-audio';
const COVER_BUCKET = 'make-d629660d-covers';

// Create storage buckets on startup
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    // Create audio bucket if it doesn't exist
    const audioBucketExists = buckets?.some(bucket => bucket.name === AUDIO_BUCKET);
    if (!audioBucketExists) {
      await supabase.storage.createBucket(AUDIO_BUCKET, { public: false });
      console.log('Created audio storage bucket');
    }
    
    // Create cover bucket if it doesn't exist
    const coverBucketExists = buckets?.some(bucket => bucket.name === COVER_BUCKET);
    if (!coverBucketExists) {
      await supabase.storage.createBucket(COVER_BUCKET, { public: true });
      console.log('Created cover storage bucket');
    }
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
})();

// Helper function to get user from access token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization header' };
  }
  
  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return { user: null, error: error?.message || 'Invalid token' };
  }
  
  return { user: data.user, error: null };
}

// ================ AUTH ROUTES ================

// Sign up route
app.post('/make-server-d629660d/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: role || 'artist' // Default to artist role
      },
      email_confirm: true // Auto-confirm since email server isn't configured
    });

    if (authError) {
      console.error('Error creating user during signup:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      role: role || 'artist',
      createdAt: new Date().toISOString(),
      totalTracks: 0,
      totalEarnings: 0,
      totalPlays: 0
    });

    return c.json({
      user: authData.user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Sign in route
app.post('/make-server-d629660d/auth/signin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error signing in user:', error);
      return c.json({ error: error.message }, 401);
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${data.user.id}`);

    return c.json({
      accessToken: data.session.access_token,
      user: data.user,
      profile: userProfile
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Get current user
app.get('/make-server-d629660d/auth/user', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const profile = await kv.get(`user:${user.id}`);

  return c.json({
    user,
    profile
  });
});

// Sign out
app.post('/make-server-d629660d/auth/signout', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  await supabase.auth.admin.signOut(user.id);
  
  return c.json({ message: 'Signed out successfully' });
});

// ================ TRACK ROUTES ================

// Check upload eligibility (free limit check)
app.get('/make-server-d629660d/upload/check', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${user.id}`);
    const totalTracks = userProfile?.totalTracks || 0;
    const paidUploads = userProfile?.paidUploads || 0;
    
    const FREE_UPLOAD_LIMIT = 2;
    const freeUploadsUsed = Math.min(totalTracks - paidUploads, FREE_UPLOAD_LIMIT);
    const freeUploadsRemaining = Math.max(FREE_UPLOAD_LIMIT - freeUploadsUsed, 0);
    const requiresPayment = freeUploadsRemaining === 0;

    return c.json({ 
      totalTracks,
      freeUploadsUsed,
      freeUploadsRemaining,
      requiresPayment,
      paidUploads
    });
  } catch (error) {
    console.error('Error checking upload eligibility:', error);
    return c.json({ error: 'Failed to check eligibility' }, 500);
  }
});

// ================ PAYMENT ROUTES ================

// Initialize Flutterwave payment for mobile money
app.post('/make-server-d629660d/payment/initiate', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { phone_number, network, amount, currency, plan, description } = body;

    if (!phone_number || !network || !amount) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const tx_ref = `TX-${Date.now()}-${user.id.substring(0, 8)}`;
    
    // Call Flutterwave API
    const flutterwaveUrl = 'https://api.flutterwave.com/v3/charges?type=mobile_money_uganda';
    const payload = {
      tx_ref,
      amount: amount.toString(),
      currency: currency || 'UGX',
      network,
      email: user.email || `${user.id}@adisamusic.ug`,
      phone_number,
      fullname: user.user_metadata?.name || 'Adisa Music User',
      redirect_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-d629660d/payment/callback`,
    };

    console.log('Initiating Flutterwave payment:', { tx_ref, amount, network, phone_number });

    const response = await fetch(flutterwaveUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok || data.status !== 'success') {
      console.error('Flutterwave payment initiation failed:', data);
      return c.json({ 
        error: data.message || 'Payment initiation failed',
        details: data
      }, 400);
    }

    // Store transaction in KV store
    await kv.set(`transaction:${tx_ref}`, {
      userId: user.id,
      tx_ref,
      amount,
      currency: currency || 'UGX',
      network,
      phone_number,
      plan,
      description,
      status: 'pending',
      flw_ref: data.data?.flw_ref,
      createdAt: new Date().toISOString(),
    });

    console.log('Payment initiated successfully:', tx_ref);

    return c.json({ 
      status: 'success',
      message: 'Payment initiated successfully',
      tx_ref,
      flw_ref: data.data?.flw_ref,
      link: data.data?.link,
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return c.json({ error: 'Failed to initiate payment' }, 500);
  }
});

// Verify Flutterwave payment
app.post('/make-server-d629660d/payment/verify', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { tx_ref } = body;

    if (!tx_ref) {
      return c.json({ error: 'Transaction reference is required' }, 400);
    }

    // Get transaction from KV store
    const transaction = await kv.get(`transaction:${tx_ref}`);
    
    if (!transaction || transaction.userId !== user.id) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    // Verify with Flutterwave
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;
    
    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok || data.status !== 'success') {
      console.error('Flutterwave verification failed:', data);
      return c.json({ 
        status: 'pending',
        message: 'Payment verification pending'
      });
    }

    const paymentStatus = data.data?.status;
    const isSuccessful = paymentStatus === 'successful';

    // Update transaction status
    await kv.set(`transaction:${tx_ref}`, {
      ...transaction,
      status: isSuccessful ? 'completed' : paymentStatus,
      verifiedAt: new Date().toISOString(),
      flw_data: data.data,
    });

    // If payment is successful, update user's paid uploads count
    if (isSuccessful) {
      const userProfile = await kv.get(`user:${user.id}`);
      await kv.set(`user:${user.id}`, {
        ...userProfile,
        paidUploads: (userProfile?.paidUploads || 0) + 1,
      });
    }

    return c.json({ 
      status: isSuccessful ? 'success' : 'pending',
      message: isSuccessful ? 'Payment verified successfully' : 'Payment pending',
      payment_status: paymentStatus,
      data: data.data,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return c.json({ error: 'Failed to verify payment' }, 500);
  }
});

// Payment callback (webhook)
app.post('/make-server-d629660d/payment/callback', async (c) => {
  try {
    const body = await c.req.json();
    const { tx_ref, status, transaction_id } = body;

    console.log('Payment callback received:', { tx_ref, status, transaction_id });

    if (!tx_ref) {
      return c.json({ error: 'Missing transaction reference' }, 400);
    }

    // Get transaction from KV store
    const transaction = await kv.get(`transaction:${tx_ref}`);
    
    if (!transaction) {
      console.error('Transaction not found for callback:', tx_ref);
      return c.json({ error: 'Transaction not found' }, 404);
    }

    // Update transaction status
    await kv.set(`transaction:${tx_ref}`, {
      ...transaction,
      status: status === 'successful' ? 'completed' : status,
      callbackAt: new Date().toISOString(),
      transaction_id,
    });

    // If payment is successful, update user's paid uploads count
    if (status === 'successful') {
      const userProfile = await kv.get(`user:${transaction.userId}`);
      await kv.set(`user:${transaction.userId}`, {
        ...userProfile,
        paidUploads: (userProfile?.paidUploads || 0) + 1,
      });
    }

    return c.json({ status: 'success', message: 'Callback processed' });
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return c.json({ error: 'Failed to process callback' }, 500);
  }
});

// Upload track (create submission)
app.post('/make-server-d629660d/tracks', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { title, artist, genre, coverUrl, audioUrl, duration, plan, amount, platforms, isPaid } = body;

    if (!title || !artist || !genre) {
      return c.json({ error: 'Title, artist, and genre are required' }, 400);
    }

    // Check upload eligibility
    const userProfile = await kv.get(`user:${user.id}`);
    const totalTracks = userProfile?.totalTracks || 0;
    const paidUploads = userProfile?.paidUploads || 0;
    const FREE_UPLOAD_LIMIT = 2;
    const freeUploadsUsed = totalTracks - paidUploads;
    
    // If user has used their free uploads and this is not a paid upload, reject
    if (freeUploadsUsed >= FREE_UPLOAD_LIMIT && !isPaid) {
      return c.json({ 
        error: 'Free upload limit reached. Please complete payment to upload more tracks.',
        requiresPayment: true 
      }, 403);
    }

    const trackId = `track:${Date.now()}:${user.id}`;
    const track = {
      id: trackId,
      userId: user.id,
      title,
      artist,
      genre,
      coverUrl: coverUrl || '',
      duration: duration || '3:30',
      plan: plan || 'single',
      amount: amount || '15,000 UGX',
      platforms: platforms || [],
      status: 'pending',
      plays: 0,
      earnings: '0 UGX',
      uploadDate: new Date().toISOString(),
      approvedDate: null,
      distributedDate: null
    };

    await kv.set(trackId, track);

    // Update user track count
    if (userProfile) {
      userProfile.totalTracks = (userProfile.totalTracks || 0) + 1;
      if (isPaid) {
        userProfile.paidUploads = (userProfile.paidUploads || 0) + 1;
      }
      await kv.set(`user:${user.id}`, userProfile);
    }

    return c.json({ track });
  } catch (error) {
    console.error('Error uploading track:', error);
    return c.json({ error: 'Failed to upload track' }, 500);
  }
});

// Get all tracks (admin only)
app.get('/make-server-d629660d/tracks/all', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const tracks = await kv.getByPrefix('track:');
    return c.json({ tracks });
  } catch (error) {
    console.error('Error fetching all tracks:', error);
    return c.json({ error: 'Failed to fetch tracks' }, 500);
  }
});

// Get user's tracks
app.get('/make-server-d629660d/tracks/my', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const allTracks = await kv.getByPrefix('track:');
    const userTracks = allTracks.filter((track: any) => track.userId === user.id);
    return c.json({ tracks: userTracks });
  } catch (error) {
    console.error('Error fetching user tracks:', error);
    return c.json({ error: 'Failed to fetch tracks' }, 500);
  }
});

// Update track status (admin only)
app.patch('/make-server-d629660d/tracks/:id/status', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const trackId = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;

    const track = await kv.get(trackId);
    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }

    track.status = status;
    if (status === 'approved') {
      track.approvedDate = new Date().toISOString();
    } else if (status === 'distributed') {
      track.distributedDate = new Date().toISOString();
    }

    await kv.set(trackId, track);

    return c.json({ track });
  } catch (error) {
    console.error('Error updating track status:', error);
    return c.json({ error: 'Failed to update track' }, 500);
  }
});

// ================ USER ROUTES ================

// Get all users (admin only)
app.get('/make-server-d629660d/users', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Get user profile
app.get('/make-server-d629660d/users/:id', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const userId = c.req.param('id');
    
    // Users can only view their own profile unless they're admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (userId !== user.id && userProfile?.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// ================ STATS ROUTES ================

// Get dashboard stats (admin only)
app.get('/make-server-d629660d/stats/admin', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const tracks = await kv.getByPrefix('track:');
    const users = await kv.getByPrefix('user:');

    const stats = {
      totalTracks: tracks.length,
      pendingReviews: tracks.filter((t: any) => t.status === 'pending').length,
      activeUsers: users.filter((u: any) => u.role === 'artist').length,
      totalRevenue: tracks.reduce((sum: number, t: any) => {
        const amount = parseInt(t.amount?.replace(/[^\d]/g, '') || '0');
        return sum + amount;
      }, 0),
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// ================ ADS ROUTES ================

// Create ad (admin only)
app.post('/make-server-d629660d/ads', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const body = await c.req.json();
    const { title, description, imageUrl, linkUrl, isActive } = body;

    if (!title || !imageUrl) {
      return c.json({ error: 'Title and image URL are required' }, 400);
    }

    const adId = `ad:${Date.now()}`;
    const ad = {
      id: adId,
      title,
      description: description || '',
      imageUrl,
      linkUrl: linkUrl || '',
      isActive: isActive !== undefined ? isActive : true,
      clicks: 0,
      impressions: 0,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    await kv.set(adId, ad);

    return c.json({ ad });
  } catch (error) {
    console.error('Error creating ad:', error);
    return c.json({ error: 'Failed to create ad' }, 500);
  }
});

// Get all ads (admin gets all, public gets active only)
app.get('/make-server-d629660d/ads', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { user } = await getUserFromToken(authHeader);
    
    const allAds = await kv.getByPrefix('ad:');
    
    // If admin, return all ads; otherwise return only active ads
    if (user) {
      const userProfile = await kv.get(`user:${user.id}`);
      if (userProfile?.role === 'admin') {
        return c.json({ ads: allAds });
      }
    }
    
    // Public or non-admin users only see active ads
    const activeAds = allAds.filter((ad: any) => ad.isActive);
    return c.json({ ads: activeAds });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return c.json({ error: 'Failed to fetch ads' }, 500);
  }
});

// Update ad (admin only)
app.patch('/make-server-d629660d/ads/:id', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const adId = c.req.param('id');
    const body = await c.req.json();

    const ad = await kv.get(adId);
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404);
    }

    // Update ad fields
    const updatedAd = {
      ...ad,
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };

    await kv.set(adId, updatedAd);

    return c.json({ ad: updatedAd });
  } catch (error) {
    console.error('Error updating ad:', error);
    return c.json({ error: 'Failed to update ad' }, 500);
  }
});

// Delete ad (admin only)
app.delete('/make-server-d629660d/ads/:id', async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  try {
    const adId = c.req.param('id');
    const ad = await kv.get(adId);
    
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404);
    }

    await kv.del(adId);

    return c.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return c.json({ error: 'Failed to delete ad' }, 500);
  }
});

// Track ad click
app.post('/make-server-d629660d/ads/:id/click', async (c) => {
  try {
    const adId = c.req.param('id');
    const ad = await kv.get(adId);
    
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404);
    }

    ad.clicks = (ad.clicks || 0) + 1;
    await kv.set(adId, ad);

    return c.json({ message: 'Click tracked' });
  } catch (error) {
    console.error('Error tracking click:', error);
    return c.json({ error: 'Failed to track click' }, 500);
  }
});

// Track ad impression
app.post('/make-server-d629660d/ads/:id/impression', async (c) => {
  try {
    const adId = c.req.param('id');
    const ad = await kv.get(adId);
    
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404);
    }

    ad.impressions = (ad.impressions || 0) + 1;
    await kv.set(adId, ad);

    return c.json({ message: 'Impression tracked' });
  } catch (error) {
    console.error('Error tracking impression:', error);
    return c.json({ error: 'Failed to track impression' }, 500);
  }
});

// Health check
app.get('/make-server-d629660d/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);