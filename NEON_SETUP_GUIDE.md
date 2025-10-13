# 🚀 دليل إعداد قاعدة بيانات Neon - مُثمّن AI

## 📋 نظرة عامة

تم إعداد التطبيق للعمل مع قاعدة بيانات **Neon PostgreSQL**. هذا الدليل يشرح كيفية إعداد وربط القاعدة بالتطبيق.

---

## 1️⃣ إنشاء حساب Neon

### الخطوات:

1. اذهب إلى: https://neon.tech
2. اضغط "Sign Up" أو "Get Started"
3. سجل دخول باستخدام GitHub أو Google
4. اختر الخطة المجانية (Free Tier)

### المميزات المجانية:
- ✅ 0.5 GB تخزين
- ✅ 191 ساعة compute شهرياً
- ✅ Unlimited databases
- ✅ Branching support

---

## 2️⃣ إنشاء قاعدة بيانات جديدة

### الخطوات:

1. من لوحة التحكم، اضغط "Create Project"
2. اختر اسم المشروع: `mothammen-production`
3. اختر المنطقة الأقرب: **AWS - Middle East (Bahrain)**
4. اضغط "Create Project"

### نسخ Connection String:

بعد إنشاء المشروع، ستحصل على **Connection String** بهذا الشكل:

```
postgresql://username:password@ep-xxx-xxx.me-south-1.aws.neon.tech/dbname?sslmode=require
```

**احفظ هذا الرابط!** ستحتاجه في الخطوة التالية.

---

## 3️⃣ تنفيذ SQL Schema

### الطريقة 1: عبر Neon Console (موصى بها)

1. من لوحة تحكم Neon، اذهب إلى "SQL Editor"
2. افتح ملف `database/schema.sql` من المشروع
3. انسخ كل المحتوى والصقه في SQL Editor
4. اضغط "Run" لتنفيذ الـ Schema

### الطريقة 2: عبر psql (للمتقدمين)

```bash
# تثبيت PostgreSQL client
brew install postgresql  # macOS
sudo apt install postgresql-client  # Linux

# تنفيذ Schema
psql "YOUR_CONNECTION_STRING" < database/schema.sql
```

---

## 4️⃣ ربط التطبيق بـ Neon

### إضافة Environment Variables

#### أ. للتطوير المحلي:

أنشئ ملف `.env.local` في جذر المشروع:

```env
# Neon Database
DATABASE_URL=postgresql://username:password@ep-xxx.me-south-1.aws.neon.tech/dbname?sslmode=require

# Admin API Key (اختر كلمة سر قوية)
ADMIN_API_KEY=your-super-secret-admin-key-here

# Mapbox (إذا لم يكن موجود)
VITE_MAPBOX_TOKEN=your_mapbox_token

# OpenAI (إذا لم يكن موجود)
VITE_OPENAI_API_KEY=your_openai_key
```

#### ب. للإنتاج (Vercel):

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع `mothammen-complete`
3. اذهب إلى "Settings" → "Environment Variables"
4. أضف المتغيرات التالية:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Connection string من Neon | Production, Preview, Development |
| `ADMIN_API_KEY` | كلمة سر قوية للأدمن | Production |

5. اضغط "Save"
6. Redeploy المشروع

---

## 5️⃣ تثبيت Dependencies

### إضافة Neon SDK:

```bash
cd mothammen-deploy
npm install @neondatabase/serverless
npm install --legacy-peer-deps
```

---

## 6️⃣ اختبار الاتصال

### اختبار محلي:

```bash
# تشغيل التطبيق
npm run dev

# افتح المتصفح
http://localhost:5173

# جرب التسجيل
اذهب إلى: http://localhost:5173 → "سجل الآن"
```

### اختبار الإنتاج:

```bash
# بعد النشر على Vercel
https://mothammen-complete.vercel.app

# جرب التسجيل
اضغط "سجل الآن" وأدخل بياناتك
```

---

## 7️⃣ الوصول إلى لوحة الإدارة

### الطريقة الآمنة:

