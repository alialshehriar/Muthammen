/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API Endpoint: Email Verification
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // السماح بـ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body;

    // التحقق من البيانات
    if (!email || !code) {
      return res.status(400).json({ error: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
    }

    // التحقق من صحة الرمز (6 أرقام)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'رمز التحقق يجب أن يكون 6 أرقام' });
    }

    // الاتصال بقاعدة البيانات
    const sql = neon(process.env.DATABASE_URL);

    // البحث عن المستخدم والتحقق من الرمز
    const users = await sql`
      SELECT 
        id, 
        name, 
        email, 
        phone,
        referral_code,
        subscription_type,
        subscription_expires_at,
        email_verified,
        verification_code,
        verification_code_expiry
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    const user = users[0];

    // التحقق من أن البريد غير مفعّل بالفعل
    if (user.email_verified) {
      return res.status(400).json({ error: 'البريد الإلكتروني مفعّل بالفعل' });
    }

    // التحقق من الرمز
    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'رمز التحقق غير صحيح' });
    }

    // التحقق من صلاحية الرمز
    const now = new Date();
    const expiry = new Date(user.verification_code_expiry);
    
    if (now > expiry) {
      return res.status(400).json({ 
        error: 'رمز التحقق منتهي الصلاحية. الرجاء طلب رمز جديد' 
      });
    }

    // تفعيل البريد الإلكتروني
    await sql`
      UPDATE users 
      SET 
        email_verified = true,
        verification_code = NULL,
        verification_code_expiry = NULL,
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // تسجيل النشاط
    await sql`
      INSERT INTO activity_log (user_id, action, description, ip_address)
      VALUES (
        ${user.id},
        'email_verified',
        'تم تفعيل البريد الإلكتروني بنجاح',
        ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
      )
    `;

    return res.status(200).json({
      success: true,
      message: 'تم تفعيل حسابك بنجاح!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referral_code,
        subscriptionType: user.subscription_type,
        subscriptionExpiry: user.subscription_expires_at,
        verified: true
      }
    });

  } catch (error) {
    console.error('خطأ في التحقق:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.' 
    });
  }
}

