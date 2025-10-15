/**
 * ═══════════════════════════════════════════════════════════════════════════
 * لوحة الإدارة الاحترافية - Admin Dashboard
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import DatabaseManager from './DatabaseManager';
import { 
  Users, TrendingUp, DollarSign, FileText, Activity,
  UserPlus, Award, BarChart3, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, ArrowUp, ArrowDown,
  RefreshCw, Download, Filter, Search, Eye
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch statistics
  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'x-api-key': localStorage.getItem('adminApiKey') || ''
        }
      });

      if (!response.ok) {
        throw new Error('فشل تحميل الإحصائيات');
      }

      const data = await response.json();
      setStats(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-center mb-2">خطأ في التحميل</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <Button onClick={fetchStats} className="w-full">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لوحة إدارة مُثمّن</h1>
              <p className="text-sm text-gray-600">مرحباً بك في لوحة التحكم الشاملة</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="7d">آخر 7 أيام</option>
                <option value="30d">آخر 30 يوم</option>
                <option value="90d">آخر 90 يوم</option>
                <option value="all">كل الوقت</option>
              </select>
              <Button onClick={fetchStats} variant="outline">
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'users', label: 'المستخدمين', icon: Users },
              { id: 'referrals', label: 'الإحالات', icon: Award },
              { id: 'subscriptions', label: 'الاشتراكات', icon: DollarSign },
              { id: 'evaluations', label: 'التقييمات', icon: FileText },
              { id: 'activity', label: 'النشاطات', icon: Activity },
              { id: 'database', label: 'قاعدة البيانات', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {selectedTab === 'overview' && <OverviewTab stats={stats} />}
        {selectedTab === 'users' && <UsersTab stats={stats} />}
        {selectedTab === 'referrals' && <ReferralsTab stats={stats} />}
        {selectedTab === 'subscriptions' && <SubscriptionsTab stats={stats} />}
        {selectedTab === 'evaluations' && <EvaluationsTab stats={stats} />}
        {selectedTab === 'activity' && <ActivityTab stats={stats} />}
        {selectedTab === 'database' && <DatabaseManager />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Overview Tab
// ═══════════════════════════════════════════════════════════════════════════

function OverviewTab({ stats }) {
  const kpis = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.users.total_users,
      change: `+${stats.users.new_users_month} هذا الشهر`,
      icon: Users,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'الإحالات الناجحة',
      value: stats.referrals.completed_referrals,
      change: `+${stats.referrals.referrals_this_month} هذا الشهر`,
      icon: Award,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'الإيرادات الشهرية',
      value: `${(stats.subscriptions.revenue_this_month || 0).toLocaleString()} ر.س`,
      change: `من ${stats.subscriptions.active_subscriptions} اشتراك نشط`,
      icon: DollarSign,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'التقييمات',
      value: stats.evaluations.total_evaluations,
      change: `+${stats.evaluations.evaluations_this_month} هذا الشهر`,
      icon: FileText,
      color: 'orange',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${kpi.color}-100`}>
                <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
              </div>
              {kpi.trend === 'up' ? (
                <ArrowUp className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <h3 className="text-sm text-gray-600 mb-1">{kpi.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{kpi.value}</p>
            <p className="text-sm text-gray-500">{kpi.change}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">نمو المستخدمين (آخر 30 يوم)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.growthData.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(day.new_users / Math.max(...stats.growthData.map(d => d.new_users))) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                {idx % 5 === 0 && (
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).getDate()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Top Cities */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">أكثر المدن نشاطاً</h3>
          <div className="space-y-3">
            {stats.cityStats.slice(0, 5).map((city, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{city.city}</p>
                    <p className="text-sm text-gray-500">{city.total_evaluations} تقييم</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {(city.average_value / 1000).toFixed(0)}K ر.س
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">أفضل المُحيلين</h3>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 ml-2" />
            عرض الكل
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4 font-semibold text-gray-700">المرتبة</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">الاسم</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">البريد الإلكتروني</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">كود الإحالة</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">عدد الإحالات</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">أيام البرو</th>
              </tr>
            </thead>
            <tbody>
              {stats.topReferrers.map((user, idx) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-mono">
                      {user.referral_code}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-green-600">{user.total_referrals}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-purple-600">{user.pro_days_remaining}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Users Tab
// ═══════════════════════════════════════════════════════════════════════════

function UsersTab({ stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="المستخدمين النشطين"
          value={stats.users.active_users}
          icon={Users}
          color="green"
        />
        <StatCard
          title="مستخدمين جدد هذا الأسبوع"
          value={stats.users.new_users_week}
          icon={UserPlus}
          color="blue"
        />
        <StatCard
          title="مستخدمين جدد هذا الشهر"
          value={stats.users.new_users_month}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">توزيع الاشتراكات</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">{stats.users.free_users}</p>
            <p className="text-sm text-gray-600 mt-1">مجاني</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.users.basic_users}</p>
            <p className="text-sm text-gray-600 mt-1">عادي</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{stats.users.pro_users}</p>
            <p className="text-sm text-gray-600 mt-1">برو</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Other Tabs (Simplified)
// ═══════════════════════════════════════════════════════════════════════════

function ReferralsTab({ stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="إجمالي الإحالات"
          value={stats.referrals.total_referrals}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="إحالات ناجحة"
          value={stats.referrals.completed_referrals}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="أيام برو ممنوحة"
          value={stats.referrals.total_reward_days_given || 0}
          icon={Clock}
          color="purple"
        />
      </div>
    </div>
  );
}

function SubscriptionsTab({ stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="إجمالي الاشتراكات"
          value={stats.subscriptions.total_subscriptions}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="الإيرادات الكلية"
          value={`${(stats.subscriptions.total_revenue || 0).toLocaleString()} ر.س`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="اشتراكات نشطة"
          value={stats.subscriptions.active_subscriptions}
          icon={CheckCircle}
          color="purple"
        />
      </div>
    </div>
  );
}

function EvaluationsTab({ stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي التقييمات"
          value={stats.evaluations.total_evaluations}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="تقييمات اليوم"
          value={stats.evaluations.evaluations_today}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="متوسط قيمة العقار"
          value={`${(stats.evaluations.average_property_value / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="المدن المغطاة"
          value={stats.evaluations.cities_covered}
          icon={BarChart3}
          color="orange"
        />
      </div>
    </div>
  );
}

function ActivityTab({ stats }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">آخر النشاطات</h3>
      <div className="space-y-3">
        {stats.recentActivity.map((activity, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{activity.description}</p>
              <p className="text-sm text-gray-600">{activity.user_name || 'مستخدم غير معروف'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.created_at).toLocaleString('ar-SA')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="p-6">
      <div className={`p-3 rounded-xl bg-${color}-100 w-fit mb-3`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </Card>
  );
}

