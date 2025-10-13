import { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Building2, Gift, CheckCircle2, Sparkles, Phone, Mail, User, AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    referralCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Get referral code from URL if exists
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('الرجاء إدخال الاسم');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('الرجاء إدخال رقم الجوال');
      return false;
    }
    if (!/^(05|5)\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('رقم الجوال غير صحيح (يجب أن يبدأ بـ 05 ويتكون من 10 أرقام)');
      return false;
    }
    if (!formData.email.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('البريد الإلكتروني غير صحيح');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Store user data in localStorage
        localStorage.setItem('mothammen_user', JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subscriptionType: 'standard',
          subscriptionExpiry: data.subscriptionExpiry,
          referralCode: data.referralCode,
          registeredAt: new Date().toISOString()
        }));
      } else {
        setError(data.error || 'حدث خطأ أثناء التسجيل');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateHome = () => {
    window.location.href = '/';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              مبروك! تم التسجيل بنجاح 🎉
            </h2>
            <p className="text-lg text-gray-600">
              تم تفعيل اشتراكك المجاني لمدة شهر في الباقة العادية
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl mb-6 border-2 border-blue-200">
            <h3 className="font-bold text-lg mb-4 text-gray-800">ما حصلت عليه:</h3>
            <div className="space-y-3 text-right">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">اشتراك مجاني لمدة شهر كامل في الباقة العادية</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">تقييمات عقارية غير محدودة</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">الوصول إلى الخريطة التفاعلية</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">دراسات السوق المحدثة</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl mb-6 border-2 border-purple-200">
            <div className="flex items-start gap-3 mb-4">
              <Gift className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="text-right">
                <h3 className="font-bold text-lg mb-2 text-gray-800">اربح أيام برو مجانية!</h3>
                <p className="text-sm text-gray-600 mb-3">
                  كل صديق يسجل عن طريق كود الإحالة الخاص بك = يومين اشتراك مجاني في باقة البرو 🚀
                </p>
                <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                  <div className="text-xs text-gray-600 mb-1">كود الإحالة الخاص بك:</div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {JSON.parse(localStorage.getItem('mothammen_user') || '{}').referralCode || 'LOADING...'}
                  </div>
                  <Button
                    onClick={() => {
                      const code = JSON.parse(localStorage.getItem('mothammen_user') || '{}').referralCode;
                      const url = `${window.location.origin}/register?ref=${code}`;
                      navigator.clipboard.writeText(url);
                      alert('تم نسخ رابط الإحالة!');
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    انسخ رابط الإحالة
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={navigateHome}
            size="lg"
            className="w-full gap-2"
          >
            <Building2 className="w-5 h-5" />
            ابدأ استخدام مُثمّن
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-800">مُثمّن</h1>
          </div>
          
          {/* Promotional Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Gift className="w-8 h-8" />
              <h2 className="text-2xl font-bold">عرض خاص للتسجيل!</h2>
            </div>
            <p className="text-lg font-semibold">
              سجل معنا واحصل على اشتراك شهر مجاني
            </p>
            <p className="text-sm opacity-90 mt-1">
              من الباقة العادية - بدون أي التزامات!
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            ابدأ رحلتك في عالم التقييم العقاري الذكي
          </h3>
          <p className="text-gray-600">
            انضم إلى آلاف المستخدمين الذين يثقون بمُثمّن
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسمك الكامل"
                className="w-full pr-11 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-lg"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              رقم الجوال
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="05XXXXXXXX"
                className="w-full pr-11 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-lg"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">مثال: 0512345678</p>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full pr-11 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-lg"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Referral Code Field (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              كود الإحالة (اختياري)
            </label>
            <div className="relative">
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="أدخل كود الإحالة إن وجد"
                className="w-full pr-11 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-lg"
                disabled={isLoading}
              />
            </div>
            {formData.referralCode && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                سيحصل صاحب الكود على يومين برو مجاناً!
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">خطأ</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري التسجيل...
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                سجل الآن واحصل على شهر مجاني
              </>
            )}
          </Button>

          {/* Benefits */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-center">ما ستحصل عليه:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>شهر مجاني من الباقة العادية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>تقييمات عقارية غير محدودة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>الوصول للخريطة التفاعلية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>دراسات السوق المحدثة</span>
              </div>
            </div>
          </div>

          {/* Already have account */}
          <div className="text-center pt-4 border-t">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={navigateHome}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                العودة للرئيسية
              </button>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}

