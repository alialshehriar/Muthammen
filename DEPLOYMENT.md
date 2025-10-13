# 🚀 دليل النشر على Vercel - مُثمّن

## 📋 المتطلبات الأساسية

1. حساب على [Vercel](https://vercel.com)
2. حساب على [GitHub](https://github.com) (اختياري)
3. مفتاح OpenAI API
4. مفتاح Mapbox Access Token

---

## 🔑 المتغيرات البيئية المطلوبة

يجب إضافة هذه المتغيرات في إعدادات Vercel:

### 1. مفتاح OpenAI
```
OPENAI_API_KEY=sk-proj-...
```

### 2. مفتاح Mapbox
```
VITE_MAPBOX_TOKEN=pk.eyJ1...
```

---

## 📦 طريقة النشر

### الطريقة 1: النشر المباشر (الأسرع)

1. افتح [Vercel Dashboard](https://vercel.com/dashboard)
2. اضغط على **"Add New Project"**
3. اختر **"Import Git Repository"** أو **"Deploy from CLI"**

#### إذا اخترت Git:
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

#### إذا اخترت CLI:
```bash
# تثبيت Vercel CLI
npm i -g vercel

# في مجلد المشروع
vercel

# اتبع التعليمات:
# - Set up and deploy? Yes
# - Which scope? (اختر حسابك)
# - Link to existing project? No
# - What's your project's name? mothammen-ai
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### الطريقة 2: استخدام Vercel CLI مع MCP

```bash
# في terminal المشروع
manus-mcp-cli tool call deploy-project \
  --server vercel \
  --input '{"path": "/home/ubuntu/mothammen-ai"}'
```

---

## ⚙️ إعداد المتغيرات البيئية في Vercel

### عبر Dashboard:

1. اذهب إلى مشروعك في Vercel
2. اضغط على **Settings**
3. اختر **Environment Variables**
4. أضف المتغيرات التالية:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Production, Preview, Development |
| `VITE_MAPBOX_TOKEN` | `pk.eyJ1...` | Production, Preview, Development |

5. اضغط **Save**

### عبر CLI:

```bash
# إضافة متغير OpenAI
vercel env add OPENAI_API_KEY production

# إضافة متغير Mapbox
vercel env add VITE_MAPBOX_TOKEN production

# إعادة النشر
vercel --prod
```

---

## 🔧 إعدادات Vercel (vercel.json)

الملف موجود بالفعل في المشروع:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🧪 اختبار النشر

بعد النشر، تحقق من:

1. ✅ الصفحة الرئيسية تعمل
2. ✅ نموذج التقييم يعمل
3. ✅ الخريطة التفاعلية تظهر
4. ✅ تحليل GPT يعمل (جرب تقييم عقار)
5. ✅ صفحة السوق تعمل
6. ✅ صفحة الاشتراكات تعمل

---

## 🐛 حل المشاكل الشائعة

### المشكلة: الخريطة لا تظهر
**الحل:** تأكد من إضافة `VITE_MAPBOX_TOKEN` في Environment Variables

### المشكلة: GPT لا يعمل
**الحل:** تأكد من إضافة `OPENAI_API_KEY` في Environment Variables

### المشكلة: Build فشل
**الحل:** 
```bash
# تنظيف وإعادة البناء محلياً
rm -rf node_modules dist
npm install
npm run build
```

### المشكلة: API endpoints لا تعمل
**الحل:** تأكد من وجود مجلد `/api` في المشروع وأن الملفات بصيغة `.js`

---

## 📊 مراقبة الأداء

بعد النشر، راقب:

1. **Analytics** في Vercel Dashboard
2. **Function Logs** للـ API endpoints
3. **Build Logs** لأي أخطاء

---

## 🔄 التحديثات المستقبلية

لتحديث المشروع:

```bash
# عبر Git
git add .
git commit -m "Update description"
git push

# عبر CLI
vercel --prod
```

Vercel سيقوم بإعادة البناء والنشر تلقائياً!

---

## 🌐 الدومين المخصص

لربط دومين خاص:

1. اذهب إلى **Settings** → **Domains**
2. أضف الدومين الخاص بك
3. اتبع تعليمات DNS

---

## ✅ Checklist النشر النهائي

- [ ] تم إضافة `OPENAI_API_KEY`
- [ ] تم إضافة `VITE_MAPBOX_TOKEN`
- [ ] تم اختبار Build محلياً
- [ ] تم رفع الكود على Git (اختياري)
- [ ] تم النشر على Vercel
- [ ] تم اختبار جميع الميزات
- [ ] تم ربط الدومين المخصص (اختياري)

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع [Vercel Documentation](https://vercel.com/docs)
2. تحقق من Function Logs في Dashboard
3. تأكد من Environment Variables

---

**🎉 مبروك! تطبيق مُثمّن الآن على الإنترنت!**

