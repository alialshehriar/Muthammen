/**
 * مكتبة توليد وإدارة رموز الإحالة
 * 
 * التنسيق: 6-8 حروف من ABCDEFGHJKMNPQRSTUVWXYZ23456789
 * (بدون أحرف مشابهة: I, L, O, 0, 1)
 */

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const DEFAULT_LENGTH = 7;

/**
 * توليد رمز إحالة عشوائي
 * @param {number} length - طول الرمز (افتراضي: 7)
 * @returns {string} رمز الإحالة
 */
export function generateReferralCode(length = DEFAULT_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    code += ALPHABET[randomIndex];
  }
  return code;
}

/**
 * التحقق من صحة رمز الإحالة
 * @param {string} code - الرمز المراد التحقق منه
 * @returns {boolean} true إذا كان الرمز صالحاً
 */
export function isValidReferralCode(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // التحقق من الطول
  if (code.length < 6 || code.length > 8) {
    return false;
  }
  
  // التحقق من الأحرف المسموحة فقط
  const validPattern = new RegExp(`^[${ALPHABET}]+$`);
  return validPattern.test(code);
}

/**
 * إنشاء رابط إحالة كامل
 * @param {string} code - رمز الإحالة
 * @param {string} baseUrl - الرابط الأساسي (اختياري)
 * @returns {string} رابط الإحالة الكامل
 */
export function createReferralLink(code, baseUrl = null) {
  const base = baseUrl || window.location.origin;
  return `${base}/?ref=${code}`;
}

/**
 * إنشاء رمز QR للإحالة (stub - يحتاج مكتبة QR)
 * @param {string} code - رمز الإحالة
 * @returns {Promise<string>} data URL للصورة
 */
export async function generateQRCode(code) {
  const link = createReferralLink(code);
  
  // Stub - في المستقبل سنستخدم مكتبة مثل qrcode
  // import QRCode from 'qrcode';
  // return await QRCode.toDataURL(link);
  
  // مؤقتاً: نرجع رابط خدمة خارجية
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
}

/**
 * حفظ رمز الإحالة للمستخدم الحالي
 * @param {string} userId - معرّف المستخدم
 * @param {string} code - رمز الإحالة
 */
export function saveUserReferralCode(userId, code) {
  if (!isValidReferralCode(code)) {
    throw new Error('رمز إحالة غير صالح');
  }
  
  const userCodes = JSON.parse(localStorage.getItem('muth_user_codes') || '{}');
  userCodes[userId] = {
    code,
    createdAt: Date.now()
  };
  localStorage.setItem('muth_user_codes', JSON.stringify(userCodes));
}

/**
 * استرجاع رمز الإحالة للمستخدم
 * @param {string} userId - معرّف المستخدم
 * @returns {string|null} رمز الإحالة أو null
 */
export function getUserReferralCode(userId) {
  const userCodes = JSON.parse(localStorage.getItem('muth_user_codes') || '{}');
  return userCodes[userId]?.code || null;
}

/**
 * إنشاء رمز إحالة للمستخدم إن لم يكن موجوداً
 * @param {string} userId - معرّف المستخدم
 * @returns {string} رمز الإحالة
 */
export function ensureUserReferralCode(userId) {
  let code = getUserReferralCode(userId);
  
  if (!code) {
    // توليد رمز جديد
    code = generateReferralCode();
    
    // التأكد من عدم تكراره (محلياً)
    const allCodes = Object.values(
      JSON.parse(localStorage.getItem('muth_user_codes') || '{}')
    ).map(c => c.code);
    
    let attempts = 0;
    while (allCodes.includes(code) && attempts < 10) {
      code = generateReferralCode();
      attempts++;
    }
    
    saveUserReferralCode(userId, code);
  }
  
  return code;
}

/**
 * تسجيل استخدام رمز إحالة
 * @param {string} code - رمز الإحالة
 * @param {string} newUserId - معرّف المستخدم الجديد
 */
export function recordReferralUsage(code, newUserId) {
  const usages = JSON.parse(localStorage.getItem('muth_ref_usages') || '[]');
  
  usages.push({
    code,
    newUserId,
    timestamp: Date.now()
  });
  
  localStorage.setItem('muth_ref_usages', JSON.stringify(usages));
}

/**
 * الحصول على إحصائيات رمز إحالة معين
 * @param {string} code - رمز الإحالة
 * @returns {object} إحصائيات الاستخدام
 */
export function getReferralCodeStats(code) {
  const usages = JSON.parse(localStorage.getItem('muth_ref_usages') || '[]');
  const codeUsages = usages.filter(u => u.code === code);
  
  const events = JSON.parse(localStorage.getItem('muth_ref_events') || '[]');
  const codeEvents = events.filter(e => e.ref === code);
  
  return {
    clicks: codeEvents.filter(e => e.type === 'click').length,
    signups: codeUsages.length,
    qualified: codeUsages.filter(u => u.verified).length,
    lastUsed: codeUsages.length > 0 
      ? Math.max(...codeUsages.map(u => u.timestamp))
      : null
  };
}

/**
 * حساب المكافآت بناءً على عدد الإحالات
 * @param {number} qualifiedCount - عدد الإحالات المؤهلة
 * @returns {array} قائمة المكافآت المستحقة
 */
export function calculateRewards(qualifiedCount) {
  const rewards = [];
  
  if (qualifiedCount >= 1) {
    rewards.push({
      id: 'early_access',
      name: 'Early Access',
      nameAr: 'وصول مبكر',
      description: 'شارة Early Access + ظهور في لوحة الداعمين الأوائل',
      icon: '🌟',
      unlocked: true
    });
  }
  
  if (qualifiedCount >= 3) {
    rewards.push({
      id: 'neighborhood_analysis',
      name: 'Neighborhood Analysis',
      nameAr: 'تحليل الحي المختصر',
      description: 'تفعيل تحليل الحي المختصر مبكراً',
      icon: '🏘️',
      unlocked: true
    });
  }
  
  if (qualifiedCount >= 10) {
    rewards.push({
      id: 'founder_tester',
      name: 'Founder Tester',
      nameAr: 'مختبر مؤسس',
      description: 'وصول مبكّر للخريطة التفاعلية + شارة Founder Tester',
      icon: '👑',
      unlocked: true
    });
  }
  
  // المكافآت المقفلة
  if (qualifiedCount < 3) {
    rewards.push({
      id: 'neighborhood_analysis',
      name: 'Neighborhood Analysis',
      nameAr: 'تحليل الحي المختصر',
      description: `يحتاج ${3 - qualifiedCount} إحالات إضافية`,
      icon: '🔒',
      unlocked: false,
      required: 3
    });
  }
  
  if (qualifiedCount < 10) {
    rewards.push({
      id: 'founder_tester',
      name: 'Founder Tester',
      nameAr: 'مختبر مؤسس',
      description: `يحتاج ${10 - qualifiedCount} إحالات إضافية`,
      icon: '🔒',
      unlocked: false,
      required: 10
    });
  }
  
  return rewards;
}

