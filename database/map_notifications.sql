-- جدول تسجيل طلبات الإشعار بإطلاق الخريطة التفاعلية
-- يحفظ معلومات المستخدمين الذين يريدون الحصول على إشعار عند إطلاق الخريطة

CREATE TABLE IF NOT EXISTS map_notifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- إنشاء فهرس على البريد الإلكتروني لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_map_notifications_email ON map_notifications(email);

-- إنشاء فهرس على حالة الإشعار
CREATE INDEX IF NOT EXISTS idx_map_notifications_notified ON map_notifications(notified);

-- إنشاء فهرس على تاريخ الإنشاء
CREATE INDEX IF NOT EXISTS idx_map_notifications_created_at ON map_notifications(created_at DESC);

-- تعليق على الجدول
COMMENT ON TABLE map_notifications IS 'يحفظ طلبات الإشعار بإطلاق الخريطة التفاعلية';

-- تعليقات على الأعمدة
COMMENT ON COLUMN map_notifications.id IS 'المعرف الفريد للتسجيل';
COMMENT ON COLUMN map_notifications.name IS 'اسم المستخدم الكامل';
COMMENT ON COLUMN map_notifications.email IS 'البريد الإلكتروني (فريد)';
COMMENT ON COLUMN map_notifications.phone IS 'رقم الجوال (اختياري)';
COMMENT ON COLUMN map_notifications.created_at IS 'تاريخ ووقت التسجيل';
COMMENT ON COLUMN map_notifications.notified IS 'هل تم إرسال الإشعار؟';
COMMENT ON COLUMN map_notifications.notified_at IS 'تاريخ ووقت إرسال الإشعار';
COMMENT ON COLUMN map_notifications.ip_address IS 'عنوان IP للمستخدم';
COMMENT ON COLUMN map_notifications.user_agent IS 'معلومات المتصفح';

