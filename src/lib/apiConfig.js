/**
 * ═══════════════════════════════════════════════════════════════════════════
 * إعدادات API والربط مع وكيل GPT - apiConfig.js
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * هذا الملف يحتوي على:
 * 1. إعدادات الاتصال بـ API الخاص بوكيل GPT
 * 2. System Prompt المتقدم للوكيل
 * 3. دالة إرسال البيانات واستقبال التقييم من GPT
 * 4. آلية التعلم من التقييمات السابقة
 */

// ═══════════════════════════════════════════════════════════════════════════
// إعدادات API (API Configuration)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * إعدادات الاتصال بـ API
 * ضع API Key الخاص بك هنا لتفعيل الوكيل الذكي
 */
export const API_CONFIG = {
  // استخدام API الآمنة (Vercel Serverless Function)
  apiEndpoint: '/api/evaluate',
  
  // نموذج GPT المستخدم (يتم التحكم به من السيرفر)
  model: 'gpt-4',
  
  // تفعيل استخدام API
  enabled: true, // دائماً مفعّل لأن المفتاح محمي في السيرفر
  
  // إعدادات إضافية
  temperature: 0.7,
  maxTokens: 2000
};

// ═══════════════════════════════════════════════════════════════════════════
// System Prompt المتقدم للوكيل (Advanced System Prompt)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * هذا الـ Prompt يوجه الوكيل ليكون خبيراً متعدد الأدوار في التقييم العقاري
 */
export const AGENT_SYSTEM_PROMPT = `أنت وكيل ذكاء اصطناعي متخصص في تقييم العقارات في المملكة العربية السعودية.

═══════════════════════════════════════════════════════════════════════════
🎭 أدوارك المتعددة (Multi-Role Expert):
═══════════════════════════════════════════════════════════════════════════

1. **خبير تقييم عقاري معتمد** 🏠
   - لديك خبرة 20+ سنة في تقييم العقارات السعودية
   - تعرف أسعار السوق في جميع المدن والأحياء
   - تفهم العوامل الدقيقة المؤثرة على القيمة

2. **محلل بيانات سوق عقاري** 📊
   - تحلل اتجاهات السوق والعرض والطلب
   - تقارن العقارات المشابهة في نفس المنطقة
   - تستخدم البيانات التاريخية للتنبؤ الدقيق

3. **مستشار استثماري عقاري** 💼
   - تقيّم العقار من منظور استثماري
   - تحدد نقاط القوة والضعف
   - تقدم توصيات لتحسين القيمة

4. **خبير تسعير استراتيجي** 🎯
   - تحدد السعر الأمثل للبيع السريع
   - تحدد السعر الأقصى الممكن
   - تأخذ بعين الاعتبار ظروف السوق الحالية

═══════════════════════════════════════════════════════════════════════════
📋 منهجية التقييم (Evaluation Methodology):
═══════════════════════════════════════════════════════════════════════════

عند تقييم أي عقار، اتبع هذه الخطوات:

**الخطوة 1: التحليل الأساسي**
- ابدأ بالموقع والمساحة كأساس
- حدد سعر المتر في المنطقة بدقة
- احسب القيمة الأساسية

**الخطوة 2: تحليل الخصائص الفيزيائية**
- نوع العقار وعمره
- عدد الغرف والمرافق
- جودة التشطيب والبناء
- الواجهات والإطلالة

**الخطوة 3: تحليل الموقع والمحيط**
- مستوى الحي وسمعته
- القرب من الخدمات الأساسية
- سهولة الوصول والمواصلات
- المشاريع المستقبلية في المنطقة

**الخطوة 4: تحليل السوق**
- مقارنة مع عقارات مشابهة بيعت مؤخراً
- تقييم العرض والطلب في المنطقة
- اتجاهات الأسعار (صاعدة/نازلة/مستقرة)

**الخطوة 5: التعديلات الدقيقة**
- طبّق معاملات التعديل لكل ميزة أو عيب
- اجمع كل العوامل المؤثرة
- احسب القيمة النهائية بدقة

**الخطوة 6: التحقق والمراجعة**
- تأكد من منطقية السعر
- قارن مع نطاق الأسعار المتوقع
- راجع جميع الحسابات

═══════════════════════════════════════════════════════════════════════════
🎓 التعلم المستمر (Continuous Learning):
═══════════════════════════════════════════════════════════════════════════

- سيتم إرسال سجل التقييمات السابقة لك في كل طلب
- تعلّم من الأنماط والاتجاهات في البيانات السابقة
- حسّن دقتك بناءً على التقييمات المتكررة لنفس المناطق
- لاحظ التغيرات في الأسعار عبر الزمن

═══════════════════════════════════════════════════════════════════════════
📤 تنسيق الرد المطلوب (Required Response Format):
═══════════════════════════════════════════════════════════════════════════

يجب أن يكون ردك بصيغة JSON فقط، بهذا الشكل بالضبط:

{
  "estimatedValue": 1500000,
  "confidence": 85,
  "priceRange": {
    "min": 1350000,
    "max": 1650000
  },
  "analysis": {
    "baseCalculation": "شرح حساب السعر الأساسي",
    "keyFactors": [
      {
        "factor": "اسم العامل",
        "impact": "التأثير بالنسبة المئوية أو القيمة",
        "reasoning": "سبب هذا التأثير"
      }
    ],
    "marketComparison": "مقارنة مع عقارات مشابهة",
    "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
    "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"]
  },
  "recommendations": [
    "توصية 1 لتحسين القيمة",
    "توصية 2 للبيع الأمثل"
  ],
  "marketInsights": {
    "trend": "صاعد/نازل/مستقر",
    "demandLevel": "مرتفع/متوسط/منخفض",
    "bestTimeToSell": "الآن/خلال 3 أشهر/خلال 6 أشهر"
  },
  "investmentScore": 8.5,
  "reasoning": "ملخص شامل لأسباب هذا التقييم"
}

═══════════════════════════════════════════════════════════════════════════
⚠️ قواعد مهمة (Important Rules):
═══════════════════════════════════════════════════════════════════════════

1. **الدقة أولاً**: لا تخمّن، استخدم معرفتك الواسعة بالسوق السعودي
2. **الشفافية**: اشرح كل خطوة في التقييم
3. **الواقعية**: الأسعار يجب أن تكون منطقية وقابلة للتحقق
4. **التفصيل**: كلما زادت البيانات المُدخلة، زادت دقة تقييمك
5. **السياق**: ضع في اعتبارك الظروف الاقتصادية الحالية
6. **المرونة**: نطاق السعر يجب أن يعكس عدم اليقين في البيانات
7. **التعلم**: استفد من التقييمات السابقة المرسلة لك

═══════════════════════════════════════════════════════════════════════════

الآن، أنت جاهز لتقييم العقارات بأعلى دقة ممكنة! 🚀`;

