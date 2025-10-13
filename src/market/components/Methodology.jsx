import { Card } from '@/components/ui/card.jsx';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export default function Methodology() {
  const steps = [
    {
      title: 'جمع البيانات',
      description: 'تجميع بيانات المعاملات العقارية من مصادر رسمية ومعتمدة'
    },
    {
      title: 'التنظيف والتحقق',
      description: 'تنقية البيانات واستبعاد القيم الشاذة والمعاملات غير النمطية'
    },
    {
      title: 'التحليل الإحصائي',
      description: 'حساب المتوسطات والنطاقات (P25, P50, P75) لكل منطقة'
    },
    {
      title: 'حساب الاتجاهات',
      description: 'تحليل التغيرات السنوية والشهرية وتحديد الاتجاهات'
    },
    {
      title: 'تقييم الثقة',
      description: 'حساب مستوى الثقة بناءً على حجم العينة وتناسق البيانات'
    },
    {
      title: 'التحديث المستمر',
      description: 'تحديث دوري للبيانات والمؤشرات (شهرياً في النسخة النهائية)'
    }
  ];

  return (
    <Card className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-100">
          <BookOpen className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">المنهجية</h2>
          <p className="text-sm text-muted-foreground">كيف نحسب مؤشرات السوق</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-2">معايير الجودة</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• استبعاد المعاملات غير النمطية (أقل من 1% أو أكثر من 99%)</li>
              <li>• الحد الأدنى للعينة: 100 معاملة لكل منطقة</li>
              <li>• مستوى الثقة يعكس حجم العينة وتناسق البيانات</li>
              <li>• التحديث الدوري يضمن دقة المؤشرات</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}

