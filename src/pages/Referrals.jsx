import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { 
  Copy, Share2, Users, Gift, CheckCircle2, Sparkles, 
  TrendingUp, Award, Crown, ExternalLink
} from 'lucide-react';

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('mothammen_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Generate referral link
      const link = `${window.location.origin}/register?ref=${parsedUser.referralCode}`;
      setReferralLink(link);
    }
  }, []);

  const copyCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: 'مُثمّن - تقييم عقاري ذكي',
          text: 'سجل في مُثمّن واحصل على شهر مجاني! استخدم كود الإحالة الخاص بي',
          url: referralLink
        });
      } catch (err) {
        console.log('خطأ في المشاركة:', err);
      }
    } else {
      copyLink();
    }
  };

  // If user is not registered
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                برنامج الإحالات
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                سجل الآن واحصل على كود إحالة خاص بك
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800">كيف يعمل برنامج الإحالات؟</h3>
              <div className="space-y-4 text-right">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">سجل مجاناً</h4>
                    <p className="text-sm text-gray-600">احصل على شهر مجاني + كود إحالة خاص بك</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">شارك كودك</h4>
                    <p className="text-sm text-gray-600">أرسل كود الإحالة لأصدقائك وعائلتك</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">اربح أيام برو</h4>
                    <p className="text-sm text-gray-600">كل صديق يسجل = يومين اشتراك مجاني في باقة البرو! 🚀</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border-2 border-green-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Gift className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">المكافآت</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-600 mb-2">يومين برو</div>
                <p className="text-gray-700">لكل صديق يسجل عن طريق كودك</p>
              </div>
            </div>

            <Button
              onClick={() => window.location.href = '/register'}
              size="lg"
              className="w-full gap-2 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              سجل الآن واحصل على كود الإحالة
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Gift className="w-4 h-4" />
            <span>برنامج الإحالات</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-balance">
            كود الإحالة الخاص بك
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            شارك كودك مع أصدقائك واربح أيام برو مجانية
          </p>
        </div>

        {/* Referral Code Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">كود الإحالة الخاص بك</h2>
            <p className="text-muted-foreground">
              شارك هذا الكود مع أصدقائك للحصول على مكافآت
            </p>
          </div>

          {/* Referral Code Display */}
          <div className="bg-white p-6 rounded-xl mb-6 border-2 border-purple-300 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">كود الإحالة</div>
              <div className="text-5xl font-black text-purple-600 mb-4 tracking-wider">
                {user.referralCode}
              </div>
              <Button
                onClick={copyCode}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    تم النسخ!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    انسخ الكود
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-white p-6 rounded-xl border-2 border-blue-300 shadow-lg">
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">رابط الإحالة</div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 break-all">
                {referralLink}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={copyLink}
                variant="outline"
                className="flex-1 gap-2"
              >
                {linkCopied ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    تم النسخ!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    انسخ الرابط
                  </>
                )}
              </Button>
              <Button
                onClick={shareLink}
                className="flex-1 gap-2"
              >
                <Share2 className="w-5 h-5" />
                شارك الرابط
              </Button>
            </div>
          </div>
        </Card>

        {/* Rewards Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">يومين</div>
            <div className="text-sm text-gray-600">اشتراك برو لكل إحالة</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">غير محدود</div>
            <div className="text-sm text-gray-600">عدد الإحالات</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">برو</div>
            <div className="text-sm text-gray-600">ترقية تلقائية</div>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">كيف يعمل البرنامج؟</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-lg mb-2">شارك كودك</h4>
              <p className="text-sm text-muted-foreground">
                أرسل كود الإحالة أو الرابط لأصدقائك
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-lg mb-2">صديقك يسجل</h4>
              <p className="text-sm text-muted-foreground">
                يستخدم كودك عند التسجيل ويحصل على شهر مجاني
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-lg mb-2">تحصل على مكافأة</h4>
              <p className="text-sm text-muted-foreground">
                يومين اشتراك برو تضاف لحسابك تلقائياً
              </p>
            </div>
          </div>
        </Card>

        {/* Pro Benefits */}
        <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-3">
              <Crown className="w-4 h-4" />
              <span>مميزات باقة البرو</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              ماذا ستحصل مع أيام البرو؟
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">تحليل متقدم للأحياء</h4>
                <p className="text-sm text-gray-600">تفاصيل كاملة عن كل حي ومنطقة</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">خرائط حرارية للأسعار</h4>
                <p className="text-sm text-gray-600">تصور بصري لتوزيع الأسعار</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">توقعات مستقبلية</h4>
                <p className="text-sm text-gray-600">تنبؤات بحركة الأسعار</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">تقارير مفصلة PDF</h4>
                <p className="text-sm text-gray-600">تقارير احترافية قابلة للطباعة</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">مقارنات متعددة</h4>
                <p className="text-sm text-gray-600">قارن عدة عقارات في نفس الوقت</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">دعم أولوية</h4>
                <p className="text-sm text-gray-600">استجابة سريعة لاستفساراتك</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Share Buttons */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">شارك الآن وابدأ بجمع أيام البرو المجانية!</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`سجل في مُثمّن واحصل على شهر مجاني! استخدم كود الإحالة: ${user.referralCode}\n${referralLink}`)}`, '_blank')}
              variant="outline"
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              شارك عبر واتساب
            </Button>
            <Button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`سجل في مُثمّن واحصل على شهر مجاني! استخدم كود الإحالة: ${user.referralCode}`)}&url=${encodeURIComponent(referralLink)}`, '_blank')}
              variant="outline"
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              شارك عبر تويتر
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

