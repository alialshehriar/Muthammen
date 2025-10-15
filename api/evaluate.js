import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // السماح فقط بـ POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // التحقق من البيانات الأساسية
    if (!formData.area || !formData.city || !formData.district) {
      return res.status(400).json({ 
        error: 'بيانات ناقصة',
        message: 'المساحة والمدينة والحي مطلوبة'
      });
    }

    // الاتصال بقاعدة البيانات
    const sql = neon(process.env.DATABASE_URL);

    // 1. حساب التقييم باستخدام GPT
    const evaluation = await evaluateWithGPT(formData);

    // 2. حفظ التقييم في قاعدة البيانات
    const savedEvaluation = await sql`
      INSERT INTO evaluations (
        property_data,
        estimated_price,
        price_range_min,
        price_range_max,
        confidence_score,
        ai_analysis,
        created_at
      ) VALUES (
        ${JSON.stringify(formData)},
        ${evaluation.estimatedPrice},
        ${evaluation.priceRange.min},
        ${evaluation.priceRange.max},
        ${evaluation.confidence},
        ${JSON.stringify(evaluation.analysis)},
        NOW()
      )
      RETURNING id, estimated_price, price_range_min, price_range_max, confidence_score
    `;

    // 3. إرجاع النتيجة
    return res.status(200).json({
      success: true,
      evaluation: {
        id: savedEvaluation[0].id,
        estimatedPrice: savedEvaluation[0].estimated_price,
        priceRange: {
          min: savedEvaluation[0].price_range_min,
          max: savedEvaluation[0].price_range_max
        },
        confidence: savedEvaluation[0].confidence_score,
        analysis: evaluation.analysis
      }
    });

  } catch (error) {
    console.error('خطأ في التقييم:', error);
    
    // في حالة الخطأ، استخدم المحرك المحلي
    try {
      const localEvaluation = calculateLocalEstimate(req.body);
      return res.status(200).json({
        success: true,
        evaluation: localEvaluation,
        fallback: true
      });
    } catch (fallbackError) {
      return res.status(500).json({ 
        error: 'فشل التقييم',
        message: error.message 
      });
    }
  }
}

// دالة التقييم باستخدام GPT
async function evaluateWithGPT(formData) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY غير موجود');
  }

  const prompt = `أنت خبير تقييم عقاري سعودي متخصص. قيّم العقار التالي:

**بيانات العقار:**
- المساحة: ${formData.area} م²
- المدينة: ${formData.city}
- الحي: ${formData.district}
- النوع: ${formData.propertyType || 'غير محدد'}
- العمر: ${formData.age || 'غير محدد'}
- الغرف: ${formData.bedrooms || 'غير محدد'}
- دورات المياه: ${formData.bathrooms || 'غير محدد'}
- موقف السيارات: ${formData.parking || 'غير محدد'}

**المطلوب:**
قدم تقييماً دقيقاً بصيغة JSON فقط، بدون أي نص إضافي:

{
  "estimatedPrice": <السعر المقدر بالريال>,
  "priceRange": {
    "min": <أقل سعر متوقع>,
    "max": <أعلى سعر متوقع>
  },
  "confidence": <نسبة الثقة من 0 إلى 100>,
  "analysis": {
    "summary": "<ملخص التقييم في جملة واحدة>",
    "factors": [
      "<عامل مؤثر 1>",
      "<عامل مؤثر 2>",
      "<عامل مؤثر 3>"
    ],
    "recommendations": [
      "<توصية 1>",
      "<توصية 2>"
    ]
  }
}

**ملاحظات:**
- استخدم أسعار السوق السعودي الحالية (2025)
- ركز على المدينة والحي المحدد
- كن واقعياً ودقيقاً
- نسبة الثقة تعتمد على كمية البيانات المتوفرة`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'أنت خبير تقييم عقاري سعودي. تقدم تقييمات دقيقة بناءً على بيانات السوق الحقيقية.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // استخراج JSON من الرد
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('فشل في استخراج JSON من رد GPT');
  }

  return JSON.parse(jsonMatch[0]);
}

// المحرك المحلي (Fallback)
function calculateLocalEstimate(formData) {
  const { area, city, propertyType } = formData;
  
  // أسعار تقريبية للمتر في المدن الرئيسية
  const cityPrices = {
    'الرياض': 3500,
    'جدة': 3200,
    'مكة المكرمة': 2800,
    'المدينة المنورة': 2600,
    'الدمام': 2400,
    'الخبر': 2500,
    'الظهران': 2600
  };

  // معاملات نوع العقار
  const typeMultipliers = {
    'فيلا': 1.3,
    'شقة': 1.0,
    'دور': 1.1,
    'عمارة': 1.5,
    'أرض': 0.8,
    'دوبلكس': 1.2
  };

  const basePrice = cityPrices[city] || 2000;
  const typeMultiplier = typeMultipliers[propertyType] || 1.0;
  
  const estimatedPrice = Math.round(area * basePrice * typeMultiplier);
  const variance = estimatedPrice * 0.15;

  return {
    estimatedPrice,
    priceRange: {
      min: Math.round(estimatedPrice - variance),
      max: Math.round(estimatedPrice + variance)
    },
    confidence: 65,
    analysis: {
      summary: `تقييم أولي بناءً على المساحة والموقع`,
      factors: [
        `المساحة: ${area} م²`,
        `الموقع: ${city}`,
        `النوع: ${propertyType || 'غير محدد'}`
      ],
      recommendations: [
        'أضف المزيد من التفاصيل لتقييم أدق',
        'تحقق من الأسعار المماثلة في نفس الحي'
      ]
    },
    fallback: true
  };
}

