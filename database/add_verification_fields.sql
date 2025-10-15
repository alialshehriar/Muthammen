-- ═══════════════════════════════════════════════════════════════════════════
-- Database Schema Update: Add Email Verification Fields
-- ═══════════════════════════════════════════════════════════════════════════

-- إضافة حقول التحقق من البريد الإلكتروني إلى جدول المستخدمين
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code);

-- تحديث السجلات الموجودة لتكون مفعّلة بشكل افتراضي
UPDATE users SET email_verified = true WHERE email_verified IS NULL;

-- إضافة تعليق على الحقول الجديدة
COMMENT ON COLUMN users.password_hash IS 'كلمة المرور المشفرة باستخدام bcrypt';
COMMENT ON COLUMN users.email_verified IS 'حالة تفعيل البريد الإلكتروني';
COMMENT ON COLUMN users.verification_code IS 'رمز التحقق المكون من 6 أرقام';
COMMENT ON COLUMN users.verification_code_expiry IS 'تاريخ انتهاء صلاحية رمز التحقق';
COMMENT ON COLUMN users.updated_at IS 'تاريخ آخر تحديث للسجل';

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at عند التعديل
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- عرض الحقول الجديدة
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('password_hash', 'email_verified', 'verification_code', 'verification_code_expiry', 'updated_at')
ORDER BY ordinal_position;

