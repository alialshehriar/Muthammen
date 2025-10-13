/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Neon Database Connection - db.js
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * هذا الملف يحتوي على:
 * 1. الاتصال بقاعدة بيانات Neon PostgreSQL
 * 2. دوال مساعدة للتفاعل مع قاعدة البيانات
 * 3. معالجة الأخطاء والأمان
 */

import { neon } from '@neondatabase/serverless';

// ═══════════════════════════════════════════════════════════════════════════
// Database Connection
// ═══════════════════════════════════════════════════════════════════════════

/**
 * الحصول على اتصال بقاعدة البيانات
 * @returns {Function} - دالة SQL للتنفيذ
 */
export function getDB() {
  const connectionString = import.meta.env.VITE_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }
  
  return neon(connectionString);
}

// ═══════════════════════════════════════════════════════════════════════════
// User Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * إنشاء مستخدم جديد
 * @param {Object} userData - بيانات المستخدم
 * @returns {Promise<Object>} - المستخدم المُنشأ
 */
export async function createUser(userData) {
  const sql = getDB();
  
  const { name, email, phone, referralCode, referredByCode } = userData;
  
  try {
    const result = await sql`
      INSERT INTO users (name, email, phone, referral_code, referred_by_code)
      VALUES (${name}, ${email}, ${phone}, ${referralCode}, ${referredByCode || null})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * الحصول على مستخدم بواسطة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {Promise<Object|null>} - المستخدم أو null
 */
export async function getUserByEmail(email) {
  const sql = getDB();
  
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

/**
 * الحصول على مستخدم بواسطة رقم الجوال
 * @param {string} phone - رقم الجوال
 * @returns {Promise<Object|null>} - المستخدم أو null
 */
export async function getUserByPhone(phone) {
  const sql = getDB();
  
  try {
    const result = await sql`
      SELECT * FROM users WHERE phone = ${phone} LIMIT 1
    `;
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
}

/**
 * الحصول على مستخدم بواسطة كود الإحالة
 * @param {string} referralCode - كود الإحالة
 * @returns {Promise<Object|null>} - المستخدم أو null
 */
export async function getUserByReferralCode(referralCode) {
  const sql = getDB();
  
  try {
    const result = await sql`
      SELECT * FROM users WHERE referral_code = ${referralCode} LIMIT 1
    `;
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user by referral code:', error);
    throw error;
  }
}

/**
 * تحديث بيانات مستخدم
 * @param {string} userId - معرف المستخدم
 * @param {Object} updates - التحديثات
 * @returns {Promise<Object>} - المستخدم المُحدث
 */
export async function updateUser(userId, updates) {
  const sql = getDB();
  
  try {
    const result = await sql`
      UPDATE users
      SET ${sql(updates)}
      WHERE id = ${userId}
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * الحصول على جميع المستخدمين (للوحة الإدارة)
 * @param {Object} options - خيارات الفلترة والترتيب
 * @returns {Promise<Array>} - قائمة المستخدمين
 */
export async function getAllUsers(options = {}) {
  const sql = getDB();
  
  const { 
    limit = 100, 
    offset = 0, 
    sortBy = 'created_at', 
    sortOrder = 'DESC',
    subscriptionType = null 
  } = options;
  
  try {
    let query = sql`
      SELECT * FROM users
    `;
    
    if (subscriptionType) {
      query = sql`
        SELECT * FROM users WHERE subscription_type = ${subscriptionType}
      `;
    }
    
    query = sql`
      ${query}
      ORDER BY ${sql(sortBy)} ${sql.unsafe(sortOrder)}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return await query;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Referral Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * إنشاء إحالة جديدة
 * @param {Object} referralData - بيانات الإحالة
 * @returns {Promise<Object>} - الإحالة المُنشأة
 */
export async function createReferral(referralData) {
  const sql = getDB();
  
  const { referrerId, referredId, referralCode, rewardDays = 2 } = referralData;
  
  try {
    const result = await sql`
      INSERT INTO referrals (referrer_id, referred_id, referral_code, reward_days)
      VALUES (${referrerId}, ${referredId}, ${referralCode}, ${rewardDays})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
}

/**
 * الحصول على إحالات مستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Array>} - قائمة الإحالات
 */
export async function getUserReferrals(userId) {
  const sql = getDB();
  
  try {
    const result = await sql`
      SELECT 
        r.*,
        u.name as referred_user_name,
        u.email as referred_user_email,
        u.created_at as referred_user_joined_at
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = ${userId}
      ORDER BY r.created_at DESC
    `;
    
    return result;
  } catch (error) {
    console.error('Error getting user referrals:', error);
    throw error;
  }
}

/**
 * الحصول على جميع الإحالات (للوحة الإدارة)
 * @param {Object} options - خيارات الفلترة
 * @returns {Promise<Array>} - قائمة الإحالات
 */
export async function getAllReferrals(options = {}) {
  const sql = getDB();
  
  const { limit = 100, offset = 0, status = null } = options;
  
  try {
    let query;
    
    if (status) {
      query = sql`
        SELECT 
          r.*,
          u1.name as referrer_name,
          u1.email as referrer_email,
          u2.name as referred_name,
          u2.email as referred_email
        FROM referrals r
        JOIN users u1 ON r.referrer_id = u1.id
        JOIN users u2 ON r.referred_id = u2.id
        WHERE r.status = ${status}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT 
          r.*,
          u1.name as referrer_name,
          u1.email as referrer_email,
          u2.name as referred_name,
          u2.email as referred_email
        FROM referrals r
        JOIN users u1 ON r.referrer_id = u1.id
        JOIN users u2 ON r.referred_id = u2.id
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    return await query;
  } catch (error) {
    console.error('Error getting all referrals:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscription Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * إنشاء اشتراك جديد
 * @param {Object} subscriptionData - بيانات الاشتراك
 * @returns {Promise<Object>} - الاشتراك المُنشأ
 */
export async function createSubscription(subscriptionData) {
  const sql = getDB();
  
  const { 
    userId, 
    planType, 
    price, 
    durationDays, 
    paymentMethod, 
    transactionId 
  } = subscriptionData;
  
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  
  try {
    const result = await sql`
      INSERT INTO subscriptions (
        user_id, plan_type, price, duration_days, 
        start_date, end_date, payment_method, transaction_id
      )
      VALUES (
        ${userId}, ${planType}, ${price}, ${durationDays},
        ${startDate}, ${endDate}, ${paymentMethod}, ${transactionId}
      )
      RETURNING *
    `;
    
    // Update user subscription type
    await sql`
      UPDATE users
      SET subscription_type = ${planType}, subscription_expires_at = ${endDate}
      WHERE id = ${userId}
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * الحصول على اشتراكات مستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Array>} - قائمة الاشتراكات
 */
export async function getUserSubscriptions(userId) {
  const sql = getDB();
  
  try {
    const result = await sql`
      SELECT * FROM subscriptions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    
    return result;
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Evaluation Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * حفظ تقييم عقار
 * @param {Object} evaluationData - بيانات التقييم
 * @returns {Promise<Object>} - التقييم المحفوظ
 */
export async function saveEvaluation(evaluationData) {
  const sql = getDB();
  
  const {
    userId,
    propertyType,
    city,
    neighborhood,
    area,
    rooms,
    bathrooms,
    age,
    estimatedValue,
    confidence,
    priceRangeMin,
    priceRangeMax,
    engineUsed,
    ipAddress,
    userAgent
  } = evaluationData;
  
  try {
    const result = await sql`
      INSERT INTO evaluations (
        user_id, property_type, city, neighborhood, area,
        rooms, bathrooms, age, estimated_value, confidence,
        price_range_min, price_range_max, engine_used,
        ip_address, user_agent
      )
      VALUES (
        ${userId || null}, ${propertyType}, ${city}, ${neighborhood || null}, ${area},
        ${rooms || null}, ${bathrooms || null}, ${age || null}, 
        ${estimatedValue}, ${confidence || null},
        ${priceRangeMin || null}, ${priceRangeMax || null}, ${engineUsed || 'nqs'},
        ${ipAddress || null}, ${userAgent || null}
      )
      RETURNING *
    `;
    
    // Update user's total evaluations count
    if (userId) {
      await sql`
        UPDATE users
        SET total_evaluations = total_evaluations + 1
        WHERE id = ${userId}
      `;
    }
    
    return result[0];
  } catch (error) {
    console.error('Error saving evaluation:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Statistics Functions (for Admin Dashboard)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * الحصول على إحصائيات المستخدمين
 * @returns {Promise<Object>} - إحصائيات المستخدمين
 */
export async function getUserStats() {
  const sql = getDB();
  
  try {
    const result = await sql`SELECT * FROM user_stats`;
    return result[0];
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}

/**
 * الحصول على إحصائيات الإحالات
 * @returns {Promise<Object>} - إحصائيات الإحالات
 */
export async function getReferralStats() {
  const sql = getDB();
  
  try {
    const result = await sql`SELECT * FROM referral_stats`;
    return result[0];
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
}

/**
 * الحصول على أفضل المُحيلين
 * @param {number} limit - عدد النتائج
 * @returns {Promise<Array>} - قائمة أفضل المُحيلين
 */
export async function getTopReferrers(limit = 10) {
  const sql = getDB();
  
  try {
    const result = await sql`
      SELECT * FROM top_referrers LIMIT ${limit}
    `;
    return result;
  } catch (error) {
    console.error('Error getting top referrers:', error);
    throw error;
  }
}

/**
 * الحصول على إحصائيات الإيرادات
 * @returns {Promise<Object>} - إحصائيات الإيرادات
 */
export async function getRevenueStats() {
  const sql = getDB();
  
  try {
    const result = await sql`SELECT * FROM revenue_stats`;
    return result[0];
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    throw error;
  }
}

/**
 * الحصول على إحصائيات التقييمات
 * @returns {Promise<Object>} - إحصائيات التقييمات
 */
export async function getEvaluationStats() {
  const sql = getDB();
  
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_evaluations,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as evaluations_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as evaluations_this_month,
        AVG(estimated_value) as average_property_value,
        COUNT(DISTINCT city) as cities_covered
      FROM evaluations
    `;
    return result[0];
  } catch (error) {
    console.error('Error getting evaluation stats:', error);
    throw error;
  }
}

/**
 * الحصول على إحصائيات حسب المدينة
 * @returns {Promise<Array>} - إحصائيات المدن
 */
export async function getCityStats() {
  const sql = getDB();
  
  try {
    const result = await sql`
      SELECT 
        city,
        COUNT(*) as total_evaluations,
        AVG(estimated_value) as average_value,
        MIN(estimated_value) as min_value,
        MAX(estimated_value) as max_value
      FROM evaluations
      GROUP BY city
      ORDER BY total_evaluations DESC
      LIMIT 20
    `;
    return result;
  } catch (error) {
    console.error('Error getting city stats:', error);
    throw error;
  }
}

