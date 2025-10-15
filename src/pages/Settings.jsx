import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import {
  User, Mail, Phone, MapPin, Bell, Lock, Eye, EyeOff,
  Trash2, Download, Upload, Moon, Sun, Globe, Palette,
  Shield, Key, Database, Activity, LogOut, Save, X
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });

  const [profile, setProfile] = useState({
    name: 'علي الشهري',
    email: 'ali@example.com',
    phone: '+966 50 123 4567',
    city: 'الرياض',
    language: 'ar'
  });

  const tabs = [
    { id: 'profile', name: 'الملف الشخصي', icon: User },
    { id: 'notifications', name: 'الإشعارات', icon: Bell },
    { id: 'security', name: 'الأمان', icon: Shield },
    { id: 'privacy', name: 'الخصوصية', icon: Lock },
    { id: 'appearance', name: 'المظهر', icon: Palette },
    { id: 'data', name: 'البيانات', icon: Database }
  ];

  const handleSave = () => {
    // حفظ الإعدادات
    alert('تم حفظ الإعدادات بنجاح ✅');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            الإعدادات
          </h1>
          <p className="text-gray-600">
            تخصيص تجربتك في مُثمّن
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 p-4 h-fit sticky top-6">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  الملف الشخصي
                </h2>

                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <Button variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" />
                        تغيير الصورة
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG أو GIF (حجم أقصى 2MB)
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">رقم الجوال</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">المدينة</label>
                      <select
                        value={profile.city}
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="الرياض">الرياض</option>
                        <option value="جدة">جدة</option>
                        <option value="الدمام">الدمام</option>
                        <option value="مكة">مكة المكرمة</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="w-4 h-4" />
                      حفظ التغييرات
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <X className="w-4 h-4" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-blue-600" />
                  الإشعارات
                </h2>

                <div className="space-y-6">
                  {[
                    { key: 'email', label: 'إشعارات البريد الإلكتروني', desc: 'تلقي التحديثات عبر البريد' },
                    { key: 'sms', label: 'إشعارات الرسائل النصية', desc: 'تلقي التنبيهات عبر SMS' },
                    { key: 'push', label: 'الإشعارات الفورية', desc: 'تنبيهات فورية على الجهاز' },
                    { key: 'marketing', label: 'العروض التسويقية', desc: 'تلقي العروض والخصومات' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={(checked) => 
                          setNotifications({...notifications, [item.key]: checked})
                        }
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleSave} className="mt-6 gap-2">
                  <Save className="w-4 h-4" />
                  حفظ الإعدادات
                </Button>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card className="p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  الأمان
                </h2>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="font-semibold mb-4">تغيير كلمة المرور</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">كلمة المرور الحالية</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900">المصادقة الثنائية</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          حماية إضافية لحسابك عبر رمز التحقق
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          تفعيل الآن
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </Card>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <Card className="p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-blue-600" />
                  الخصوصية
                </h2>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">من يمكنه رؤية ملفك الشخصي؟</h3>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>الجميع</option>
                      <option>المستخدمون المسجلون فقط</option>
                      <option>أنا فقط</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">إظهار نشاطي</h3>
                    <Switch defaultChecked />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">السماح بفهرسة محركات البحث</h3>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">حذف الحساب</h3>
                    <p className="text-sm text-red-700 mb-3">
                      سيتم حذف جميع بياناتك بشكل دائم ولا يمكن استرجاعها
                    </p>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      حذف الحساب
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <Card className="p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Palette className="w-6 h-6 text-blue-600" />
                  المظهر
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">الوضع</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`p-4 border-2 rounded-lg flex items-center gap-3 ${
                          !darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <Sun className="w-5 h-5" />
                        <span>فاتح</span>
                      </button>
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`p-4 border-2 rounded-lg flex items-center gap-3 ${
                          darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                        <span>داكن</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">اللغة</h3>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ الإعدادات
                  </Button>
                </div>
              </Card>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <Card className="p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Database className="w-6 h-6 text-blue-600" />
                  البيانات
                </h2>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">تصدير البيانات</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      احصل على نسخة من جميع بياناتك
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      تحميل البيانات
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">مسح ذاكرة التخزين المؤقت</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      حذف البيانات المخزنة مؤقتاً لتحسين الأداء
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      مسح الذاكرة
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900">سجل النشاط</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          عرض جميع أنشطتك على مُثمّن
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          عرض السجل
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

