// API endpoint for user registration
// This will store user data and handle referral rewards

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, referralCode } = req.body;

    // Validate required fields
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    // Validate phone number (Saudi format)
    const phoneRegex = /^(05|5)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'رقم الجوال غير صحيح' });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
    }

    // Generate unique user ID and referral code
    const userId = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userReferralCode = generateReferralCode();

    // Calculate subscription expiry (1 month free for standard plan)
    const subscriptionExpiry = new Date();
    subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1);

    // Prepare user data
    const userData = {
      userId,
      name,
      phone: phone.replace(/\s/g, ''),
      email: email.toLowerCase(),
      referralCode: userReferralCode,
      subscriptionType: 'standard',
      subscriptionExpiry: subscriptionExpiry.toISOString(),
      proDaysEarned: 0,
      referredBy: referralCode || null,
      referrals: [],
      registeredAt: new Date().toISOString()
    };

    // In a real application, you would:
    // 1. Check if email/phone already exists in database
    // 2. Store user data in database (e.g., MongoDB, PostgreSQL, Supabase)
    // 3. If referralCode exists, update referrer's proDaysEarned by 2
    // 4. Send welcome email
    // 5. Log the registration event

    // For now, we'll simulate the response
    // TODO: Integrate with actual database (Supabase, Firebase, or MongoDB)
    
    // If user was referred, we would update the referrer here
    if (referralCode) {
      // In real implementation:
      // const referrer = await database.users.findOne({ referralCode });
      // if (referrer) {
      //   await database.users.updateOne(
      //     { referralCode },
      //     { $inc: { proDaysEarned: 2 }, $push: { referrals: userId } }
      //   );
      // }
      console.log(`User referred by: ${referralCode}`);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'تم التسجيل بنجاح',
      userId,
      referralCode: userReferralCode,
      subscriptionExpiry: subscriptionExpiry.toISOString(),
      subscriptionType: 'standard'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.' 
    });
  }
}

// Generate a unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

