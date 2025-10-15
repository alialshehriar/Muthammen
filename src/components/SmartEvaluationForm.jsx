import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { 
  Building2, MapPin, Home, Ruler, Sparkles, 
  TrendingUp, Loader2, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function SmartEvaluationForm({ onSubmit, isLoading }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // مسح الخطأ عند الكتابة
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.area || formData.area <= 0) {
        newErrors.area = 'المساحة مطلوبة';
      }
      if (!formData.city) {
        newErrors.city = 'المدينة مطلوبة';
      }
      if (!formData.district) {
        newErrors.district = 'الحي مطلوب';
      }
    }
    
    if (currentStep === 2) {
      if (!formData.propertyType) {
        newErrors.propertyType = 'نوع العقار مطلوب';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const progress = (step / 3) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* شريط التقدم الفاخر */}
      <div className="relative">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">الخطوة {step} من 3</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* الخطوة 1: الأساسيات */}
      {step === 1 && (
        <Card className="p-8 card-gradient animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">معلومات العقار الأساسية</h2>
            <p className="text-muted-foreground">
              نحتاج فقط لبعض المعلومات البسيطة للبدء
            </p>
          </div>

          <div className="space-y-6">
            {/* المساحة */}
            <div className="space-y-2">
              <Label htmlFor="area" className="text-lg flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary" />
                ما هي مساحة العقار؟
              </Label>
              <div className="relative">
                <Input
                  id="area"
                  type="number"
                  placeholder="أدخل المساحة بالمتر المربع"
                  value={formData.area || ''}
                  onChange={(e) => handleChange('area', e.target.value)}
                  className={`text-xl h-14 pr-12 ${errors.area ? 'border-red-500' : ''}`}
                  autoFocus
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  م²
                </span>
              </div>
              {errors.area && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.area}
                </p>
              )}
            </div>

            {/* المدينة */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                في أي مدينة يقع العقار؟
              </Label>
              <select
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`w-full px-4 py-3 text-lg rounded-md border border-input bg-background h-14 ${errors.city ? 'border-red-500' : ''}`}
              >
                <option value="">اختر المدينة</option>
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
                <option value="الدمام">الدمام</option>
                <option value="الخبر">الخبر</option>
                <option value="الظهران">الظهران</option>
                <option value="الطائف">الطائف</option>
                <option value="تبوك">تبوك</option>
                <option value="بريدة">بريدة</option>
                <option value="خميس مشيط">خميس مشيط</option>
                <option value="حائل">حائل</option>
                <option value="نجران">نجران</option>
                <option value="جازان">جازان</option>
                <option value="ينبع">ينبع</option>
                <option value="الأحساء">الأحساء</option>
                <option value="القطيف">القطيف</option>
                <option value="أبها">أبها</option>
                <option value="عرعر">عرعر</option>
              </select>
              {errors.city && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.city}
                </p>
              )}
            </div>

            {/* الحي */}
            <div className="space-y-2">
              <Label htmlFor="district" className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                ما هو الحي؟
              </Label>
              <Input
                id="district"
                type="text"
                placeholder="مثال: الياسمين، النرجس، الملقا..."
                value={formData.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                className={`text-xl h-14 ${errors.district ? 'border-red-500' : ''}`}
              />
              {errors.district && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.district}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* الخطوة 2: نوع العقار */}
      {step === 2 && (
        <Card className="p-8 card-gradient animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">نوع العقار</h2>
            <p className="text-muted-foreground">
              اختر نوع العقار لتقييم أدق
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { value: 'فيلا', label: 'فيلا', icon: '🏠' },
              { value: 'شقة', label: 'شقة', icon: '🏢' },
              { value: 'دور', label: 'دور', icon: '🏘️' },
              { value: 'عمارة', label: 'عمارة', icon: '🏛️' },
              { value: 'أرض', label: 'أرض', icon: '🌍' },
              { value: 'دوبلكس', label: 'دوبلكس', icon: '🏡' }
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleChange('propertyType', type.value)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  formData.propertyType === type.value
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-4xl mb-2">{type.icon}</div>
                <div className="font-semibold">{type.label}</div>
              </button>
            ))}
          </div>
          {errors.propertyType && (
            <p className="text-sm text-red-500 text-center mt-4 flex items-center justify-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500"></span>
              {errors.propertyType}
            </p>
          )}
        </Card>
      )}

      {/* الخطوة 3: تفاصيل إضافية (اختيارية) */}
      {step === 3 && (
        <Card className="p-8 card-gradient animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">تفاصيل إضافية</h2>
            <p className="text-muted-foreground">
              اختياري - لكن يزيد من دقة التقييم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* عمر العقار */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-base">عمر العقار</Label>
              <select
                id="age"
                value={formData.age || ''}
                onChange={(e) => handleChange('age', e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-input bg-background"
              >
                <option value="">اختر العمر</option>
                <option value="جديد">جديد (قيد الإنشاء)</option>
                <option value="1-5">1-5 سنوات</option>
                <option value="6-10">6-10 سنوات</option>
                <option value="11-15">11-15 سنة</option>
                <option value="16-20">16-20 سنة</option>
                <option value="أكثر من 20">أكثر من 20 سنة</option>
              </select>
            </div>

            {/* عدد الغرف */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="text-base">عدد الغرف</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="مثال: 4"
                value={formData.bedrooms || ''}
                onChange={(e) => handleChange('bedrooms', e.target.value)}
                className="h-12"
              />
            </div>

            {/* عدد دورات المياه */}
            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="text-base">عدد دورات المياه</Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="مثال: 3"
                value={formData.bathrooms || ''}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
                className="h-12"
              />
            </div>

            {/* موقف سيارات */}
            <div className="space-y-2">
              <Label htmlFor="parking" className="text-base">موقف سيارات</Label>
              <select
                id="parking"
                value={formData.parking || ''}
                onChange={(e) => handleChange('parking', e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-input bg-background"
              >
                <option value="">اختر</option>
                <option value="لا يوجد">لا يوجد</option>
                <option value="1">سيارة واحدة</option>
                <option value="2">سيارتان</option>
                <option value="3+">3 سيارات أو أكثر</option>
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              💡 يمكنك تخطي هذه الخطوة والحصول على تقييم أولي
            </p>
          </div>
        </Card>
      )}

      {/* أزرار التنقل */}
      <div className="flex gap-4">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1 h-12"
            disabled={isLoading}
          >
            السابق
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          className="flex-1 h-12 text-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جارٍ التقييم...
            </>
          ) : step === 3 ? (
            <>
              <TrendingUp className="ml-2 h-5 w-5" />
              احصل على التقييم
            </>
          ) : (
            <>
              التالي
              <ArrowRight className="mr-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>

      {/* مؤشر الثقة */}
      {step === 3 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-medium">مستوى الثقة المتوقع</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded-full ${
                      i < Math.ceil((Object.keys(formData).length / 10) * 5)
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">
                {Math.min(Math.round((Object.keys(formData).length / 10) * 100), 95)}%
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