1. افتح المتصفح
2. اذهب إلى: `https://your-domain.vercel.app/admin`
3. سيُطلب منك إدخال API Key
4. أدخل الـ `ADMIN_API_KEY` الذي أضفته في Environment Variables
5. احفظه في localStorage للدخول التلقائي

### ما ستراه في لوحة الإدارة:

#### 📊 نظرة عامة:
- إجمالي المستخدمين
- الإحالات الناجحة
- الإيرادات الشهرية
- عدد التقييمات
- رسم بياني للنمو
- أكثر المدن نشاطاً

#### 👥 المستخدمين:
- قائمة كاملة بالمستخدمين
- توزيع الاشتراكات
- المستخدمين الجدد

#### 🎁 الإحالات:
- جميع الإحالات
- أفضل المُحيلين
- إحصائيات المكافآت

#### 💰 الاشتراكات:
- الاشتراكات النشطة
- الإيرادات
- التحليلات المالية

#### 📝 التقييمات:
- جميع التقييمات
- إحصائيات المدن
- متوسط قيمة العقارات

#### 🔔 النشاطات:
- آخر النشاطات في التطبيق
- سجل الأحداث

---

## 8️⃣ البنية التحتية

### الجداول المُنشأة:

1. **users** - المستخدمين المسجلين
2. **referrals** - الإحالات والمكافآت
3. **subscriptions** - الاشتراكات المدفوعة
4. **evaluations** - تقييمات العقارات
5. **activity_log** - سجل النشاطات

### Views (للتحليلات):

1. **user_stats** - إحصائيات المستخدمين
2. **referral_stats** - إحصائيات الإحالات
3. **top_referrers** - أفضل المُحيلين
4. **revenue_stats** - إحصائيات الإيرادات

### Triggers (آلي):

1. **update_updated_at** - تحديث `updated_at` تلقائياً
2. **apply_referral_reward** - تطبيق مكافأة الإحالة تلقائياً

---

## 9️⃣ API Endpoints المتاحة

### التسجيل:
```
POST /api/auth/register
Body: { name, email, phone, referredByCode? }
```

### إحصائيات الأدمن:
```
GET /api/admin/stats
Headers: { x-api-key: YOUR_ADMIN_API_KEY }
```

---

## 🔟 نصائح الأمان

### ✅ افعل:
- استخدم HTTPS دائماً
- احفظ `ADMIN_API_KEY` بشكل آمن
- لا تشارك Connection String
- فعّل Row Level Security في Neon (اختياري)

### ❌ لا تفعل:
- لا ترفع `.env.local` على GitHub
- لا تشارك API Keys علناً
- لا تستخدم كلمات سر ضعيفة

---

## 🆘 حل المشاكل الشائعة

### المشكلة: "DATABASE_URL is not defined"

**الحل:**
- تأكد من إضافة `DATABASE_URL` في `.env.local`
- تأكد من إعادة تشغيل السيرفر بعد إضافة المتغير

### المشكلة: "Connection timeout"

**الحل:**
- تأكد من أن Connection String صحيح
- تأكد من إضافة `?sslmode=require` في نهاية الرابط
- تحقق من أن Neon project نشط (Free tier ينام بعد فترة)

### المشكلة: "Unauthorized" في لوحة الإدارة

**الحل:**
- تأكد من إضافة `ADMIN_API_KEY` في Environment Variables
- تأكد من إدخال نفس القيمة عند الدخول

---

## 📚 موارد إضافية

- [Neon Documentation](https://neon.tech/docs)
- [Neon + Vercel Integration](https://neon.tech/docs/guides/vercel)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

---

## ✅ الخلاصة

بعد إتمام هذه الخطوات:
- ✅ قاعدة بيانات Neon جاهزة
- ✅ التطبيق مربوط بقاعدة البيانات
- ✅ نظام التسجيل والإحالات يعمل
- ✅ لوحة الإدارة جاهزة
- ✅ API Endpoints تعمل

**التطبيق الآن جاهز للإنتاج! 🚀**

