import React, { useState } from 'react';
import { Map, MapPin, TrendingUp, Sparkles, ArrowLeft, Building2, BarChart3, Search, Filter, Eye, Zap, Bell, CheckCircle2, Mail } from 'lucide-react';

const ComingSoon = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // التحقق من البيانات
    if (!email || !name) {
      setError('الرجاء إدخال الاسم والبريد الإلكتروني');
      return;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsSubmitting(true);

    try {
      // إرسال البيانات إلى API
      const response = await fetch('/api/map-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'حدث خطأ أثناء التسجيل');
      }
      
      setIsSubmitted(true);
      setEmail('');
      setName('');
      setPhone('');
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-6xl w-full">
        {/* زر العودة */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">العودة للرئيسية</span>
        </button>

        {/* المحتوى الرئيسي */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* الهيدر */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl">
                <Map className="w-14 h-14 text-white" />
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                خريطة مُثمّن التفاعلية
              </h1>
              
              <p className="text-2xl text-blue-50 max-w-3xl mx-auto font-light leading-relaxed">
                أول منصة عقارية ذكية في المملكة تجمع البيانات والتحليلات والفرص الاستثمارية في خريطة واحدة تفاعلية
              </p>
            </div>
          </div>

          {/* المحتوى */}
          <div className="p-12">
            {/* شعار قريباً */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-full px-10 py-5 mb-8 shadow-lg">
                <Sparkles className="w-7 h-7 text-amber-600 animate-pulse" />
                <span className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">قريباً</span>
                <Sparkles className="w-7 h-7 text-amber-600 animate-pulse" />
              </div>
              
              <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium">
                نعمل حالياً على تطوير خريطة تفاعلية متقدمة لمدينة الرياض تعرض معلومات عقارية شاملة ودقيقة بتقنيات حديثة وتصميم فاخر
              </p>
            </div>

            {/* نموذج التسجيل للإشعار */}
            <div className="mb-16 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 border-2 border-blue-200 shadow-xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">
                    كن أول من يعلم بالإطلاق
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    سجّل بياناتك وسنرسل لك إشعاراً فور إطلاق الخريطة التفاعلية مع وصول مبكر حصري
                  </p>
                </div>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: محمد أحمد"
                        className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        رقم الجوال (اختياري)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg"
                        disabled={isSubmitting}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-center">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري التسجيل...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          <span>أرسل لي إشعار الإطلاق</span>
                        </>
                      )}
                    </button>

                    <p className="text-sm text-slate-500 text-center leading-relaxed">
                      بالتسجيل، أنت توافق على تلقي تحديثات حول خريطة مُثمّن. لن نشارك بياناتك مع أي طرف ثالث
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-3">
                      شكراً لتسجيلك!
                    </h4>
                    <p className="text-slate-600 text-lg leading-relaxed mb-6">
                      سنرسل لك إشعاراً على بريدك الإلكتروني فور إطلاق الخريطة التفاعلية
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      تسجيل بريد آخر
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* الميزات الرئيسية */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">ماذا ستقدم لك الخريطة؟</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">خريطة الرياض الشاملة</h3>
                  <p className="text-slate-700 leading-relaxed">
                    استكشف جميع أحياء ومناطق الرياض بتفاصيل دقيقة، مع معلومات شاملة عن كل حي ومنطقة، بما في ذلك الخدمات والمرافق القريبة
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">أسعار السوق الحية</h3>
                  <p className="text-slate-700 leading-relaxed">
                    شاهد نطاقات أسعار البيع والإيجار لكل حي بشكل مباشر ومحدث، مع مؤشرات الاتجاهات السعرية والنمو المتوقع
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">أنواع العقارات</h3>
                  <p className="text-slate-700 leading-relaxed">
                    تصفح العقارات حسب النوع: فلل، شقق، أراضي، عمائر، ومحلات تجارية، مع إحصائيات دقيقة لكل نوع
                  </p>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-8 border-2 border-rose-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">تحليلات متقدمة</h3>
                  <p className="text-slate-700 leading-relaxed">
                    احصل على تحليلات عميقة للسوق العقاري، مع رسوم بيانية توضح التطورات التاريخية والتوقعات المستقبلية
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 border-2 border-amber-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                    <Search className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">بحث ذكي متقدم</h3>
                  <p className="text-slate-700 leading-relaxed">
                    ابحث عن أي حي أو منطقة بسهولة، مع اقتراحات ذكية ونتائج فورية، واحفظ عمليات البحث المفضلة لديك
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 border-2 border-indigo-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                    <Filter className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">فلاتر قوية</h3>
                  <p className="text-slate-700 leading-relaxed">
                    صفّي النتائج حسب السعر، المساحة، نوع العقار، والمرافق القريبة، للوصول بدقة إلى ما تبحث عنه
                  </p>
                </div>
              </div>
            </div>

            {/* المميزات الإضافية */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">مميزات إضافية</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">تفاعلية سلسة</h3>
                      <p className="text-slate-600 leading-relaxed">
                        معلومات تفصيلية تظهر عند التحويم والنقر على أي منطقة، مع انتقالات سلسة وتجربة مستخدم استثنائية
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">تحديثات فورية</h3>
                      <p className="text-slate-600 leading-relaxed">
                        بيانات محدثة بشكل دوري لضمان حصولك على أحدث المعلومات العقارية والأسعار الحقيقية للسوق
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* رسالة التطوير */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 text-white shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                    <Map className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4">
                    جاري العمل على التطوير
                  </h3>
                  <p className="text-slate-200 leading-relaxed mb-4 text-lg">
                    فريق مُثمّن يعمل بجد لتقديم أفضل تجربة خريطة عقارية في المملكة العربية السعودية. 
                    نركز على الدقة والتفاصيل والتصميم الفاخر لضمان حصولك على معلومات موثوقة ومفيدة بأسلوب احترافي عالمي.
                  </p>
                  <p className="text-slate-300 text-base">
                    سيتم الإعلان عن موعد الإطلاق قريباً. سجّل بياناتك أعلاه للحصول على التحديثات الأولى
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-slate-600">
          <p className="text-base">
            هل لديك اقتراحات أو استفسارات حول الخريطة؟ تواصل معنا على{' '}
            <a href="mailto:info@muthammen.com" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              info@muthammen.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

