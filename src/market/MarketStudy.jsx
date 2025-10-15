import { BarChart3, Sparkles } from 'lucide-react';
import KPICards from './components/KPICards';
import CitySnapshot from './components/CitySnapshot';
import RentVsSaleChart from './components/RentVsSaleChart';
import DataFreshness from './components/DataFreshness';
import Methodology from './components/Methodology';
import { getNationalMarketData, getCitiesData, getRentSaleTimeSeries } from './utils/selectors';

export default function MarketStudy() {
  const marketData = getNationalMarketData();
  const citiesData = getCitiesData();
  const timeSeriesData = getRentSaleTimeSeries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* الهيدر */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <BarChart3 className="w-4 h-4" />
            <span>دراسة السوق العقاري السعودي</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-balance">
            السوق العقاري السعودي
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            تحليل شامل ومؤشرات دقيقة لسوق العقارات في المملكة
          </p>
        </div>

        {/* نضارة البيانات */}
        <div className="mb-8">
          <DataFreshness data={marketData} />
        </div>

        {/* المؤشرات الرئيسية */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">المؤشرات الرئيسية</h2>
          <KPICards data={marketData} />
        </div>

        {/* الرسم البياني */}
        <div className="mb-12">
          <RentVsSaleChart data={timeSeriesData} />
        </div>

        {/* لقطات المدن */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">المدن الرئيسية</h2>
            <div className="text-sm text-muted-foreground">
              اضغط على أي مدينة لعرض التفاصيل
            </div>
          </div>
          <CitySnapshot cities={citiesData} />
        </div>

        {/* الرؤى والتوصيات */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-lg">رؤى السوق</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {marketData.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">الاتجاهات</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">اتجاه البيع</span>
                <span className="font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  {marketData.trends.sale_trend}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">اتجاه الإيجار</span>
                <span className="font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {marketData.trends.rent_trend}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">مستوى الطلب</span>
                <span className="font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                  {marketData.trends.demand_level}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">مستوى العرض</span>
                <span className="font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {marketData.trends.supply_level}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* المنهجية */}
        <div className="mb-12">
          <Methodology />
        </div>

        {/* تنبيه المزايا القادمة */}
        <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 text-center">
          <h3 className="text-2xl font-bold mb-3">قريباً في خطة Smart Plan</h3>
          <p className="text-muted-foreground mb-4">
            🔓 تحليل الحي الكامل، وأفضل مناطق السكن، والتكتلات السعريّة
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-white rounded-full font-semibold">خريطة تفاعلية</span>
            <span className="px-4 py-2 bg-white rounded-full font-semibold">مقارنات الأحياء</span>
            <span className="px-4 py-2 bg-white rounded-full font-semibold">توقعات الأسعار</span>
            <span className="px-4 py-2 bg-white rounded-full font-semibold">تقارير مفصّلة</span>
          </div>
        </div>
      </div>
    </div>
  );
}

