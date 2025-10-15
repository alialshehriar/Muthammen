/**
 * دوال اختيار البيانات من الملفات المحلية
 * مُصممة لسهولة التحويل إلى API calls لاحقاً
 */

import saMarketData from '../data/sa_market_2025Q4.json';
import citiesData from '../data/cities_2025Q4.json';
import rentSaleData from '../data/rent_sale_2025Q4.json';

/**
 * الحصول على بيانات السوق الوطني
 */
export function getNationalMarketData() {
  return saMarketData;
}

/**
 * الحصول على بيانات جميع المدن
 */
export function getCitiesData() {
  return citiesData;
}

/**
 * الحصول على بيانات مدينة محددة
 */
export function getCityData(cityId) {
  return citiesData.find(city => city.id === cityId) || null;
}

/**
 * الحصول على بيانات الإيجار والبيع الشهرية
 */
export function getRentSaleTimeSeries() {
  return rentSaleData;
}

/**
 * الحصول على أحدث بيانات شهرية
 */
export function getLatestMonthData() {
  return rentSaleData[rentSaleData.length - 1];
}

/**
 * الحصول على بيانات آخر N شهر
 */
export function getLastNMonths(n = 6) {
  return rentSaleData.slice(-n);
}

/**
 * حساب متوسط السعر لفترة معينة
 */
export function calculateAveragePrice(months, type = 'sale') {
  const key = type === 'sale' ? 'sale_price_per_m2' : 'rent_price_per_m2_month';
  const sum = months.reduce((acc, month) => acc + month[key], 0);
  return sum / months.length;
}

/**
 * حساب معدل النمو بين فترتين
 */
export function calculateGrowthRate(oldValue, newValue) {
  if (!oldValue || oldValue === 0) return 0;
  return (newValue - oldValue) / oldValue;
}

/**
 * الحصول على أعلى وأقل الأسعار في فترة
 */
export function getPriceRange(months, type = 'sale') {
  const key = type === 'sale' ? 'sale_price_per_m2' : 'rent_price_per_m2_month';
  const prices = months.map(m => m[key]);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: prices.reduce((a, b) => a + b, 0) / prices.length
  };
}

/**
 * ترتيب المدن حسب معيار معين
 */
export function sortCities(criteria = 'sale_price_per_m2', order = 'desc') {
  const sorted = [...citiesData].sort((a, b) => {
    if (order === 'desc') {
      return b[criteria] - a[criteria];
    }
    return a[criteria] - b[criteria];
  });
  return sorted;
}

/**
 * الحصول على أغلى وأرخص المدن
 */
export function getTopAndBottomCities(n = 3) {
  const sorted = sortCities('sale_price_per_m2', 'desc');
  return {
    top: sorted.slice(0, n),
    bottom: sorted.slice(-n).reverse()
  };
}

/**
 * حساب الإحصائيات الوطنية
 */
export function calculateNationalStats() {
  const latest = getLatestMonthData();
  const lastYear = rentSaleData[0]; // أول شهر في البيانات (قبل 12 شهر)
  
  return {
    current: latest,
    yoyGrowth: {
      sale: calculateGrowthRate(lastYear.sale_price_per_m2, latest.sale_price_per_m2),
      rent: calculateGrowthRate(lastYear.rent_price_per_m2_month, latest.rent_price_per_m2_month)
    },
    range: {
      sale: getPriceRange(rentSaleData, 'sale'),
      rent: getPriceRange(rentSaleData, 'rent')
    }
  };
}

/**
 * تحليل الاتجاه (صاعد/هابط/مستقر)
 */
export function analyzeTrend(months, type = 'sale', threshold = 0.02) {
  const key = type === 'sale' ? 'sale_price_per_m2' : 'rent_price_per_m2_month';
  const first = months[0][key];
  const last = months[months.length - 1][key];
  const growth = calculateGrowthRate(first, last);
  
  if (growth > threshold) return 'صاعد';
  if (growth < -threshold) return 'هابط';
  return 'مستقر';
}

/**
 * الحصول على رؤى السوق
 */
export function getMarketInsights() {
  const national = getNationalMarketData();
  const stats = calculateNationalStats();
  const last6Months = getLastNMonths(6);
  
  return {
    ...national.insights,
    saleTrend: analyzeTrend(last6Months, 'sale'),
    rentTrend: analyzeTrend(last6Months, 'rent'),
    priceRange: stats.range,
    topCities: getTopAndBottomCities(3).top
  };
}

// للاستخدام المستقبلي: تحويل إلى API calls
/*
export async function getNationalMarketData() {
  const response = await fetch('/api/market/national');
  return await response.json();
}

export async function getCitiesData() {
  const response = await fetch('/api/market/cities');
  return await response.json();
}

// ... إلخ
*/

