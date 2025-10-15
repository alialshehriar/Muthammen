/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API Endpoint: Admin Dashboard Statistics
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Add authentication middleware to verify admin access
    // For now, we'll use a simple API key check
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Connect to database
    const sql = neon(process.env.DATABASE_URL);

    // Get user statistics
    const userStats = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE subscription_type = 'free') as free_users,
        COUNT(*) FILTER (WHERE subscription_type = 'basic') as basic_users,
        COUNT(*) FILTER (WHERE subscription_type = 'pro') as pro_users,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_month,
        COUNT(*) FILTER (WHERE is_active = true) as active_users
      FROM users
    `;

    // Get referral statistics
    const referralStats = await sql`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_referrals,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
        SUM(reward_days) FILTER (WHERE reward_applied = true) as total_reward_days_given,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as referrals_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as referrals_this_month
      FROM referrals
    `;

    // Get subscription statistics
    const subscriptionStats = await sql`
      SELECT 
        COUNT(*) as total_subscriptions,
        SUM(price) as total_revenue,
        SUM(price) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_this_month,
        SUM(price) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as revenue_this_week,
        AVG(price) as average_subscription_price,
        COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions
      FROM subscriptions
    `;

    // Get evaluation statistics
    const evaluationStats = await sql`
      SELECT 
        COUNT(*) as total_evaluations,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as evaluations_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as evaluations_this_month,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as evaluations_today,
        AVG(estimated_value) as average_property_value,
        COUNT(DISTINCT city) as cities_covered,
        COUNT(DISTINCT user_id) as unique_users_evaluated
      FROM evaluations
    `;

    // Get top referrers
    const topReferrers = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.referral_code,
        u.total_referrals,
        u.pro_days_remaining,
        COUNT(r.id) as successful_referrals
      FROM users u
      LEFT JOIN referrals r ON u.id = r.referrer_id AND r.status = 'completed'
      GROUP BY u.id, u.name, u.email, u.referral_code, u.total_referrals, u.pro_days_remaining
      ORDER BY u.total_referrals DESC
      LIMIT 10
    `;

    // Get city statistics
    const cityStats = await sql`
      SELECT 
        city,
        COUNT(*) as total_evaluations,
        AVG(estimated_value) as average_value,
        MIN(estimated_value) as min_value,
        MAX(estimated_value) as max_value
      FROM evaluations
      GROUP BY city
      ORDER BY total_evaluations DESC
      LIMIT 10
    `;

    // Get recent activity
    const recentActivity = await sql`
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 20
    `;

    // Get growth data (last 30 days)
    const growthData = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Return all statistics
    return res.status(200).json({
      success: true,
      data: {
        users: userStats[0],
        referrals: referralStats[0],
        subscriptions: subscriptionStats[0],
        evaluations: evaluationStats[0],
        topReferrers,
        cityStats,
        recentActivity,
        growthData
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب الإحصائيات' 
    });
  }
}

