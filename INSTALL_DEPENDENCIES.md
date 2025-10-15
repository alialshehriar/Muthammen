# تثبيت التبعيات المطلوبة

## التبعيات الجديدة المطلوبة

لتفعيل نظام التسجيل الإلزامي مع تأكيد البريد الإلكتروني، تحتاج إلى تثبيت:

```bash
npm install bcryptjs
```

أو إذا كنت تستخدم pnpm:

```bash
pnpm add bcryptjs
```

## التبعيات الموجودة

التبعيات التالية يجب أن تكون موجودة بالفعل:
- `@neondatabase/serverless` - للاتصال بقاعدة البيانات
- `react` - المكتبة الأساسية
- `lucide-react` - الأيقونات

## تحديث قاعدة البيانات

بعد تثبيت التبعيات، قم بتشغيل SQL التالي في لوحة تحكم Neon:

```sql
-- إضافة حقول التحقق من البريد الإلكتروني
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code);

-- تحديث السجلات الموجودة
UPDATE users SET email_verified = true WHERE email_verified IS NULL;
```

## متغيرات البيئة

تأكد من وجود المتغيرات التالية في ملف `.env` أو في إعدادات Vercel:

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

## ملاحظات مهمة

1. **في بيئة التطوير**: رمز التحقق سيُرسل في الاستجابة للتسهيل
2. **في الإنتاج**: يجب إضافة خدمة إرسال البريد الإلكتروني الفعلية (SendGrid, AWS SES, إلخ)
3. **الأمان**: كلمات المرور مشفرة باستخدام bcrypt مع 10 جولات
4. **الصلاحية**: رمز التحقق صالح لمدة 15 دقيقة فقط

## خدمة البريد الإلكتروني (للإنتاج)

لإضافة خدمة إرسال البريد الإلكتروني الفعلية، قم بتحديث الدالة `sendVerificationEmail` في:
- `/api/auth/register.js`
- `/api/auth/resend-code.js`

مثال باستخدام SendGrid:

```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(email, code, name) {
  const msg = {
    to: email,
    from: 'noreply@muthammen.com',
    subject: 'رمز التحقق - مُثمّن',
    html: `
      <div dir="rtl">
        <h2>مرحباً ${name}!</h2>
        <p>رمز التحقق الخاص بك هو:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
      </div>
    `
  };
  
  await sgMail.send(msg);
}
```

