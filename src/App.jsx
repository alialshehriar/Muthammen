import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import PropertyForm from './components/PropertyForm';
import ResultDisplay from './components/ResultDisplay';
import Subscriptions from './pages/Subscriptions';
import Referrals from './pages/Referrals';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MarketStudy from './market/MarketStudy';
import EnhancedProfessionalMap from "./map/EnhancedProfessionalMap";
import { calculatePropertyValue } from './lib/aiEngine';
import { evaluateWithGPT, API_CONFIG, getHistoryStats, clearHistory } from './lib/apiConfig';
import useRefCapture from './hooks/useRefCapture';
import { 
  Building2, Sparkles, Settings, RotateCcw, 
  Brain, Zap, TrendingUp, CheckCircle2,
  Github, Mail, AlertCircle, Home, CreditCard,
  Users, BarChart3, MessageSquare, Map
} from 'lucide-react';
import './App.css';

function App() {
  // التقاط رمز الإحالة من URL
  useRefCapture();

  const [currentPage, setCurrentPage] = useState('home');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useGPT, setUseGPT] = useState(API_CONFIG.enabled);
  const [showSettings, setShowSettings] = useState(false);

  const handleEvaluate = async (formData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let evaluation;

      // اختيار المحرك (GPT أو المحلي)
      if (useGPT && API_CONFIG.enabled) {
        // استخدام GPT API
        evaluation = await evaluateWithGPT(formData);
      } else {
        // استخدام المحرك المحلي
        evaluation = await calculatePropertyValue(formData);
      }

      setResult(evaluation);
    } catch (err) {
      console.error('خطأ في التقييم:', err);
      setError(err.message || 'حدث خطأ أثناء التقييم. يرجى المحاولة مرة أخرى.');
      
      // في حالة فشل GPT، استخدم المحرك المحلي كبديل
      if (useGPT) {
        try {
          const fallbackEvaluation = await calculatePropertyValue(formData);
          setResult(fallbackEvaluation);
          setError('تم استخدام المحرك المحلي بدلاً من GPT');
        } catch (fallbackErr) {
          console.error('فشل المحرك المحلي أيضاً:', fallbackErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    if (confirm('هل أنت متأكد من حذف سجل التقييمات؟')) {
      clearHistory();
      alert('تم مسح السجل بنجاح');
    }
  };

  const stats = getHistoryStats();

  // التنقل بين الصفحات
  const navigateTo = (page) => {
    setCurrentPage(page);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // عرض الصفحة المطلوبة
  if (currentPage === 'subscriptions') {
    return (
      <>
        <Header currentPage={currentPage} navigateTo={navigateTo} />
        <Subscriptions />
        <Footer />
      </>
    );
  }

  if (currentPage === 'referrals') {
    return (
      <>
        <Header currentPage={currentPage} navigateTo={navigateTo} />
        <Referrals />
        <Footer />
      </>
    );
  }

  if (currentPage === 'market') {
    return (
      <>
        <Header currentPage={currentPage} navigateTo={navigateTo} />
        <MarketStudy />
        <Footer />
      </>
    );
  }

  if (currentPage === 'map') {
    return <EnhancedProfessionalMap />;
  }

  if (currentPage === 'register') {
    return <Register />;
  }

  if (currentPage === 'admin') {
    return <AdminDashboard />;
  }

  // الصفحة الرئيسية (التقييم)
  return (
    <div className="app-container min-h-screen">
      {/* الهيدر */}
      <Header currentPage={currentPage} navigateTo={navigateTo} showSettings={showSettings} setShowSettings={setShowSettings} />

      {/* لوحة الإعدادات */}
      {showSettings && (
        <div className="border-b border-border/50 bg-white">
          <div className="container mx-auto px-4 py-4">
            <SettingsPanel 
              useGPT={useGPT}
              setUseGPT={setUseGPT}
              stats={stats}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {!result && (
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              <span>كل عقار له قصة… ومثمّن يقرأها لك</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-balance">
              اكتشف القيمة الحقيقية<br />لعقارك في دقائق
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              ذكاء يفهم السوق — قبل ما يتحرك السوق
            </p>

            {/* شارة هاكاثون روشن */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-green-900">
                <strong>🇸🇦 النسخة التجريبية الوطنية</strong> للمشاركة في هاكاثون روشن 2025 — مفتوحة مجانًا للعرض العام
              </p>
            </div>

            {/* المميزات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              <Card className="p-6 hover-lift">
                <div className="p-3 rounded-xl bg-blue-100 w-fit mx-auto mb-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">ذكاء اصطناعي متقدم</h3>
                <p className="text-sm text-muted-foreground">
                  كل تقييم جديد يجعل مثمّن أذكى من الأمس
                </p>
              </Card>

              <Card className="p-6 hover-lift">
                <div className="p-3 rounded-xl bg-green-100 w-fit mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">نتائج فورية</h3>
                <p className="text-sm text-muted-foreground">
                  احصل على تقييم شامل في أقل من دقيقة
                </p>
              </Card>

              <Card className="p-6 hover-lift">
                <div className="p-3 rounded-xl bg-purple-100 w-fit mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">دقة عالية</h3>
                <p className="text-sm text-muted-foreground">
                  تحليل متعدد الطبقات لأكثر من 100 متغير
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <Card className="mb-6 p-4 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">تنبيه</h3>
                <p className="text-sm text-amber-800">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* النموذج والنتائج */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* النموذج */}
          <div className={result ? 'lg:sticky lg:top-24 lg:self-start' : ''}>
            <Card className="p-6 card-gradient">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">بيانات العقار</h3>
                </div>
                {result && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    تقييم جديد
                  </Button>
                )}
              </div>
              
              <PropertyForm onSubmit={handleEvaluate} isLoading={isLoading} />
            </Card>
          </div>

          {/* النتائج */}
          {result && (
            <div>
              <ResultDisplay result={result} />
              
              {/* بلوك التفاعل */}
              <Card className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-2">
                      🧠 الذكاء العقاري يتطور باستمرار
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      شاركنا تجربتك وساهم في تحسين دقة التقييم الوطني 🇸🇦
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      قيّم التجربة (قريباً)
                    </Button>
                  </div>
                </div>
              </Card>

              {/* إعلان Smart Plan */}
              <Card className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2">
                    🔓 تحليل الحي الكامل، وأفضل مناطق السكن، والتكتلات السعريّة
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    قريبًا في خطة Smart Plan
                  </p>
                  <Button 
                    variant="default"
                    onClick={() => navigateTo('subscriptions')}
                  >
                    اكتشف الباقات
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* معلومات إضافية */}
        {!result && (
          <>
            <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-purple-50 border-2 border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-center">كيف يعمل مُثمّن؟</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">أدخل البيانات</h4>
                  <p className="text-sm text-muted-foreground">
                    ابدأ بالمعلومات الأساسية وأضف التفاصيل
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">التحليل الذكي</h4>
                  <p className="text-sm text-muted-foreground">
                    المحرك يحلل جميع العوامل المؤثرة
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">التقييم الدقيق</h4>
                  <p className="text-sm text-muted-foreground">
                    احصل على السعر ونطاق التقييم
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    4
                  </div>
                  <h4 className="font-semibold mb-2">التوصيات</h4>
                  <p className="text-sm text-muted-foreground">
                    نصائح لتحسين قيمة العقار
                  </p>
                </div>
              </div>
            </Card>


          </>
        )}
      </main>

      {/* الفوتر */}
      <Footer />
    </div>
  );
}

// مكون الهيدر
function Header({ currentPage, navigateTo, showSettings, setShowSettings }) {
  const navItems = [
    { id: 'home', label: 'التقييم', icon: Home },
    { id: 'map', label: 'الخريطة', icon: Map },
    { id: 'market', label: 'دراسة السوق', icon: BarChart3 },
    { id: 'subscriptions', label: 'الباقات', icon: CreditCard },
    { id: 'referrals', label: 'الإحالات', icon: Users }
  ];

  return (
    <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigateTo('home')}
          >
            <div className="p-2 rounded-xl primary-gradient">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">مُثمّن</h1>
              <p className="text-xs text-muted-foreground">تقييم عقاري ذكي بالذكاء الاصطناعي</p>
            </div>
          </div>

          {/* التنقل */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigateTo(item.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
            <Button
              variant="default"
              size="sm"
              onClick={() => navigateTo('register')}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Sparkles className="w-4 h-4" />
              سجل الآن
            </Button>
          </nav>

          {/* زر الإعدادات (فقط في الصفحة الرئيسية) */}
          {currentPage === 'home' && setShowSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              الإعدادات
            </Button>
          )}
        </div>

        {/* التنقل للموبايل */}
        <nav className="md:hidden flex items-center gap-2 mt-4 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => navigateTo(item.id)}
                className="gap-2 flex-shrink-0"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

// مكون لوحة الإعدادات
function SettingsPanel({ useGPT, setUseGPT, stats, onClearHistory }) {
  return (
    <Card className="p-4 space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold">محرك التقييم</h3>
            <p className="text-xs text-muted-foreground">
              {API_CONFIG.enabled ? 'GPT API متاح' : 'المحرك المحلي فقط'}
            </p>
          </div>
        </div>
        
        {API_CONFIG.enabled && (
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm">استخدام GPT</span>
            <input
              type="checkbox"
              checked={useGPT}
              onChange={(e) => setUseGPT(e.target.checked)}
              className="w-4 h-4 rounded"
            />
          </label>
        )}
      </div>

      {!API_CONFIG.enabled && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-2">
            <strong>لتفعيل الذكاء الاصطناعي المتقدم:</strong>
          </p>
          <ol className="text-xs text-blue-800 space-y-1 mr-4">
            <li>1. افتح ملف <code className="bg-blue-100 px-1 rounded">src/lib/apiConfig.js</code></li>
            <li>2. ضع API Key الخاص بك في <code className="bg-blue-100 px-1 rounded">API_CONFIG.apiKey</code></li>
            <li>3. احفظ الملف وأعد تشغيل التطبيق</li>
          </ol>
        </div>
      )}

      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">إحصائيات الاستخدام</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-xs"
          >
            مسح السجل
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">إجمالي التقييمات</p>
            <p className="text-lg font-bold">{stats.totalEvaluations}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">تقييمات GPT</p>
            <p className="text-lg font-bold text-primary">{stats.gptEvaluations}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">متوسط الثقة</p>
            <p className="text-lg font-bold text-green-600">{stats.averageConfidence}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// مكون الفوتر
function Footer() {
  return (
    <footer className="border-t border-border/50 bg-white/80 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>© جميع الحقوق محفوظة 2025 لمنصّة مثمّن الذكاء العقاري السعودي</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:info@mothammen.sa"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>
            💡 هذا التطبيق يستخدم الذكاء الاصطناعي لتقديم تقييمات تقديرية. للحصول على تقييم رسمي معتمد، يُنصح بالتواصل مع مقيّم عقاري مرخّص.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default App;

