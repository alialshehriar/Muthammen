import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import PropertyForm from './components/PropertyForm';
import SmartEvaluationForm from './components/SmartEvaluationForm';
import ResultDisplay from './components/ResultDisplay';
import Subscriptions from './pages/Subscriptions';
import Referrals from './pages/Referrals';
import Register from './pages/Register';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AuthGate from './pages/AuthGate';
import MarketStudy from './market/MarketStudy';
import ComingSoonMap from "./map/ComingSoon";
import { calculatePropertyValue } from './lib/aiEngine';
import { evaluateWithGPT, API_CONFIG, getHistoryStats, clearHistory } from './lib/apiConfig';
import useRefCapture from './hooks/useRefCapture';
import { 
  Building2, Sparkles, Settings as SettingsIcon, RotateCcw, 
  Brain, Zap, TrendingUp, CheckCircle2,
  Github, Mail, AlertCircle, Home, CreditCard,
  Users, BarChart3, MessageSquare, Map, LogOut
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // التحقق من المصادقة عند تحميل التطبيق
  useEffect(() => {
    const user = localStorage.getItem('muthammen_user');
    const verified = localStorage.getItem('muthammen_verified');
    
    if (user && verified === 'true') {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Check if admin is already authenticated
  useEffect(() => {
    const adminApiKey = localStorage.getItem('adminApiKey');
    if (adminApiKey) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      localStorage.removeItem('muthammen_user');
      localStorage.removeItem('muthammen_verified');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentPage('home');
      window.location.reload();
    }
  };

  const handleEvaluate = async (formData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // استدعاء API endpoint الجديد
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: currentUser?.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل التقييم');
      }

      setResult(data.evaluation);
    } catch (err) {
      console.error('خطأ في التقييم:', err);
      setError(err.message || 'حدث خطأ أثناء التقييم. يرجى المحاولة مرة أخرى.');
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

  // إذا لم يكن المستخدم مصادقاً، عرض AuthGate
  if (!isAuthenticated) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  // عرض الصفحة المطلوبة
  if (currentPage === 'subscriptions') {
    return (
      <>
        <Header 
          currentPage={currentPage} 
          navigateTo={navigateTo} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <Subscriptions />
        <Footer />
      </>
    );
  }

  if (currentPage === 'referrals') {
    return (
      <>
        <Header 
          currentPage={currentPage} 
          navigateTo={navigateTo}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <Referrals />
        <Footer />
      </>
    );
  }

  if (currentPage === 'market') {
    return (
      <>
        <Header 
          currentPage={currentPage} 
          navigateTo={navigateTo}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <MarketStudy />
        <Footer />
      </>
    );
  }

  if (currentPage === 'map') {
    return <ComingSoonMap onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'settings') {
    return (
      <>
        <Header 
          currentPage={currentPage} 
          navigateTo={navigateTo}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <Settings />
        <Footer />
      </>
    );
  }

  if (currentPage === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />;
    }
    return <AdminDashboard />;
  }

  // الصفحة الرئيسية (التقييم)
  return (
    <div className="app-container min-h-screen">
      {/* الهيدر */}
      <Header 
        currentPage={currentPage} 
        navigateTo={navigateTo} 
        showSettings={showSettings} 
        setShowSettings={setShowSettings}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

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

            {/* رسالة ترحيب شخصية */}
            {currentUser && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg max-w-2xl mx-auto">
                <p className="text-sm text-blue-900">
                  <strong>مرحباً {currentUser.name}! 👋</strong> أنت الآن جاهز لاستخدام جميع ميزات مُثمّن
                </p>
              </div>
            )}

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
              
              <SmartEvaluationForm onSubmit={handleEvaluate} isLoading={isLoading} />
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
            </div>
          )}
        </div>
      </main>

      {/* الفوتر */}
      <Footer />
    </div>
  );
}

// مكون الهيدر
function Header({ currentPage, navigateTo, showSettings, setShowSettings, currentUser, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* الشعار */}
          <button 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                مُثمّن
              </h1>
              <p className="text-xs text-muted-foreground">تقييم عقاري ذكي</p>
            </div>
          </button>

          {/* القائمة */}
          <nav className="hidden md:flex items-center gap-2">
            <NavButton 
              icon={Home} 
              label="التقييم" 
              active={currentPage === 'home'}
              onClick={() => navigateTo('home')}
            />
            <NavButton 
              icon={Map} 
              label="الخريطة" 
              active={currentPage === 'map'}
              onClick={() => navigateTo('map')}
            />
            <NavButton 
              icon={BarChart3} 
              label="دراسة السوق" 
              active={currentPage === 'market'}
              onClick={() => navigateTo('market')}
            />
            <NavButton 
              icon={CreditCard} 
              label="الباقات" 
              active={currentPage === 'subscriptions'}
              onClick={() => navigateTo('subscriptions')}
            />
            <NavButton 
              icon={Users} 
              label="الإحالات" 
              active={currentPage === 'referrals'}
              onClick={() => navigateTo('referrals')}
            />
            
            {/* معلومات المستخدم */}
            {currentUser && (
              <div className="mr-4 flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-semibold">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.subscriptionType}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

// مكون زر التنقل
function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
        ${active 
          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// مكون لوحة الإعدادات
function SettingsPanel({ useGPT, setUseGPT, stats, onClearHistory }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">إعدادات التقييم</h3>
      </div>
      
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
        <div>
          <p className="font-semibold">استخدام GPT-4</p>
          <p className="text-sm text-muted-foreground">تحليل متقدم بالذكاء الاصطناعي</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useGPT}
            onChange={(e) => setUseGPT(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-sm text-muted-foreground">تقييم كلي</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-2xl font-bold text-green-600">{stats.today}</p>
          <p className="text-sm text-muted-foreground">اليوم</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{stats.thisWeek}</p>
          <p className="text-sm text-muted-foreground">هذا الأسبوع</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onClearHistory}
        className="w-full"
      >
        مسح السجل
      </Button>
    </div>
  );
}

// مكون الفوتر
function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* عن مُثمّن */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">مُثمّن</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              تقييم عقاري ذكي بالذكاء الاصطناعي للسوق السعودي
            </p>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">عن مُثمّن</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">كيف يعمل</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">اتصل بنا</a></li>
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>© 2025 مُثمّن. جميع الحقوق محفوظة.</p>
          <p className="mt-2">
            <strong>🇸🇦 مشروع وطني</strong> للمشاركة في هاكاثون روشن 2025
          </p>
        </div>
      </div>
    </footer>
  );
}

export default App;

