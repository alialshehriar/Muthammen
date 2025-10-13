// API للتقييم العقاري باستخدام GPT الحقيقي
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
    const { propertyData } = req.body;

    if (!propertyData) {
      return res.status(400).json({ error: 'Property data is required' });
    }

    // بناء الـ Prompt للذكاء الاصطناعي
    const prompt = `أنت خبير تقييم عقاري سعودي متخصص مع أكثر من 20 عاماً من الخبرة.

**بيانات العقار:**
${JSON.stringify(propertyData, null, 2)}

**المطلوب منك:**
1. تحليل شامل للعقار بناءً على البيانات المقدمة
2. تقدير السعر العادل (ريال/م²)
3. تحديد نطاق السعر (الأدنى والأعلى)
4. تقييم مستوى الثقة في التقدير (%)
5. تقديم توصيات واضحة للمشتري/البائع
6. تحليل نقاط القوة والضعف
7. مقارنة مع السوق المحلي

**قدم الإجابة بصيغة JSON فقط:**
\`\`\`json
{
  "estimatedPrice": number,
  "priceRange": { "min": number, "max": number },
  "confidence": number,
  "analysis": "string",
  "recommendations": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "marketComparison": "string"
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
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير تقييم عقاري سعودي متخصص. تقدم تحليلات دقيقة ومفصلة بناءً على البيانات المتاحة.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return res.status(500).json({ error: 'Failed to get AI analysis' });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // استخراج JSON من الرد
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

    // إضافة علامة أن التقييم تم بواسطة AI
    result.usedAI = true;
    result.timestamp = new Date().toISOString();

    return res.status(200).json(result);

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

