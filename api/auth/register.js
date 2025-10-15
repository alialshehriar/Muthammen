import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
    }

    const phoneRegex = /^(05|5)[0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'رقم الجوال غير صحيح' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }

    // Check if user exists using tagged template
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${email} OR phone = ${phone}
    `;

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الجوال مسجل مسبقاً' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Insert new user using tagged template
    const newUsers = await sql`
      INSERT INTO users (name, email, phone, password_hash, verification_code, verification_code_expiry, email_verified, created_at)
      VALUES (${name}, ${email}, ${phone}, ${passwordHash}, ${verificationCode}, ${verificationExpiry.toISOString()}, false, NOW())
      RETURNING id, name, email, phone, created_at
    `;

    const newUser = newUsers[0];

    // TODO: Send verification email with code
    console.log(`Verification code for ${email}: ${verificationCode}`);

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
      requiresVerification: true,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

