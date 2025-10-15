import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { 
  Building2, Mail, User, Phone, Gift, 
  CheckCircle2, Sparkles, AlertCircle, Loader2,
  Shield, Lock, Eye, EyeOff
} from 'lucide-react';

export default function AuthGate({ onAuthenticated }) {
  const [step, setStep] = useState('welcome'); // welcome, register, verify, complete
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // التحقق من وجود مستخدم مسجل
  useEffect(() => {
    const user = localStorage.getItem('muthammen_user');
    const verified = localStorage.getItem('muthammen_verified');
    
    if (user && verified === 'true') {
      onAuthenticated(JSON.parse(user));
    }
  }, [onAuthenticated]);

  // الحصول على رمز الإحالة من URL
  useEffect(() => {
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
      setError('الرجاء إدخال الاسم الكامل');
      return false;
    }
    if (formData.name.trim().length < 3) {
      setError('الاسم يجب أن يكون 3 أحرف على الأقل');
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
    if (!formData.phone.trim()) {
      setError('الرجاء إدخال رقم الجوال');
      return false;
    }
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!/^(05|5)\d{8}$/.test(cleanPhone)) {
      setError('رقم الجوال غير صحيح (يجب أن يبدأ بـ 05 ويتكون من 10 أرقام)');
      return false;
    }
    if (!formData.password) {
      setError('الرجاء إدخال كلمة المرور');
      return false;
    }
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // حفظ البيانات مؤقتاً
        localStorage.setItem('muthammen_temp_user', JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          userId: data.userId
        }));
        setStep('verify');
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

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('الرجاء إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tempUser = JSON.parse(localStorage.getItem('muthammen_temp_user'));
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tempUser.email,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // حفظ بيانات المستخدم النهائية
        const userData = {
          ...tempUser,
          verified: true,
          subscriptionType: data.subscriptionType || 'standard',
          subscriptionExpiry: data.subscriptionExpiry,
          referralCode: data.referralCode,
          registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('muthammen_user', JSON.stringify(userData));
        localStorage.setItem('muthammen_verified', 'true');
        localStorage.removeItem('muthammen_temp_user');
        
        setStep('complete');
        
        // الانتقال إلى التطبيق بعد 2 ثانية
        setTimeout(() => {
          onAuthenticated(userData);
        }, 2000);
      } else {
        setError(data.error || 'رمز التحقق غير صحيح');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('حدث خطأ في التحقق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const tempUser = JSON.parse(localStorage.getItem('muthammen_temp_user'));
      
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tempUser.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني');
      } else {
        setError(data.error || 'فشل إعادة إرسال الرمز');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // صفحة الترحيب
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="p-8 md:p-12 text-center card-gradient border-2 border-primary/20">
            {/* الشعار */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white mb-4">
                <Building2 className="w-12 h-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                مُثمّن
              </h1>
              <p className="text-lg text-muted-foreground">
                تقييم عقاري ذكي بالذكاء الاصطناعي
              </p>
            </div>

            {/* الوصف */}
            <div className="mb-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>كل عقار له قصة… ومثمّن يقرأها لك</span>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                اكتشف القيمة الحقيقية لعقارك في دقائق باستخدام تقنيات الذكاء الاصطناعي المتقدمة
              </p>
            </div>

            {/* المميزات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm mb-1">آمن ومحمي</h3>
                <p className="text-xs text-muted-foreground">بياناتك محمية بأعلى معايير الأمان</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm mb-1">دقة عالية</h3>
                <p className="text-xs text-muted-foreground">تحليل أكثر من 100 متغير عقاري</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm mb-1">نتائج فورية</h3>
                <p className="text-xs text-muted-foreground">احصل على التقييم في أقل من دقيقة</p>
              </div>
            </div>

            {/* زر البدء */}
            <Button 
              onClick={() => setStep('register')}
              size="lg"
              className="w-full md:w-auto px-12 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              ابدأ الآن مجاناً
            </Button>

            {/* شارة هاكاثون */}
            <div className="mt-6 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-900">
                <strong>🇸🇦 النسخة التجريبية الوطنية</strong> للمشاركة في هاكاثون روشن 2025
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // صفحة التسجيل
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 card-gradient border-2 border-primary/20">
            {/* العنوان */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-primary/10 mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black mb-2">إنشاء حساب جديد</h2>
              <p className="text-sm text-muted-foreground">
                سجل الآن واحصل على تقييمات عقارية غير محدودة
              </p>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* النموذج */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* الاسم */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <User className="w-4 h-4 inline ml-1" />
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Mail className="w-4 h-4 inline ml-1" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                />
              </div>

              {/* رقم الجوال */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="05xxxxxxxx"
                  required
                  dir="ltr"
                />
              </div>

              {/* كلمة المرور */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Lock className="w-4 h-4 inline ml-1" />
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="8 أحرف على الأقل"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* تأكيد كلمة المرور */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Lock className="w-4 h-4 inline ml-1" />
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* رمز الإحالة (اختياري) */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Gift className="w-4 h-4 inline ml-1" />
                  رمز الإحالة (اختياري)
                </label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="أدخل رمز الإحالة إن وجد"
                  dir="ltr"
                />
              </div>

              {/* زر التسجيل */}
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-lg font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                    إنشاء الحساب
                  </>
                )}
              </Button>
            </form>

            {/* ملاحظة */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // صفحة التحقق
  if (step === 'verify') {
    const tempUser = JSON.parse(localStorage.getItem('muthammen_temp_user') || '{}');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 card-gradient border-2 border-primary/20">
            {/* العنوان */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-primary/10 mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black mb-2">تحقق من بريدك الإلكتروني</h2>
              <p className="text-sm text-muted-foreground">
                أرسلنا رمز تحقق مكون من 6 أرقام إلى
              </p>
              <p className="text-sm font-bold text-primary mt-1" dir="ltr">
                {tempUser.email}
              </p>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* نموذج التحقق */}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-center">
                  رمز التحقق
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                    setError('');
                  }}
                  className="w-full px-4 py-4 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                  dir="ltr"
                />
              </div>

              <Button 
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-6 text-lg font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                    تأكيد الحساب
                  </>
                )}
              </Button>
            </form>

            {/* إعادة الإرسال */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                لم تستلم الرمز؟
              </p>
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-primary hover:text-primary/80"
              >
                إعادة إرسال الرمز
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // صفحة الاكتمال
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center card-gradient border-2 border-green-200">
            <div className="inline-flex items-center gap-2 p-4 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-black mb-2">تم التسجيل بنجاح! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              مرحباً بك في مُثمّن. جاري تحميل التطبيق...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}

