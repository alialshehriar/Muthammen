// API لتحليل موقع على الخريطة باستخدام GPT
// Vercel Serverless Function

export default async function handler(req, res) {
  // السماح بـ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location data is required' });
    }

    // بناء الـ Prompt
    const prompt = `أنت محلل عقاري متخصص في السوق السعودي.

**بيانات الموقع:**
- المدينة: ${location.city}
- الحي: ${location.district}
- المنطقة: ${location.region}
- السعر المتوسط: ${location.avgPrice} ريال/م²
- الاتجاه: ${location.trend}
- النمو: ${location.growth}%
- عدد العينات: ${location.samples}

**المطلوب:**
قدم تحليلاً شاملاً وسريعاً (3-4 جمل) يتضمن:
1. تقييم الموقع
2. توصية (شراء/انتظار/تجنب)
3. السبب الرئيسي
4. توقعات قصيرة المدى

**قدم الإجابة بصيغة JSON:**
\`\`\`json
{
  "summary": "string",
  "recommendation": "string",
  "reason": "string",
  "forecast": "string",
  "score": number
}
\`\`\``;

    // استدعاء OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'أنت محلل عقاري سريع ودقيق. تقدم تحليلات موجزة ومفيدة.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return res.status(500).json({ error: 'Failed to get AI analysis' });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // استخراج JSON
    let result;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        result = JSON.parse(aiResponse);
      }
    } catch (e) {
      console.error('JSON Parse Error:', e);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    result.timestamp = new Date().toISOString();

    return res.status(200).json(result);

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

