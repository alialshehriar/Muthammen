import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Check, Lock, Sparkles, Zap, Crown, Building2,
  TrendingUp, Map, BarChart3, Users
} from 'lucide-react';

export default function Subscriptions() {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      nameAr: 'الباقة الأساسية',
      price: 'مجاني',
      status: 'active',
      statusText: '✅ فعّالة',
      icon: Sparkles,
      color: 'from-blue-500 to-blue-600',
      features: [
        'تقييم عقاري أساسي',
        'تحليل السوق العام',
        'نتائج فورية',
        'دعم فني أساسي'
      ]
    },
    {
      id: 'smart',
      name: 'Smart',
      nameAr: 'الباقة الذكية',
      price: '٤٩ ريال',
      priceNote: 'شهرياً',
      status: 'coming',
      statusText: '🔒 قريباً',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      badge: 'الأكثر شعبية',
      features: [
        'كل مزايا Basic',
        'تحليل الحي الكامل',
        'أفضل مناطق السكن',
        'التكتلات السعرية',
        'تقارير مفصّلة',
        'أولوية في الدعم'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      nameAr: 'الباقة الاحترافية',
      price: '١٤٩ ريال',
      priceNote: 'شهرياً',
      status: 'coming',
      statusText: '🔒 قريباً',
      icon: Crown,
      color: 'from-amber-500 to-amber-600',
      features: [
        'كل مزايا Smart',
        'خريطة الوعي العقاري',
        'تحليلات متقدمة بالذكاء الاصطناعي',
        'مقارنات غير محدودة',
        'API للتكامل',
        'استشارات شهرية',
        'دعم فني مخصص'
      ]
    },
    {
      id: 'api',
      name: 'API',
      nameAr: 'باقة الأعمال',
      price: 'B2B',
      priceNote: 'حسب الاستخدام',
      status: 'coming',
      statusText: '🔒 قريباً',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      features: [
        'وصول كامل لـ API',
        'تكامل مع أنظمتك',
        'حدود استخدام مرتفعة',
        'بيانات تاريخية',
        'دعم فني مخصص 24/7',
        'SLA مضمون',
        'تدريب للفريق'
      ]
    }
  ];

  const getButtonConfig = (status) => {
    if (status === 'active') {
      return {
        text: 'مفعّلة',
        variant: 'default',
        disabled: true
      };
    }
    return {
      text: 'قريباً',
      variant: 'outline',
      disabled: true
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* الهيدر */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>اختر الباقة المناسبة لك</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-balance">
            باقات مُثمّن
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            ابدأ مجاناً واستكشف قوة الذكاء الاصطناعي في التقييم العقاري
          </p>
        </div>

        {/* الباقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const buttonConfig = getButtonConfig(plan.status);
            const isActive = plan.status === 'active';
            
            return (
              <Card 
                key={plan.id}
                className={`relative p-6 hover-lift ${
                  isActive ? 'border-2 border-primary shadow-lg' : ''
                }`}
              >
                {/* شارة الأكثر شعبية */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* الأيقونة */}
                <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color} w-fit mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* الاسم */}
                <h3 className="text-xl font-bold mb-1">{plan.nameAr}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.name}</p>

                {/* السعر */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{plan.price}</span>
                    {plan.priceNote && (
                      <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
                    )}
                  </div>
                </div>

                {/* الحالة */}
                <div className="mb-6">
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {plan.statusText}
                  </Badge>
                </div>

                {/* الزر */}
                <Button 
                  className="w-full mb-6"
                  variant={buttonConfig.variant}
                  disabled={buttonConfig.disabled}
                >
                  {buttonConfig.text}
                </Button>

                {/* المميزات */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* التنبيه */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">النسخة الحالية للتجربة العامة</h3>
              <p className="text-muted-foreground mb-4">
                جميع المزايا المتقدمة ستُتاح في التحديث القادم. نحن نعمل على تطوير تجربة استثنائية لك.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Map className="w-4 h-4 text-blue-600" />
                  <span>خريطة الوعي العقاري</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>تحليلات متقدمة</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>توقعات السوق</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>مقارنات الأحياء</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* معلومات إضافية */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            هل لديك احتياجات خاصة؟
          </p>
          <Button variant="outline" size="lg">
            تواصل معنا
          </Button>
        </div>
      </div>
    </div>
  );
}

