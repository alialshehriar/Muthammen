#!/bin/bash

# سكريبت لإضافة متغيرات البيئة إلى Vercel
# يستخدم Vercel MCP أو API مباشرة

echo "🔧 إعداد متغيرات البيئة على Vercel..."

# معلومات المشروع
PROJECT_ID="prj_wSZr3jCZzaw4XWDTZEP8zR0eNVUV"
TEAM_ID="team_ZXj80fgBf0cQjTYjlH3hhbYS"

# التحقق من وجود OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY غير موجود في البيئة"
    exit 1
fi

echo "✅ OPENAI_API_KEY موجود"

# إنشاء ملف مؤقت للمتغيرات
cat > /tmp/vercel-env-vars.json << EOF
{
  "OPENAI_API_KEY": "$OPENAI_API_KEY",
  "OPENAI_API_BASE": "${OPENAI_API_BASE:-https://api.openai.com/v1}"
}
EOF

echo "📝 تم إنشاء ملف المتغيرات المؤقت"
echo ""
echo "⚠️  ملاحظة: يجب إضافة هذه المتغيرات يدوياً في Vercel Dashboard:"
echo ""
echo "1. افتح: https://vercel.com/alialshehriars-projects/muthammen/settings/environment-variables"
echo "2. أضف المتغير التالي:"
echo "   - Name: OPENAI_API_KEY"
echo "   - Value: (موجود في البيئة)"
echo "   - Environment: Production, Preview, Development"
echo ""
echo "أو يمكنك استخدام الأمر التالي بعد تسجيل الدخول إلى Vercel CLI:"
echo ""
echo "vercel env add OPENAI_API_KEY production"
echo ""

# حفظ المعلومات في ملف
cat > /home/ubuntu/VERCEL_ENV_SETUP.md << 'MDEOF'
# إعداد متغيرات البيئة على Vercel

## الطريقة 1: عبر Vercel Dashboard (موصى بها)

1. افتح رابط إعدادات المشروع:
   ```
   https://vercel.com/alialshehriars-projects/muthammen/settings/environment-variables
   ```

2. انقر على "Add New" أو "إضافة جديد"

3. أضف المتغير التالي:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: قيمة المفتاح من OpenAI
   - **Environment**: حدد جميع البيئات (Production, Preview, Development)

4. انقر "Save" أو "حفظ"

5. أعد نشر المشروع لتطبيق التغييرات

## الطريقة 2: عبر Vercel CLI

إذا كنت قد سجلت الدخول إلى Vercel CLI:

```bash
cd /home/ubuntu/mothammen-deploy
echo "YOUR_OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production
```

## الطريقة 3: عبر Vercel API

يمكن استخدام Vercel API مباشرة لإضافة المتغيرات برمجياً.

## التحقق من التفعيل

بعد إضافة المتغير وإعادة النشر، يمكنك اختبار الوكيل من خلال:

1. فتح الموقع
2. ملء نموذج التقييم
3. الضغط على "قيّم الآن"
4. يجب أن يعمل الوكيل الذكي تلقائياً

## ملاحظات مهمة

- المفتاح محمي ولن يظهر في الكود المصدري
- يتم استخدامه فقط في Serverless Functions
- لا يمكن الوصول إليه من المتصفح
MDEOF

echo "✅ تم حفظ التعليمات في: /home/ubuntu/VERCEL_ENV_SETUP.md"

