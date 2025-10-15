/**
 * ═══════════════════════════════════════════════════════════════════════════
 * محرك حساب جودة الحي التلقائي (NQS - Neighborhood Quality Score)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * هذا المحرك يعمل بشكل تلقائي خلف الكواليس ولا يظهر للمستخدم كحقل إدخال.
 * يحسب درجة جودة الحي (0-100) بناءً على عدة عوامل محلية.
 * 
 * المدخلات:
 * - coords: إحداثيات العقار [lng, lat]
 * - district: اسم الحي (اختياري)
 * - city: اسم المدينة
 * 
 * المخرجات:
 * - score: درجة الجودة (0-100)
 * - level: المستوى (مرتفع/متوسط/منخفض)
 * - factors: تفاصيل العوامل المؤثرة
 */

// استيراد البيانات المحلية
import amenitiesData from '../data/context/amenities.json';
import roadsData from '../data/context/roads.json';
import parksData from '../data/context/parks.json';
import schoolsData from '../data/context/schools.json';
import servicesData from '../data/context/services.json';
import pricePercentilesData from '../data/context/price_percentiles.json';

/**
 * الأوزان المستخدمة في حساب NQS
 * يمكن تعديل هذه الأوزان لضبط أهمية كل عامل
 */
const WEIGHTS = {
  services: 0.25,        // كثافة الخدمات الأساسية
  accessibility: 0.20,   // سهولة النفاذ للطرق
  greenery: 0.15,        // المساحات الخضراء
  education: 0.15,       // المؤسسات التعليمية
  pricePercentile: 0.20, // موقع الحي في الشرائح السعرية
  noise: 0.05           // الإزعاج/الضوضاء (سالب)
};

/**
 * إيجاد أقرب حي للإحداثيات المعطاة
 * @param {Array} coords - [lng, lat]
 * @returns {string|null} مفتاح الحي
 */
function findNearestDistrict(coords) {
  if (!coords || coords.length !== 2) return null;
  
  const [targetLng, targetLat] = coords;
  let nearestKey = null;
  let minDistance = Infinity;
  
  // البحث في جميع الأحياء
  Object.keys(amenitiesData.districts).forEach(key => {
    const district = amenitiesData.districts[key];
    const [lng, lat] = district.coords;
    
    // حساب المسافة التقريبية (Haversine مبسط)
    const dLng = lng - targetLng;
    const dLat = lat - targetLat;
    const distance = Math.sqrt(dLng * dLng + dLat * dLat);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestKey = key;
    }
  });
  
  return nearestKey;
}

/**
 * إيجاد مفتاح الحي بناءً على الاسم والمدينة
 * @param {string} district - اسم الحي
 * @param {string} city - اسم المدينة
 * @returns {string|null} مفتاح الحي
 */
function findDistrictKey(district, city) {
  if (!district || !city) return null;
  
  // البحث المباشر
  for (const [key, data] of Object.entries(amenitiesData.districts)) {
    if (data.district === district && data.city === city) {
      return key;
    }
  }
  
  return null;
}

/**
 * حساب درجة الخدمات (0-100)
 * @param {string} districtKey - مفتاح الحي
 * @returns {number} درجة الخدمات
 */
function calculateServicesScore(districtKey) {
  const amenities = amenitiesData.districts[districtKey];
  if (!amenities) return 50; // قيمة افتراضية
  
  // استخدام density_score المحسوب مسبقاً
  return amenities.density_score || 50;
}

/**
 * حساب درجة سهولة النفاذ (0-100)
 * @param {string} districtKey - مفتاح الحي
 * @returns {number} درجة النفاذ
 */
function calculateAccessibilityScore(districtKey) {
  const roads = roadsData.districts[districtKey];
  if (!roads) return 50;
  
  return roads.accessibility_score || 50;
}

/**
 * حساب درجة المساحات الخضراء (0-100)
 * @param {string} districtKey - مفتاح الحي
 * @returns {number} درجة المساحات الخضراء
 */
function calculateGreeneryScore(districtKey) {
  const parks = parksData.districts[districtKey];
  if (!parks) return 50;
  
  return parks.greenery_score || 50;
}

/**
 * حساب درجة التعليم (0-100)
 * @param {string} districtKey - مفتاح الحي
 * @returns {number} درجة التعليم
 */
function calculateEducationScore(districtKey) {
  const schools = schoolsData.districts[districtKey];
  if (!schools) return 50;
  
  return schools.education_score || 50;
}

/**
 * حساب تعديل الشريحة السعرية (0-100)
 * @param {string} districtKey - مفتاح الحي
 * @returns {number} درجة التعديل
 */
function calculatePricePercentileAdj(districtKey) {
  const percentiles = pricePercentilesData.districts[districtKey];
  if (!percentiles) return 50;
  
  // استخدام percentile_rank مباشرة
  return percentiles.percentile_rank || 50;
}

/**
 * حساب درجة الضوضاء (0-100، حيث 100 = هادئ جداً)
 * @param {string} districtKey - مفتاح الحي
 * @returns {number} درجة الضوضاء
 */
