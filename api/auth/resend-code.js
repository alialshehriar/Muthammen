/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API Endpoint: Resend Verification Code
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { neon } from '@neondatabase/serverless';

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email (mock - replace with real service)
 */
async function sendVerificationEmail(email, code, name) {
  // في الإنتاج، استخدم خدمة مثل SendGrid أو AWS SES
  console.log(`📧 إعادة إرسال رمز التحقق إلى ${email}`);
  console.log(`رمز التحقق: ${code}`);
  console.log(`الاسم: ${name}`);
  
  return true;
}

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
    const { email } = req.body;

    // التحقق من البيانات
    if (!email) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    }

    // الاتصال بقاعدة البيانات
    const sql = neon(process.env.DATABASE_URL);

    // البحث عن المستخدم
    const users = await sql`
      SELECT id, name, email, email_verified
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    const user = users[0];

    // التحقق من أن البريد غير مفعّل
    if (user.email_verified) {
      return res.status(400).json({ error: 'البريد الإلكتروني مفعّل بالفعل' });
    }

    // توليد رمز تحقق جديد
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة

    // تحديث رمز التحقق في قاعدة البيانات
    await sql`
      UPDATE users 
      SET 
        verification_code = ${verificationCode},
        verification_code_expiry = ${verificationExpiry.toISOString()},
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // إرسال البريد الإلكتروني
    await sendVerificationEmail(user.email, verificationCode, user.name);

    // تسجيل النشاط
    await sql`
      INSERT INTO activity_log (user_id, action, description, ip_address)
      VALUES (
        ${user.id},
        'verification_code_resent',
        'تم إعادة إرسال رمز التحقق',
        ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
      )
    `;

    return res.status(200).json({
      success: true,
      message: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني',
      // في بيئة التطوير فقط
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
    });

  } catch (error) {
    console.error('خطأ في إعادة الإرسال:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء إعادة الإرسال. يرجى المحاولة مرة أخرى.' 
    });
  }
}

