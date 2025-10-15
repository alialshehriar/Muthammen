import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    id: 1,
    name: 'أحمد السعيد',
    role: 'مستثمر عقاري',
    avatar: '👨‍💼',
    rating: 5,
    text: 'مُثمّن غيّر طريقة تقييمي للعقارات. الدقة والسرعة لا مثيل لها!',
    location: 'الرياض'
  },
  {
    id: 2,
    name: 'فاطمة المطيري',
    role: 'وكيل عقاري',
    avatar: '👩‍💼',
    rating: 5,
    text: 'أداة لا غنى عنها في عملي اليومي. التقارير احترافية جداً.',
    location: 'جدة'
  },
  {
    id: 3,
    name: 'خالد العتيبي',
    role: 'مطور عقاري',
    avatar: '🏗️',
    rating: 5,
    text: 'الذكاء الاصطناعي فعلاً يفهم السوق السعودي. نتائج موثوقة.',
    location: 'الدمام'
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span>آراء عملائنا</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            ماذا يقول <span className="text-gradient">مستخدمونا</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            انضم إلى آلاف المستخدمين الذين يثقون في مُثمّن لتقييم عقاراتهم
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              delay={`${index * 0.1}s`}
            />
          ))}
        </div>

        {/* إحصائيات الثقة */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <TrustStat number="10,000+" label="مستخدم نشط" />
          <TrustStat number="4.9/5" label="تقييم العملاء" />
          <TrustStat number="50,000+" label="تقييم مكتمل" />
          <TrustStat number="99%" label="رضا العملاء" />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, delay }) {
  return (
    <Card
      className="p-6 luxury-card relative overflow-hidden"
      style={{ animationDelay: delay }}
    >
      {/* أيقونة الاقتباس */}
      <div className="absolute top-4 left-4 opacity-10">
        <Quote className="w-16 h-16 text-blue-600" />
      </div>

      {/* التقييم */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* النص */}
      <p className="text-foreground mb-6 relative z-10 leading-relaxed">
        "{testimonial.text}"
      </p>

      {/* معلومات المستخدم */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
          {testimonial.avatar}
        </div>
        <div className="text-right">
          <p className="font-bold">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          <p className="text-xs text-blue-600">📍 {testimonial.location}</p>
        </div>
      </div>
    </Card>
  );
}

function TrustStat({ number, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-black text-gradient mb-2">
        {number}
      </p>
      <p className="text-sm text-muted-foreground font-semibold">{label}</p>
    </div>
  );
}