function calculateNoiseScore(districtKey) {
  const services = servicesData.districts[districtKey];
  if (!services) return 50;
  
  // تحويل noise_level (0-100، حيث 100 = صاخب جداً) إلى درجة هدوء
  const noiseLevel = services.noise_level || 50;
  return 100 - noiseLevel;
}

/**
 * الدالة الرئيسية: حساب جودة الحي التلقائي
 * @param {Object} params - المعاملات
 * @param {Array} params.coords - إحداثيات العقار [lng, lat]
 * @param {string} params.district - اسم الحي (اختياري)
 * @param {string} params.city - اسم المدينة
 * @returns {Object} نتيجة التقييم
 */
export function computeNeighborhoodQuality({ coords, district, city }) {
  // محاولة إيجاد الحي
  let districtKey = null;
  
  // 1. البحث بالاسم والمدينة
  if (district && city) {
    districtKey = findDistrictKey(district, city);
  }
  
  // 2. البحث بالإحداثيات
  if (!districtKey && coords) {
    districtKey = findNearestDistrict(coords);
  }
  
  // إذا لم نجد الحي، نرجع قيمة افتراضية
  if (!districtKey) {
    return {
      score: 70, // قيمة افتراضية متوسطة-مرتفعة
      level: 'متوسط',
      factors: {
        services: 70,
        accessibility: 70,
        greenery: 70,
        education: 70,
        pricePercentile: 70,
        noise: 70
      },
      districtFound: false,
      message: 'لم يتم العثور على بيانات الحي - استخدام قيمة افتراضية'
    };
  }
  
  // حساب جميع العوامل
  const factors = {
    services: calculateServicesScore(districtKey),
    accessibility: calculateAccessibilityScore(districtKey),
    greenery: calculateGreeneryScore(districtKey),
    education: calculateEducationScore(districtKey),
    pricePercentile: calculatePricePercentileAdj(districtKey),
    noise: calculateNoiseScore(districtKey)
  };
  
  // حساب NQS النهائي باستخدام الأوزان
  const nqs = 
    factors.services * WEIGHTS.services +
    factors.accessibility * WEIGHTS.accessibility +
    factors.greenery * WEIGHTS.greenery +
    factors.education * WEIGHTS.education +
    factors.pricePercentile * WEIGHTS.pricePercentile +
    factors.noise * WEIGHTS.noise;
  
  // قص النتيجة بين 0-100
  const finalScore = Math.max(0, Math.min(100, Math.round(nqs)));
  
  // تحديد المستوى
  let level = 'متوسط';
  if (finalScore >= 85) {
    level = 'مرتفع جداً';
  } else if (finalScore >= 75) {
    level = 'مرتفع';
  } else if (finalScore >= 60) {
    level = 'متوسط-مرتفع';
  } else if (finalScore >= 45) {
    level = 'متوسط';
  } else {
    level = 'منخفض';
  }
  
  return {
    score: finalScore,
    level,
    factors,
    districtFound: true,
    districtKey,
    message: `تم حساب جودة الحي تلقائياً بناءً على ${Object.keys(factors).length} عوامل`
  };
}

/**
 * حساب تأثير NQS على السعر
 * @param {number} nqsScore - درجة NQS (0-100)
 * @param {number} basePrice - السعر الأساسي
 * @returns {Object} التعديل والسعر النهائي
 */
export function applyNQSAdjustment(nqsScore, basePrice) {
  // تحويل NQS إلى نسبة تعديل (-6% إلى +6%)
  // NQS = 50 → 0% تعديل
  // NQS = 100 → +6% تعديل
  // NQS = 0 → -6% تعديل
  
  const adjustmentPercent = ((nqsScore - 50) / 50) * 6;
  const adjustmentAmount = basePrice * (adjustmentPercent / 100);
  const adjustedPrice = basePrice + adjustmentAmount;
  
  return {
    adjustmentPercent: adjustmentPercent.toFixed(2),
    adjustmentAmount: Math.round(adjustmentAmount),
    adjustedPrice: Math.round(adjustedPrice),
    explanation: `تعديل جودة الحي: ${adjustmentPercent > 0 ? '+' : ''}${adjustmentPercent.toFixed(1)}%`
  };
}

/**
 * الحصول على تفسير نصي لـ NQS
 * @param {Object} nqsResult - نتيجة computeNeighborhoodQuality
 * @returns {string} تفسير نصي
 */
export function getNQSExplanation(nqsResult) {
  if (!nqsResult.districtFound) {
    return 'تحليل جودة الحي (تلقائي): متوسط — بيانات محدودة متاحة للحي';
  }
  
  const { level, factors } = nqsResult;
  
  // تحديد أقوى العوامل
  const sortedFactors = Object.entries(factors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const factorNames = {
    services: 'كثافة الخدمات',
    accessibility: 'سهولة النفاذ',
    greenery: 'المساحات الخضراء',
    education: 'المؤسسات التعليمية',
    pricePercentile: 'موقع الحي السعري',
    noise: 'الهدوء'
  };
  
  const topFactors = sortedFactors
    .map(([key]) => factorNames[key] || key)
    .join('، ');
  
  return `تحليل جودة الحي (تلقائي): ${level} — استنادًا إلى ${topFactors}`;
}

export default {
  computeNeighborhoodQuality,
  applyNQSAdjustment,
  getNQSExplanation
};

