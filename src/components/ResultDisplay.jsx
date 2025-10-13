import { Card } from '@/components/ui/card.jsx';
import { 
  TrendingUp, TrendingDown, Minus, CheckCircle2, 
  AlertCircle, Lightbulb, BarChart3, Target,
  Sparkles, Brain, Clock, Award
} from 'lucide-react';

export default function ResultDisplay({ result }) {
  if (!result) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 70) return <CheckCircle2 className="w-5 h-5" />;
    if (confidence >= 50) return <AlertCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'صاعد') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'نازل') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* البطاقة الرئيسية - القيمة التقديرية */}
      <Card className="p-8 result-badge text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 right-4">
            <Sparkles className="w-32 h-32" />
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-6 h-6" />
            <h2 className="text-xl font-bold">القيمة التقديرية للعقار</h2>
          </div>
          
          <div className="mt-4">
            <div className="text-5xl font-black mb-2">
              {formatPrice(result.estimatedValue)}
            </div>
            <p className="text-white/80 text-sm">
              النطاق المتوقع: {formatPrice(result.priceRange?.min || result.estimatedValue * 0.9)} - {formatPrice(result.priceRange?.max || result.estimatedValue * 1.1)}
            </p>
          </div>

          {result.source === 'gpt' && (
            <div className="mt-4 flex items-center gap-2 text-white/90 bg-white/10 rounded-lg px-3 py-2 w-fit">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-semibold">تم التقييم بواسطة الذكاء الاصطناعي المتقدم</span>
            </div>
          )}
        </div>
      </Card>

      {/* مستوى الثقة - يُخفى عند استخدام الوكيل */}
      {!result.usedAgent && (
        <Card className={`p-6 border-2 ${getConfidenceColor(result.confidence)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getConfidenceIcon(result.confidence)}
              <div>
                <h3 className="font-bold text-lg">مستوى الثقة في التقييم</h3>
                <p className="text-sm opacity-80">
                  بناءً على {result.filledFieldsCount || 'عدة'} معلومة مُدخلة
                </p>
              </div>
            </div>
            <div className="text-4xl font-black">
              {result.confidence}%
            </div>
          </div>
          
          <div className="mt-4 w-full h-3 bg-white/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${result.confidence}%`,
                background: result.confidence >= 70 
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                  : result.confidence >= 50 
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #ef4444, #dc2626)'
              }}
            />
          </div>
        </Card>
      )}

      {/* رسالة عند استخدام الوكيل */}
      {result.usedAgent && result.nqs && (
        <Card className="p-6 border-2 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-bold text-lg">تم التقييم بواسطة الذكاء الاصطناعي</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {result.nqs.notes || 'تم حساب القيمة بدقة عالية باستخدام نموذج ذكاء اصطناعي متقدم'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* تحليل العوامل المؤثرة - للنتائج من GPT */}
      {result.analysis && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">تحليل العوامل المؤثرة</h3>
          </div>

          {/* الحساب الأساسي */}
          {result.analysis.baseCalculation && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-1">الحساب الأساسي:</p>
              <p className="text-sm">{result.analysis.baseCalculation}</p>
            </div>
          )}

          {/* العوامل الرئيسية */}
          {result.analysis.keyFactors && result.analysis.keyFactors.length > 0 && (
            <div className="space-y-3">
              {result.analysis.keyFactors.map((factor, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{factor.factor}</h4>
                    <span className="text-sm font-bold text-primary">{factor.impact}</span>
                  </div>
                  {factor.reasoning && (
                    <p className="text-sm text-muted-foreground">{factor.reasoning}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* مقارنة السوق */}
          {result.analysis.marketComparison && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold mb-1 text-blue-900">مقارنة السوق:</p>
              <p className="text-sm text-blue-800">{result.analysis.marketComparison}</p>
            </div>
          )}

          {/* نقاط القوة والضعف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {result.analysis.strengths && result.analysis.strengths.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  نقاط القوة
                </h4>
                <ul className="space-y-1">
                  {result.analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-800">• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.analysis.weaknesses && result.analysis.weaknesses.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  نقاط الضعف
                </h4>
                <ul className="space-y-1">
                  {result.analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-amber-800">• {weakness}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* تحليل العوامل - للنتائج المحلية */}
      {result.adjustments && !result.analysis && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">تفاصيل الحساب</h3>
          </div>

          {result.adjustments.baseCalculation && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-1">الحساب الأساسي:</p>
              <p className="text-sm">{result.adjustments.baseCalculation}</p>
            </div>
          )}

          {result.adjustments.appliedFactors && result.adjustments.appliedFactors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold mb-2">العوامل المطبقة:</p>
              {result.adjustments.appliedFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <span className="font-semibold text-sm">{factor.factor}:</span>
                    <span className="text-sm text-muted-foreground mr-2">{factor.value}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{factor.impact}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* رؤى السوق - من GPT */}
      {result.marketInsights && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">رؤى السوق</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                {getTrendIcon(result.marketInsights.trend)}
              </div>
              <p className="text-sm text-muted-foreground mb-1">اتجاه السوق</p>
              <p className="font-bold">{result.marketInsights.trend}</p>
            </div>

            <div className="p-4 border border-border rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">مستوى الطلب</p>
              <p className="font-bold">{result.marketInsights.demandLevel}</p>
            </div>

            <div className="p-4 border border-border rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">أفضل وقت للبيع</p>
              <p className="font-bold">{result.marketInsights.bestTimeToSell}</p>
            </div>
          </div>
        </Card>
      )}

      {/* درجة الاستثمار - من GPT */}
      {result.investmentScore && (
        <Card className="p-6 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-bold text-lg">تقييم الاستثمار</h3>
                <p className="text-sm text-muted-foreground">من 10</p>
              </div>
            </div>
            <div className="text-5xl font-black text-primary">
              {result.investmentScore}
            </div>
          </div>
        </Card>
      )}

      {/* التوصيات */}
      {result.recommendations && result.recommendations.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-blue-900">توصيات لتحسين التقييم</h3>
          </div>
          
          <ul className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-900">{recommendation}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* الشرح التفصيلي - من GPT */}
      {result.reasoning && (
        <Card className="p-6 bg-muted/50">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">التحليل الشامل</h3>
          </div>
          <p className="text-sm leading-relaxed">{result.reasoning}</p>
        </Card>
      )}

      {/* تحليل جودة الحي (تلقائي) */}
      {result.nqs && result.nqs.districtFound && (
        <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-indigo-900">تحليل جودة الحي (تلقائي)</h4>
          </div>
          <p className="text-sm text-indigo-800">
            {result.nqs.explanation}
          </p>
          <p className="text-xs text-indigo-600 mt-2">
            ℹ️ تم حساب جودة الحي تلقائياً بناءً على كثافة الخدمات، سهولة النفاذ، المساحات الخضراء، والمؤسسات التعليمية
          </p>
        </Card>
      )}

      {/* معلومات إضافية */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>
          💡 هذا التقييم تقديري ويعتمد على البيانات المُدخلة والسوق الحالي
        </p>
        <p>
          📊 للحصول على تقييم أكثر دقة، يُنصح بإضافة المزيد من التفاصيل
        </p>
        {result.source === 'gpt' && (
          <p className="font-semibold text-primary">
            🤖 تم التقييم باستخدام نموذج {result.model}
          </p>
        )}
      </div>
    </div>
  );
}