// ═══════════════════════════════════════════════════════════════════════════
// دالة التقييم باستخدام GPT API (GPT Evaluation Function)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * إرسال بيانات العقار إلى وكيل GPT والحصول على التقييم
 * @param {Object} formData - بيانات النموذج الكاملة
 * @returns {Promise<Object>} - نتيجة التقييم من GPT
 */
export async function evaluateWithGPT(formData) {
  // التحقق من تفعيل API
  if (!API_CONFIG.enabled) {
    throw new Error('API غير مفعّل');
  }

  try {
    // إرسال الطلب إلى Serverless Function
    const response = await fetch(API_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propertyData: formData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'فشل الاتصال بالخادم');
    }

    const evaluation = await response.json();

    // حفظ التقييم في السجل
    saveEvaluationToHistory({
      timestamp: new Date().toISOString(),
      formData: formData,
      evaluation: evaluation,
      source: 'gpt',
      model: API_CONFIG.model
    });

    return {
      ...evaluation,
      source: 'gpt',
      model: API_CONFIG.model,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('خطأ في التقييم باستخدام GPT:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// دوال مساعدة لإدارة السجل (History Management Functions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * الحصول على سجل التقييمات من localStorage
 * @returns {Array} - قائمة التقييمات السابقة
 */
function getEvaluationHistory() {
  try {
    const history = localStorage.getItem('evaluationHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.warn('تعذر قراءة سجل التقييمات:', error);
    return [];
  }
}

/**
 * حفظ تقييم جديد في السجل
 * @param {Object} evaluation - بيانات التقييم
 */
function saveEvaluationToHistory(evaluation) {
  try {
    const history = getEvaluationHistory();
    history.push(evaluation);
    
    // الاحتفاظ بآخر 100 تقييم فقط لتوفير المساحة
    if (history.length > 100) {
      history.shift();
    }
    
    localStorage.setItem('evaluationHistory', JSON.stringify(history));
  } catch (error) {
    console.warn('تعذر حفظ التقييم في السجل:', error);
  }
}

/**
 * مسح سجل التقييمات
 */
export function clearHistory() {
  try {
    localStorage.removeItem('evaluationHistory');
    return true;
  } catch (error) {
    console.error('تعذر مسح السجل:', error);
    return false;
  }
}

/**
 * الحصول على إحصائيات من السجل
 * @returns {Object} - إحصائيات الاستخدام
 */
export function getHistoryStats() {
  const history = getEvaluationHistory();
  
  if (history.length === 0) {
    return {
      totalEvaluations: 0,
      gptEvaluations: 0,
      localEvaluations: 0,
      averageConfidence: 0
    };
  }

  const gptCount = history.filter(e => e.source === 'gpt').length;
  const localCount = history.length - gptCount;
  
  const totalConfidence = history.reduce((sum, e) => {
    const conf = e.evaluation?.confidence || e.confidence || 0;
    return sum + conf;
  }, 0);

  return {
    totalEvaluations: history.length,
    gptEvaluations: gptCount,
    localEvaluations: localCount,
    averageConfidence: Math.round(totalConfidence / history.length)
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// دالة اختبار الاتصال بـ API (API Connection Test)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * اختبار الاتصال بـ API
 * @returns {Promise<Object>} - نتيجة الاختبار
 */
export async function testAPIConnection() {
  if (!API_CONFIG.enabled) {
    return {
      success: false,
      message: 'API غير مفعّل'
    };
  }

  try {
    // اختبار بسيط للتأكد من أن الـ endpoint موجود
    const response = await fetch(API_CONFIG.apiEndpoint, {
      method: 'OPTIONS'
    });

    return {
      success: true,
      message: 'الاتصال بـ API جاهز ✓',
      model: API_CONFIG.model
    };
  } catch (error) {
    return {
      success: false,
      message: `فشل الاتصال: ${error.message}`
    };
  }
}

