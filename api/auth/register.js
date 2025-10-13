/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API Endpoint: User Registration
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, referredByCode } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({ 
        error: 'الرجاء إدخال جميع البيانات المطلوبة' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'البريد الإلكتروني غير صحيح' 
      });
    }

    // Phone validation (Saudi format)
    const phoneRegex = /^(05|5)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        error: 'رقم الجوال غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام' 
      });
    }

    // Connect to database
    const sql = neon(process.env.DATABASE_URL);

    // Check if email already exists
    const existingEmail = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;
    if (existingEmail.length > 0) {
      return res.status(400).json({ 
        error: 'البريد الإلكتروني مسجل مسبقاً' 
      });
    }

    // Check if phone already exists
    const existingPhone = await sql`
      SELECT id FROM users WHERE phone = ${phone} LIMIT 1
    `;
    if (existingPhone.length > 0) {
      return res.status(400).json({ 
        error: 'رقم الجوال مسجل مسبقاً' 
      });
    }

    // Generate unique referral code
    const referralCode = generateReferralCode();

    // Verify referredByCode if provided
    let referrerId = null;
    if (referredByCode) {
      const referrer = await sql`
        SELECT id FROM users WHERE referral_code = ${referredByCode} LIMIT 1
      `;
      if (referrer.length > 0) {
        referrerId = referrer[0].id;
      }
    }

    // Create user
    const newUser = await sql`
      INSERT INTO users (
        name, email, phone, referral_code, referred_by_code,
        subscription_type, subscription_expires_at
      )
      VALUES (
        ${name}, ${email}, ${phone}, ${referralCode}, ${referredByCode || null},
        'basic', ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
      )
      RETURNING id, name, email, phone, referral_code, subscription_type, subscription_expires_at, created_at
    `;

    const user = newUser[0];

    // Create referral record if referred by someone
    if (referrerId) {
      await sql`
        INSERT INTO referrals (referrer_id, referred_id, referral_code, reward_days)
        VALUES (${referrerId}, ${user.id}, ${referredByCode}, 2)
      `;

      // The trigger will automatically apply the reward
    }

    // Log activity
    await sql`
      INSERT INTO activity_log (user_id, action, description, ip_address)
      VALUES (
        ${user.id}, 
        'user_registered', 
        'مستخدم جديد سجل في التطبيق',
        ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
      )
    `;

    // Return success with user data
    return res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح! حصلت على شهر مجاني من الباقة العادية',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referral_code,
        referralLink: `https://mothammen.ai/register?ref=${user.referral_code}`,
        subscriptionType: user.subscription_type,
        subscriptionExpiresAt: user.subscription_expires_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى' 
    });
  }
}

/**
 * Generate a unique 8-character referral code
 * @returns {string} - Referral code
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

