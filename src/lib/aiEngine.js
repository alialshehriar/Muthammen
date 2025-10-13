/**
 * ═══════════════════════════════════════════════════════════════════════════
 * محرك الذكاء الاصطناعي المحلي لتقييم العقارات - aiEngine.js
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * هذا المحرك يعمل بالكامل في المتصفح دون الحاجة لخوادم خارجية
 * يستخدم نموذج أوزان متعدد الطبقات لحساب القيمة التقديرية للعقار
 * 
 * المنطق الأساسي:
 * 1. حساب السعر الأساسي من المساحة والموقع
 * 2. تطبيق معاملات التعديل حسب خصائص العقار (~100 متغير)
 * 3. حساب جودة الحي تلقائياً (NQS) وتطبيقها
 * 4. حساب مستوى الثقة بناءً على عدد الحقول المُدخلة
 * 5. التعلم التدريجي من تقييمات المستخدمين (localStorage)
 */

// استيراد محرك NQS التلقائي
import { computeNeighborhoodQuality, applyNQSAdjustment, getNQSExplanation } from './nqsEngine.js';

// ═══════════════════════════════════════════════════════════════════════════
// الأوزان الأساسية (Base Weights)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * أسعار المتر المربع الأساسية حسب المدينة (ريال/م²)
 * هذه القيم تمثل متوسط السوق ويمكن تحديثها
 */
const CITY_BASE_PRICES = {
  'الرياض': 3500,
  'جدة': 3200,
  'مكة': 3000,
  'المدينة': 2800,
  'الدمام': 2700,
  'الخبر': 2900,
  'الظهران': 3100,
  'الطائف': 2400,
  'تبوك': 2200,
  'بريدة': 2100,
  'خميس مشيط': 2000,
  'حائل': 1900,
  'نجران': 1800,
  'جازان': 1700,
  'ينبع': 2300,
  'الأحساء': 2000,
  'القطيف': 2500,
  'أبها': 2200,
  'عرعر': 1600,
  'سكاكا': 1500,
  'أخرى': 2000
};

/**
 * معاملات تعديل نوع العقار (Property Type Multipliers)
 * تؤثر على السعر النهائي بنسبة مئوية
 */
const PROPERTY_TYPE_MULTIPLIERS = {
  'فيلا': 1.15,      // +15% للفلل
  'شقة': 0.95,       // -5% للشقق
  'دور': 1.05,       // +5% للأدوار
  'عمارة': 1.25,     // +25% للعمائر
  'أرض': 0.70,       // -30% للأراضي (سعر أقل للمتر)
  'دوبلكس': 1.10,    // +10% للدوبلكس
  'استوديو': 0.85,   // -15% للاستوديو
  'بنتهاوس': 1.40,   // +40% للبنتهاوس
  'تاون هاوس': 1.08  // +8% للتاون هاوس
};

/**
 * معاملات عمر العقار (Age Depreciation)
 * كل سنة تقلل من القيمة بنسبة معينة
 */
const AGE_DEPRECIATION = {
  'جديد': 1.10,           // +10% للعقارات الجديدة
  '1-5': 1.00,            // لا تغيير
  '6-10': 0.95,           // -5%
  '11-15': 0.88,          // -12%
  '16-20': 0.80,          // -20%
  '21-30': 0.70,          // -30%
  'أكثر من 30': 0.60     // -40%
};

/**
 * معاملات الحي (Neighborhood Quality)
 * تعتمد على مستوى الحي وجودة الخدمات
 */
const NEIGHBORHOOD_MULTIPLIERS = {
  'راقي جداً': 1.35,
  'راقي': 1.20,
  'متوسط إلى راقي': 1.10,
  'متوسط': 1.00,
  'شعبي': 0.85,
  'قديم': 0.75
};

// ═══════════════════════════════════════════════════════════════════════════
// أوزان التفاصيل الدقيقة (Fine-Grained Weights)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * معاملات الواجهة (Facade Direction)
 * الواجهات المتعددة والاتجاهات المفضلة تزيد القيمة
 */
