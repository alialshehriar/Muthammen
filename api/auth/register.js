/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API Endpoint: User Registration
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, password, referralCode } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        error: 'جميع الحقول مطلوبة' 
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' 
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const userReferralCode = generateReferralCode();

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Verify referralCode if provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await sql`
        SELECT id FROM users WHERE referral_code = ${referralCode} LIMIT 1
      `;
      if (referrer.length > 0) {
        referrerId = referrer[0].id;
      }
    }

    // Create user
    const newUser = await sql`
      INSERT INTO users (
        name, email, phone, password_hash, referral_code, referred_by_code,
        subscription_type, subscription_expires_at, email_verified,
        verification_code, verification_code_expiry
      )
      VALUES (
        ${name}, ${email}, ${phone}, ${hashedPassword}, ${userReferralCode}, ${referralCode || null},
        'standard', ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}, false,
        ${verificationCode}, ${verificationExpiry.toISOString()}
      )
      RETURNING id, name, email, phone, referral_code, subscription_type, subscription_expires_at, created_at
    `;

    const user = newUser[0];

    // Create referral record if referred by someone
    if (referrerId) {
      await sql`
        INSERT INTO referrals (referrer_id, referred_id, referral_code, reward_days)
        VALUES (${referrerId}, ${user.id}, ${referralCode}, 2)
      `;

      // The trigger will automatically apply the reward
    }

    // Send verification email
    await sendVerificationEmail(email, verificationCode, name);

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
      message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      userId: user.id,
      // في بيئة التطوير فقط، نرسل الرمز في الاستجابة
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
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

/**
 * Generate a 6-digit verification code
 * @returns {string} - Verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email (mock - replace with real service)
 * @param {string} email - User email
 * @param {string} code - Verification code
 * @param {string} name - User name
 */
async function sendVerificationEmail(email, code, name) {
  // في الإنتاج، استخدم خدمة مثل SendGrid أو AWS SES
  console.log(`📧 إرسال رمز التحقق إلى ${email}`);
  console.log(`رمز التحقق: ${code}`);
  console.log(`الاسم: ${name}`);
  
  // محاكاة إرسال البريد
  // في الإنتاج، قم بإضافة كود الإرسال الفعلي هنا
  
  return true;
}

