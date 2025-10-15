/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API الوكيل الآمنة - score-nqs.js
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Serverless Function للربط الآمن مع وكيل الذكاء الاصطناعي
 * 
 * المدخل: { city, district, coords, extras }
 * المخرج: { ok: true, source: "agent", nqs, notes } أو { ok: false }
 * 
 * الأمان:
 * - المفتاح محفوظ في process.env.AGENT_PROJECT_KEY
 * - لا يُرجع المفتاح أو أي رأس يكشفه
 * - يعمل على Vercel Serverless
 */

export default async function handler(req, res) {
  // السماح فقط بـ POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    // قراءة المفتاح من البيئة
    const apiKey = process.env.AGENT_PROJECT_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ AGENT_PROJECT_KEY not configured');
      return res.status(200).json({ 
        ok: false, 
        error: 'Agent not configured',
        fallback: true 
      });
    }

    // استخراج البيانات
    const { city, district, coords, extras } = req.body;

    if (!city || !district) {
      return res.status(400).json({ 
        ok: false, 
        error: 'city and district are required' 
      });
    }

    // إعداد Prompt للوكيل
    const prompt = `أنت وكيل ذكاء اصطناعي متخصص في تقييم جودة الأحياء في المملكة العربية السعودية.

**المهمة:**
احسب درجة جودة الحي (NQS - Neighborhood Quality Score) من 0 إلى 100 بناءً على:
1. كثافة الخدمات (مدارس، مساجد، أسواق، مستشفيات)
2. سهولة النفاذ للطرق الرئيسية
3. المساحات الخضراء والحدائق
4. المؤسسات التعليمية
5. موقع الحي السعري
6. مستوى الضوضاء والمرور

**البيانات:**
- المدينة: ${city}
- الحي: ${district}
${coords ? `- الإحداثيات: ${coords.join(', ')}` : ''}
${extras ? `- معلومات إضافية: ${JSON.stringify(extras)}` : ''}

**المطلوب:**
أرجع JSON فقط بهذا التنسيق:
{
  "nqs": <رقم من 0 إلى 100>,
  "level": "<منخفض|متوسط|مرتفع|مرتفع جداً>",
  "notes": "<تفسير مختصر بالعربية (جملة واحدة)>"
}

**ملاحظات:**
- كن دقيقاً ومحافظاً في التقييم
- استند إلى معرفتك بالسوق السعودي
- لا تبالغ في الدرجات`;

    // الاتصال بالوكيل
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير تقييم عقاري سعودي متخصص في تحليل جودة الأحياء. أرجع JSON فقط.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Agent API error:', error);
      return res.status(200).json({ 
        ok: false, 
        error: 'Agent request failed',
        fallback: true 
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(200).json({ 
        ok: false, 
        error: 'No response from agent',
        fallback: true 
      });
    }

    // استخراج JSON من الرد
    let result;
    try {
      // محاولة استخراج JSON من الرد
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse agent response:', content);
      return res.status(200).json({ 
        ok: false, 
        error: 'Invalid agent response',
        fallback: true 
      });
    }

    // التحقق من صحة البيانات
    if (typeof result.nqs !== 'number' || result.nqs < 0 || result.nqs > 100) {
      return res.status(200).json({ 
        ok: false, 
        error: 'Invalid NQS value',
        fallback: true 
      });
    }

    // إرجاع النتيجة
    return res.status(200).json({
      ok: true,
      source: 'agent',
      nqs: result.nqs,
      level: result.level || 'متوسط',
      notes: result.notes || 'تم حساب جودة الحي بواسطة الذكاء الاصطناعي',
      districtFound: true
    });

  } catch (error) {
    console.error('Unexpected error in agent API:', error);
    return res.status(200).json({ 
      ok: false, 
      error: 'Internal server error',
      fallback: true 
    });
  }
}