const FACADE_WEIGHTS = {
  'شمالية': 1.08,
  'جنوبية': 1.05,
  'شرقية': 1.03,
  'غربية': 1.02,
  'شمالية شرقية': 1.10,
  'شمالية غربية': 1.09,
  'جنوبية شرقية': 1.07,
  'جنوبية غربية': 1.06,
  'ثلاث واجهات': 1.18,
  'أربع واجهات': 1.25
};

/**
 * معاملات الشارع (Street Width)
 * الشوارع الأوسع تزيد من قيمة العقار
 */
const STREET_WIDTH_WEIGHTS = {
  '< 10م': 0.95,
  '10-15م': 1.00,
  '16-20م': 1.08,
  '21-30م': 1.15,
  '> 30م': 1.22
};

/**
 * معاملات التشطيب (Finishing Quality)
 */
const FINISHING_WEIGHTS = {
  'سوبر لوكس': 1.25,
  'لوكس': 1.15,
  'ممتاز': 1.08,
  'جيد جداً': 1.03,
  'جيد': 1.00,
  'متوسط': 0.95,
  'بسيط': 0.88,
  'على العظم': 0.75
};

/**
 * إضافات ثابتة للمرافق (Fixed Additions)
 * قيم بالريال تُضاف للسعر النهائي
 */
const AMENITY_VALUES = {
  مسبح: 80000,
  مصعد: 60000,
  مولد_كهرباء: 35000,
  نظام_أمني: 25000,
  نظام_إطفاء: 20000,
  خزان_ماء: 15000,
  سخان_مركزي: 30000,
  تكييف_مركزي: 50000,
  غرفة_خادمة: 40000,
  غرفة_سائق: 35000,
  مجلس_رجال: 45000,
  صالة_رياضية: 70000,
  ملحق_خارجي: 55000,
  مطبخ_خارجي: 25000,
  موقف_مظلل: 20000
};

/**
 * معاملات القرب من الخدمات (Proximity Multipliers)
 * كل خدمة قريبة تضيف نسبة صغيرة للقيمة
 */
const PROXIMITY_WEIGHTS = {
  مسجد: 1.02,
  مدرسة: 1.03,
  مستشفى: 1.04,
  مركز_تجاري: 1.05,
  حديقة: 1.03,
  محطة_وقود: 1.01,
  مواصلات_عامة: 1.02,
  جامعة: 1.03
};

/**
 * معاملات الإطلالة (View Quality)
 */
const VIEW_WEIGHTS = {
  'بحر': 1.20,
  'جبل': 1.12,
  'حديقة': 1.10,
  'شارع رئيسي': 1.05,
  'شارع فرعي': 1.00,
  'مبنى مقابل': 0.97
};

// ═══════════════════════════════════════════════════════════════════════════
// دالة الحساب الرئيسية (Main Calculation Function)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * حساب القيمة التقديرية للعقار
 * @param {Object} formData - بيانات النموذج الكاملة
 * @returns {Object} - النتيجة مع السعر ومستوى الثقة والتفاصيل
 */
