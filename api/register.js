import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

    // الاتصال بقاعدة البيانات
    const sql = neon(process.env.DATABASE_URL);

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUsers = await sql`
      SELECT user_id FROM users 
      WHERE email = ${email.toLowerCase()} OR phone = ${phone.replace(/\s/g, '')}
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'البريد الإلكتروني أو رقم الجوال مسجل مسبقاً' });
    }

    // توليد كود إحالة فريد
    const userReferralCode = generateReferralCode();

    // Calculate subscription expiry (1 month free for standard plan)
    const subscriptionExpiry = new Date();
    subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1);

    // كلمة مرور مؤقتة
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // إدراج المستخدم الجديد
    const result = await sql`
      INSERT INTO users (
        full_name,
        email,
        phone,
        password_hash,
        subscription_type,
        subscription_expiry,
        referral_code,
        referred_by,
        email_verified
      ) VALUES (
        ${name},
        ${email.toLowerCase()},
        ${phone.replace(/\s/g, '')},
        ${passwordHash},
        'standard',
        ${subscriptionExpiry.toISOString()},
        ${userReferralCode},
        ${referralCode || null},
        false
      )
      RETURNING user_id, full_name, email, phone, subscription_type, subscription_expiry, referral_code
    `;

    const newUser = result[0];

    // إذا كان هناك كود إحالة، نضيف مكافأة للمحيل
    if (referralCode) {
      try {
        const referrer = await sql`
          SELECT user_id, subscription_expiry FROM users 
          WHERE referral_code = ${referralCode.toUpperCase()}
          LIMIT 1
        `;

        if (referrer.length > 0) {
          const newExpiry = new Date(referrer[0].subscription_expiry);
          newExpiry.setDate(newExpiry.getDate() + 2);

          await sql`
            UPDATE users 
            SET subscription_expiry = ${newExpiry.toISOString()}
            WHERE user_id = ${referrer[0].user_id}
          `;

          await sql`
            INSERT INTO referrals (
              referrer_id,
              referred_user_id,
              reward_days,
              status
            ) VALUES (
              ${referrer[0].user_id},
              ${newUser.user_id},
              2,
              'completed'
            )
          `;
        }
      } catch (refError) {
        console.log('Referral processing error:', refError);
      }
    }

    // تسجيل النشاط
    await sql`
      INSERT INTO activity_log (
        user_id,
        action_type,
        details
      ) VALUES (
        ${newUser.user_id},
        'user_registered',
        ${JSON.stringify({
          name: name,
          subscription_type: 'standard',
          referral_code: userReferralCode,
          referred_by: referralCode || null
        })}
      )
    `;

    console.log('Temporary password for', email, ':', tempPassword);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'تم التسجيل بنجاح',
      userId: newUser.user_id,
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

