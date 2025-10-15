import React from 'react';
import { Map, MapPin, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react';

const ComingSoon = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-4xl w-full">
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Map className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                خريطة مُثمّن التفاعلية
              </h1>
              
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                أول خريطة عقارية ذكية تجمع الأسعار والاتجاهات والفرص في مكان واحد
              </p>
            </div>
          </div>

          {/* المحتوى */}
          <div className="p-12">
            {/* شعار قريباً */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-full px-8 py-4 mb-6">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <span className="text-2xl font-bold text-amber-900">قريباً</span>
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                نعمل حالياً على تطوير خريطة تفاعلية متقدمة لمدينة الرياض تعرض معلومات عقارية شاملة ودقيقة
              </p>
            </div>

            {/* الميزات القادمة */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">خريطة الرياض التفاعلية</h3>
                <p className="text-slate-600">
                  استكشف جميع أحياء الرياض مع معلومات تفصيلية عن كل منطقة
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">نطاقات الأسعار المباشرة</h3>
                <p className="text-slate-600">
                  شاهد أسعار البيع والإيجار لكل حي بشكل مباشر على الخريطة
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">تفاعلية متقدمة</h3>
                <p className="text-slate-600">
                  معلومات تظهر عند التحويم والنقر مع تصميم نظيف واحترافي
                </p>
              </div>
            </div>

            {/* رسالة التطوير */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                    <Map className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    جاري العمل على التطوير
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    فريق مُثمّن يعمل بجد لتقديم أفضل تجربة خريطة عقارية في المملكة. 
                    نركز على الدقة والتفاصيل لضمان حصولك على معلومات موثوقة ومفيدة.
                  </p>
                  <p className="text-sm text-slate-500">
                    سيتم الإعلان عن موعد الإطلاق قريباً
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500">
          <p className="text-sm">
            هل لديك اقتراحات للخريطة؟ تواصل معنا على{' '}
            <a href="mailto:info@muthammen.com" className="text-blue-600 hover:text-blue-700 font-medium">
              info@muthammen.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

