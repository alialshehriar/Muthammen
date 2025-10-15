import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // السماح فقط بـ POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // التحقق من البيانات
  if (!email || !password) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  try {
    // الاتصال بقاعدة البيانات
    const sql = neon(process.env.DATABASE_URL);

    // البحث عن المستخدم
    const users = await sql`
      SELECT * FROM users 
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const user = users[0];

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // التحقق من تفعيل الحساب
    if (!user.email_verified) {
      return res.status(403).json({ error: 'يرجى تفعيل حسابك عبر البريد الإلكتروني أولاً' });
    }

    // تحديث آخر تسجيل دخول
    await sql`
      UPDATE users 
      SET last_login_at = NOW()
      WHERE user_id = ${user.user_id}
    `;

    // إنشاء JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id,
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '30d' }
    );

    // إرجاع بيانات المستخدم (بدون كلمة المرور)
    const userData = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      subscription_type: user.subscription_type,
      subscription_expiry: user.subscription_expiry,
      referral_code: user.referral_code,
      created_at: user.created_at
    };

    return res.status(200).json({
      success: true,
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
}