export async function calculatePropertyValue(formData) {
  // التحقق من البيانات الأساسية المطلوبة
  if (!formData.area || !formData.city) {
    return {
      estimatedValue: 0,
      confidence: 0,
      error: 'يرجى إدخال المساحة والمدينة على الأقل'
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 1: حساب السعر الأساسي
  // ═══════════════════════════════════════════════════════════════════════
  
  const area = parseFloat(formData.area);
  const basePrice = CITY_BASE_PRICES[formData.city] || CITY_BASE_PRICES['أخرى'];
  let totalPrice = area * basePrice;
  
  // عداد الحقول المُدخلة لحساب مستوى الثقة
  let filledFieldsCount = 2; // المساحة والمدينة
  const totalPossibleFields = 100; // إجمالي الحقول المتاحة
  
  // كائن لتخزين تفاصيل التعديلات
  const adjustments = {
    baseCalculation: `${area} م² × ${basePrice} ريال/م² = ${totalPrice.toLocaleString('ar-SA')} ريال`,
    appliedFactors: []
  };

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 2: تطبيق معامل نوع العقار
  // ═══════════════════════════════════════════════════════════════════════
  
  if (formData.propertyType) {
    const multiplier = PROPERTY_TYPE_MULTIPLIERS[formData.propertyType] || 1.0;
    totalPrice *= multiplier;
    adjustments.appliedFactors.push({
      factor: 'نوع العقار',
      value: formData.propertyType,
      multiplier: multiplier,
      impact: `${((multiplier - 1) * 100).toFixed(1)}%`
    });
    filledFieldsCount++;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 3: تطبيق معامل العمر
  // ═══════════════════════════════════════════════════════════════════════
  
  if (formData.age) {
    const multiplier = AGE_DEPRECIATION[formData.age] || 1.0;
    totalPrice *= multiplier;
    adjustments.appliedFactors.push({
      factor: 'عمر العقار',
      value: formData.age,
      multiplier: multiplier,
      impact: `${((multiplier - 1) * 100).toFixed(1)}%`
    });
    filledFieldsCount++;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 4: تطبيق معامل الحي
  // ═══════════════════════════════════════════════════════════════════════
  
  if (formData.neighborhood) {
    const multiplier = NEIGHBORHOOD_MULTIPLIERS[formData.neighborhood] || 1.0;
    totalPrice *= multiplier;
    adjustments.appliedFactors.push({
      factor: 'مستوى الحي',
      value: formData.neighborhood,
      multiplier: multiplier,
      impact: `${((multiplier - 1) * 100).toFixed(1)}%`
    });
    filledFieldsCount++;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 5: تطبيق معاملات التفاصيل الدقيقة
  // ═══════════════════════════════════════════════════════════════════════
  
  // الواجهة
  if (formData.facade) {
    const multiplier = FACADE_WEIGHTS[formData.facade] || 1.0;
    totalPrice *= multiplier;
    adjustments.appliedFactors.push({
      factor: 'الواجهة',
      value: formData.facade,
      multiplier: multiplier,
      impact: `${((multiplier - 1) * 100).toFixed(1)}%`
    });
    filledFieldsCount++;
  }

  // عرض الشارع
  if (formData.streetWidth) {
    const multiplier = STREET_WIDTH_WEIGHTS[formData.streetWidth] || 1.0;
    totalPrice *= multiplier;
    adjustments.appliedFactors.push({
      factor: 'عرض الشارع',
      value: formData.streetWidth,
      multiplier: multiplier,
      impact: `${((multiplier - 1) * 100).toFixed(1)}%`
    });
    filledFieldsCount++;
  }

  // التشطيب
  if (formData.finishing) {
    const multiplier = FINISHING_WEIGHTS[formData.finishing] || 1.0;
    totalPrice *= multiplier;
    adjustments.appliedFactors.push({
      factor: 'التشطيب',
      value: formData.finishing,
      multiplier: multiplier,
      impact: `${((multiplier - 1) * 100).toFixed(1)}%`
    });
    filledFieldsCount++;
  }

  // الإطلالة
  if (formData.view) {
    const multiplier = VIEW_WEIGHTS[formData.view] || 1.0;
    totalPrice *= multiplier;
    adjustments.appliedFactors.push({
      factor: 'الإطلالة',
      value: formData.view,
      multiplier: multiplier,
      impact: `${((multiplier - 1) * 100).toFixed(1)}%`
    });
    filledFieldsCount++;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 6: إضافة قيم الغرف والمرافق
  // ═══════════════════════════════════════════════════════════════════════
  
  // عدد الغرف (كل غرفة إضافية بعد 3 غرف تضيف 2%)
  if (formData.bedrooms) {
    const bedrooms = parseInt(formData.bedrooms);
    if (bedrooms > 3) {
      const extraRooms = bedrooms - 3;
      const multiplier = 1 + (extraRooms * 0.02);
      totalPrice *= multiplier;
      adjustments.appliedFactors.push({
        factor: 'عدد الغرف',
        value: `${bedrooms} غرفة`,
        multiplier: multiplier,
        impact: `+${(extraRooms * 2)}%`
      });
    }
    filledFieldsCount++;
  }

  // عدد دورات المياه (كل دورة إضافية بعد 2 تضيف 1.5%)
  if (formData.bathrooms) {
    const bathrooms = parseInt(formData.bathrooms);
    if (bathrooms > 2) {
      const extraBaths = bathrooms - 2;
      const multiplier = 1 + (extraBaths * 0.015);
      totalPrice *= multiplier;
      adjustments.appliedFactors.push({
        factor: 'دورات المياه',
        value: `${bathrooms} دورة`,
        multiplier: multiplier,
        impact: `+${(extraBaths * 1.5)}%`
      });
    }
    filledFieldsCount++;
  }

  // المرافق الإضافية
  let amenitiesTotal = 0;
  const amenitiesList = [];
  
  Object.keys(AMENITY_VALUES).forEach(amenity => {
    if (formData[amenity] === true) {
      amenitiesTotal += AMENITY_VALUES[amenity];
      amenitiesList.push({
        name: amenity.replace(/_/g, ' '),
        value: AMENITY_VALUES[amenity]
      });
      filledFieldsCount++;
    }
  });

  if (amenitiesTotal > 0) {
    totalPrice += amenitiesTotal;
    adjustments.appliedFactors.push({
      factor: 'المرافق الإضافية',
      value: amenitiesList.map(a => a.name).join('، '),
      addition: amenitiesTotal,
      impact: `+${amenitiesTotal.toLocaleString('ar-SA')} ريال`
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 7: معاملات القرب من الخدمات
  // ═══════════════════════════════════════════════════════════════════════
  
  let proximityMultiplier = 1.0;
  const nearbyServices = [];
  
  Object.keys(PROXIMITY_WEIGHTS).forEach(service => {
    if (formData[`قرب_${service}`] === true) {
      proximityMultiplier *= PROXIMITY_WEIGHTS[service];
      nearbyServices.push(service.replace(/_/g, ' '));
      filledFieldsCount++;
    }
  });

  if (nearbyServices.length > 0) {
    totalPrice *= proximityMultiplier;
    adjustments.appliedFactors.push({
      factor: 'القرب من الخدمات',
      value: nearbyServices.join('، '),
      multiplier: proximityMultiplier,
      impact: `${((proximityMultiplier - 1) * 100).toFixed(1)}%`
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 8: معاملات إضافية متنوعة
  // ═══════════════════════════════════════════════════════════════════════
  
  // موقف سيارات (كل موقف إضافي يضيف 1%)
  if (formData.parking) {
    const parkingSpots = parseInt(formData.parking);
    if (parkingSpots > 0) {
      const multiplier = 1 + (parkingSpots * 0.01);
      totalPrice *= multiplier;
      adjustments.appliedFactors.push({
        factor: 'مواقف السيارات',
        value: `${parkingSpots} موقف`,
        multiplier: multiplier,
        impact: `+${parkingSpots}%`
      });
      filledFieldsCount++;
    }
  }

  // الطابق (الطوابق العليا أغلى في الشقق)
  if (formData.floor && formData.propertyType === 'شقة') {
    const floor = parseInt(formData.floor);
    if (floor > 0) {
      const multiplier = 1 + (floor * 0.005); // كل طابق يضيف 0.5%
      totalPrice *= multiplier;
      adjustments.appliedFactors.push({
        factor: 'رقم الطابق',
        value: `الطابق ${floor}`,
        multiplier: multiplier,
        impact: `+${(floor * 0.5).toFixed(1)}%`
      });
      filledFieldsCount++;
    }
  }

  // مساحة الأرض (للفلل والعمائر)
  if (formData.landArea && ['فيلا', 'عمارة', 'أرض'].includes(formData.propertyType)) {
    const landArea = parseFloat(formData.landArea);
    const buildingArea = parseFloat(formData.area);
    
    // إذا كانت مساحة الأرض أكبر من مساحة البناء، نضيف قيمة للأرض الفاضية
    if (landArea > buildingArea) {
      const extraLand = landArea - buildingArea;
      const landValue = extraLand * (basePrice * 0.5); // الأرض الفاضية بنصف سعر المتر
      totalPrice += landValue;
      adjustments.appliedFactors.push({
        factor: 'الأرض الفاضية',
        value: `${extraLand} م²`,
        addition: landValue,
        impact: `+${landValue.toLocaleString('ar-SA')} ريال`
      });
    }
    filledFieldsCount++;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 9: حساب مستوى الثقة (Confidence Score)
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * مستوى الثقة يعتمد على:
   * 1. عدد الحقول المُدخلة (70% من الوزن)
   * 2. جودة البيانات الأساسية (30% من الوزن)
   */
  
  const fieldsRatio = filledFieldsCount / totalPossibleFields;
  let confidence = fieldsRatio * 70; // 70% من الوزن للحقول
  
  // إضافة نقاط للبيانات الأساسية المهمة
  if (formData.propertyType) confidence += 5;
  if (formData.age) confidence += 5;
  if (formData.neighborhood) confidence += 5;
  if (formData.finishing) confidence += 5;
  if (formData.bedrooms && formData.bathrooms) confidence += 5;
  if (formData.facade) confidence += 3;
  if (formData.streetWidth) confidence += 2;
  
  // تقريب مستوى الثقة (لا يتجاوز 95%)
  confidence = Math.min(Math.round(confidence), 95);

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 10: حساب جودة الحي التلقائي (NQS - Neighborhood Quality Score)
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * حساب NQS تلقائياً بناءً على:
   * - الإحداثيات (إن وُجدت)
   * - اسم الحي والمدينة
   * 
   * الأولوية:
   * 1. محاولة استخدام API الوكيل (إن توفر)
   * 2. Fallback للحساب المحلي
   * 
   * هذا الحساب يتم خلف الكواليس ولا يظهر كحقل إدخال للمستخدم
   */
  let nqsResult = null;
  let nqsAdjustment = null;
  let usedAgent = false;
  
  try {
    // محاولة 1: استخدام API الوكيل
    try {
      const agentResponse = await fetch('/api/agent/score-nqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          city: formData.city,
          district: formData.district,
          coords: formData.coords || null,
          extras: {
            propertyType: formData.propertyType,
            area: formData.area
          }
        })
      });

      const agentData = await agentResponse.json();

      if (agentData.ok && agentData.source === 'agent') {
        // نجح الوكيل - استخدم نتيجته
        nqsResult = {
          score: agentData.nqs,
          level: agentData.level,
          districtFound: agentData.districtFound,
          source: 'agent',
          notes: agentData.notes
        };
        usedAgent = true;
        console.log('✅ استخدام نتيجة الوكيل:', nqsResult);
      } else if (agentData.fallback) {
        // الوكيل طلب Fallback
        console.log('⚠️ الوكيل غير متاح، استخدام الحساب المحلي');
        throw new Error('Agent fallback requested');
      }
    } catch (agentError) {
      // فشل الوكيل - استخدم الحساب المحلي
      console.log('⚠️ فشل الوكيل، استخدام الحساب المحلي:', agentError.message);
      
      // محاولة 2: الحساب المحلي (Fallback)
      nqsResult = computeNeighborhoodQuality({
        coords: formData.coords || null,
        district: formData.district || null,
        city: formData.city
      });
      usedAgent = false;
    }
    
    // تطبيق تعديل NQS على السعر (محدود: -6% إلى +6%)
    if (nqsResult && nqsResult.score) {
      nqsAdjustment = applyNQSAdjustment(nqsResult.score, totalPrice);
      totalPrice = nqsAdjustment.adjustedPrice;
      
      // إضافة NQS إلى العوامل المطبقة
      adjustments.appliedFactors.push({
        factor: usedAgent ? 'جودة الحي (ذكاء اصطناعي)' : 'جودة الحي (تلقائي)',
        value: nqsResult.level,
        score: nqsResult.score,
        multiplier: 1 + (parseFloat(nqsAdjustment.adjustmentPercent) / 100),
        impact: `${nqsAdjustment.adjustmentPercent > 0 ? '+' : ''}${nqsAdjustment.adjustmentPercent}%`
      });
    }
  } catch (error) {
    console.warn('تعذر حساب NQS:', error);
    // الاستمرار بدون NQS في حالة الخطأ
    usedAgent = false;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 11: التعلم التدريجي (Progressive Learning)
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * حفظ التقييم في localStorage للتعلم المستقبلي
   * يمكن استخدام هذه البيانات لتحسين الأوزان تدريجياً
   */
  saveEvaluationToHistory({
    timestamp: new Date().toISOString(),
    formData: formData,
    estimatedValue: totalPrice,
    confidence: confidence,
    filledFieldsCount: filledFieldsCount
  });

  // ═══════════════════════════════════════════════════════════════════════
  // الخطوة 12: إرجاع النتيجة النهائية
  // ═══════════════════════════════════════════════════════════════════════
  
  return {
    estimatedValue: Math.round(totalPrice),
    confidence: confidence,
    filledFieldsCount: filledFieldsCount,
    totalPossibleFields: totalPossibleFields,
    adjustments: adjustments,
    priceRange: {
      min: Math.round(totalPrice * 0.90), // -10%
      max: Math.round(totalPrice * 1.10)  // +10%
    },
    recommendations: generateRecommendations(formData, confidence),
    // إضافة معلومات NQS (للعرض الداخلي فقط)
    nqs: nqsResult ? {
      score: nqsResult.score,
      level: nqsResult.level,
      explanation: getNQSExplanation(nqsResult),
      districtFound: nqsResult.districtFound,
      source: nqsResult.source || 'local'
    } : null,
    // علامة استخدام الوكيل (لإخفاء عداد الدقة)
    usedAgent: usedAgent
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// دوال مساعدة (Helper Functions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * حفظ التقييم في السجل المحلي
 * @param {Object} evaluation - بيانات التقييم
 */
function saveEvaluationToHistory(evaluation) {
  try {
    const history = JSON.parse(localStorage.getItem('evaluationHistory') || '[]');
    history.push(evaluation);
    
    // الاحتفاظ بآخر 100 تقييم فقط
    if (history.length > 100) {
      history.shift();
    }
    
    localStorage.setItem('evaluationHistory', JSON.stringify(history));
  } catch (error) {
    console.warn('تعذر حفظ التقييم في السجل:', error);
  }
}

/**
 * توليد توصيات لتحسين دقة التقييم
 * @param {Object} formData - بيانات النموذج
 * @param {Number} confidence - مستوى الثقة الحالي
 * @returns {Array} - قائمة التوصيات
 */
function generateRecommendations(formData, confidence) {
  const recommendations = [];
  
  if (confidence < 50) {
    recommendations.push('لتحسين دقة التقييم، يُنصح بإدخال المزيد من التفاصيل');
  }
  
  if (!formData.propertyType) {
    recommendations.push('إضافة نوع العقار سيحسن الدقة بشكل كبير');
  }
  
  if (!formData.age) {
    recommendations.push('تحديد عمر العقار مهم للحصول على تقييم دقيق');
  }
  
  if (!formData.neighborhood) {
    recommendations.push('مستوى الحي له تأثير كبير على القيمة');
  }
  
  if (!formData.finishing) {
    recommendations.push('جودة التشطيب تؤثر بشكل ملحوظ على السعر');
  }
  
  if (!formData.bedrooms || !formData.bathrooms) {
    recommendations.push('عدد الغرف ودورات المياه من العوامل المهمة');
  }
  
  if (confidence >= 70) {
    recommendations.push('مستوى الثقة جيد! يمكنك الاعتماد على هذا التقييم');
  }
  
  return recommendations;
}

/**
 * الحصول على إحصائيات من سجل التقييمات
 * @returns {Object} - إحصائيات الاستخدام
 */
export function getEvaluationStats() {
  try {
    const history = JSON.parse(localStorage.getItem('evaluationHistory') || '[]');
    
    if (history.length === 0) {
      return {
        totalEvaluations: 0,
        averageConfidence: 0,
        mostCommonCity: null
      };
    }
    
    const totalConfidence = history.reduce((sum, ev) => sum + ev.confidence, 0);
    const cities = history.map(ev => ev.formData.city);
    const mostCommonCity = cities.sort((a, b) =>
      cities.filter(c => c === a).length - cities.filter(c => c === b).length
    ).pop();
    
    return {
      totalEvaluations: history.length,
      averageConfidence: Math.round(totalConfidence / history.length),
      mostCommonCity: mostCommonCity
    };
  } catch (error) {
    return {
      totalEvaluations: 0,
      averageConfidence: 0,
      mostCommonCity: null
    };
  }
}

/**
 * مسح سجل التقييمات
 */
export function clearEvaluationHistory() {
  try {
    localStorage.removeItem('evaluationHistory');
    return true;
  } catch (error) {
    console.error('تعذر مسح السجل:', error);
    return false;
  }
}

