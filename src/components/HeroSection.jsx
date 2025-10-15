import { Sparkles, TrendingUp, Shield, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection({ currentUser, onScrollToForm }) {
  return (
    <div className="relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* شارة مميزة */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 mb-8 animate-float">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-900">
              كل عقار له قصة… ومثمّن يقرأها لك
            </span>
          </div>

          {/* العنوان الرئيسي */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="block text-gradient animate-gradient">
              اكتشف القيمة الحقيقية
            </span>
            <span className="block mt-2">
              لعقارك في دقائق
            </span>
          </h1>

          {/* الوصف */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            ذكاء يفهم السوق — قبل ما يتحرك السوق
          </p>

          {/* رسالة ترحيب شخصية */}
          {currentUser && (
            <div className="mb-8 p-6 glass-effect rounded-2xl max-w-2xl mx-auto border-2 border-blue-200 shine-effect">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">مرحباً {currentUser.name}! 👋</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.subscriptionType === 'free' ? 'باقة مجانية' : 'باقة مميزة'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-blue-900">
                أنت الآن جاهز لاستخدام جميع ميزات مُثمّن المتقدمة
              </p>
            </div>
          )}

          {/* شارة هاكاثون روشن */}
          <div className="mb-10 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl max-w-2xl mx-auto luxury-card">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                🇸🇦
              </div>
              <p className="font-black text-lg text-green-900">
                النسخة التجريبية الوطنية
              </p>
            </div>
            <p className="text-sm text-green-800">
              للمشاركة في هاكاثون روشن 2025 — مفتوحة مجانًا للعرض العام
            </p>
          </div>

          {/* زر الإجراء */}
          <Button
            size="lg"
            onClick={onScrollToForm}
            className="btn-luxury text-lg px-8 py-6 rounded-xl font-bold gap-3 shine-effect"
          >
            <span>ابدأ التقييم الآن</span>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* المميزات الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <FeatureCard
              icon={Shield}
              title="ذكاء اصطناعي متقدم"
              description="كل تقييم جديد يجعل مثمّن أذكى من الأمس"
              color="blue"
              delay="0s"
            />
            <FeatureCard
              icon={Zap}
              title="نتائج فورية"
              description="احصل على تقييم شامل في أقل من دقيقة"
              color="green"
              delay="0.1s"
            />
            <FeatureCard
              icon={TrendingUp}
              title="دقة عالية"
              description="تحليل متعدد الطبقات لأكثر من 100 متغير"
              color="purple"
              delay="0.2s"
            />
          </div>

          {/* إحصائيات */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <StatCard number="10,000+" label="تقييم مكتمل" />
            <StatCard number="98%" label="دقة التقييم" />
            <StatCard number="< 60" label="ثانية" />
            <StatCard number="24/7" label="متاح دائماً" />
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون بطاقة الميزة
function FeatureCard({ icon: Icon, title, description, color, delay }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
  };

  return (
    <div
      className="luxury-card p-6 text-center"
      style={{ animationDelay: delay }}
    >
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} mb-4 glow-effect`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// مكون بطاقة الإحصائية
function StatCard({ number, label }) {
  return (
    <div className="glass-effect p-6 rounded-xl border-2 border-blue-100 hover-lift">
      <p className="text-3xl md:text-4xl font-black text-gradient mb-2">{number}</p>
      <p className="text-sm text-muted-foreground font-semibold">{label}</p>
    </div>
  );
}

