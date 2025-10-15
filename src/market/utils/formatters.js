/**
 * دوال مساعدة لتنسيق الأرقام والتواريخ بالعربية
 */

/**
 * تحويل الأرقام الإنجليزية إلى عربية
 */
export function toArabicNumerals(num) {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/\d/g, d => arabicNumerals[d]);
}

/**
 * تنسيق الأرقام مع فواصل الآلاف
 */
export function formatNumber(num, useArabic = true) {
  if (num === null || num === undefined) return '-';
  
  const formatted = new Intl.NumberFormat('ar-SA').format(num);
  return useArabic ? toArabicNumerals(formatted) : formatted;
}

/**
 * تنسيق المبالغ المالية
 */
export function formatCurrency(amount, currency = 'ريال', useArabic = true) {
  const formatted = formatNumber(amount, useArabic);
  return `${formatted} ${currency}`;
}

/**
 * تنسيق النسب المئوية
 */
export function formatPercentage(value, decimals = 1, useArabic = true) {
  if (value === null || value === undefined) return '-';
  
  const percentage = (value * 100).toFixed(decimals);
  const formatted = useArabic ? toArabicNumerals(percentage) : percentage;
  return `${formatted}٪`;
}

/**
 * تنسيق السعر لكل متر مربع
 */
export function formatPricePerM2(price, useArabic = true) {
  return `${formatNumber(price, useArabic)} ر.س/م²`;
}

/**
 * تنسيق سعر الإيجار الشهري لكل متر مربع
 */
export function formatRentPerM2(price, useArabic = true) {
  return `${formatNumber(price, useArabic)} ر.س/م²/شهر`;
}

/**
 * تنسيق التاريخ بالعربية
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * تنسيق الشهر والسنة فقط
 */
export function formatMonthYear(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long'
  }).format(date);
}

/**
 * تنسيق عدد الأيام
 */
export function formatDays(days, useArabic = true) {
  const formatted = useArabic ? toArabicNumerals(days) : days;
  return `${formatted} يوم`;
}

/**
 * تنسيق مستوى الثقة
 */
export function formatConfidence(confidence, useArabic = true) {
  return formatPercentage(confidence, 0, useArabic);
}

/**
 * تنسيق النطاق السعري
 */
export function formatPriceRange(min, max, useArabic = true) {
  return `${formatNumber(min, useArabic)} - ${formatNumber(max, useArabic)} ر.س/م²`;
}

/**
 * تنسيق عدد المعاملات
 */
export function formatTransactions(count, useArabic = true) {
  if (count >= 1000000) {
    return `${formatNumber((count / 1000000).toFixed(1), useArabic)} مليون`;
  } else if (count >= 1000) {
    return `${formatNumber((count / 1000).toFixed(1), useArabic)} ألف`;
  }
  return formatNumber(count, useArabic);
}

/**
 * تنسيق حجم المعاملات بالمليارات
 */
export function formatVolumeBillion(volume, useArabic = true) {
  return `${formatNumber(volume, useArabic)} مليار ر.س`;
}

/**
 * الحصول على لون بناءً على القيمة
 */
export function getColorByValue(value, type = 'change') {
  if (type === 'change') {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  }
  
  if (type === 'confidence') {
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-amber-600';
    return 'text-red-600';
  }
  
  return 'text-foreground';
}

/**
 * الحصول على أيقونة الاتجاه
 */
export function getTrendIcon(value) {
  if (value > 0) return '↗';
  if (value < 0) return '↘';
  return '→';
}

/**
 * تنسيق التغيير السنوي
 */
export function formatYoYChange(value, useArabic = true) {
  const icon = getTrendIcon(value);
  const color = getColorByValue(value, 'change');
  const formatted = formatPercentage(Math.abs(value), 1, useArabic);
  
  return {
    text: `${icon} ${formatted}`,
    color,
    icon
  };
}

