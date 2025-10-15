import { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { MapPin, TrendingUp, Info } from 'lucide-react';
import { 
  formatPricePerM2, 
  formatRentPerM2,
  formatPercentage,
  formatDays,
  formatConfidence,
  formatPriceRange,
  formatTransactions,
  getColorByValue
} from '../utils/formatters';

export default function CitySnapshot({ cities }) {
  const [selectedCity, setSelectedCity] = useState(null);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => (
          <Card 
            key={city.id} 
            className="p-6 hover-lift cursor-pointer"
            onClick={() => setSelectedCity(city)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">{city.name}</h3>
              </div>
              <Badge variant="secondary">
                {formatConfidence(city.confidence)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">سعر البيع</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold">{formatPricePerM2(city.sale_price_per_m2)}</p>
                  <span className={`text-sm ${getColorByValue(city.sale_yoy, 'change')}`}>
                    {formatPercentage(city.sale_yoy)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">سعر الإيجار</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold">{formatRentPerM2(city.rent_price_per_m2_month)}</p>
                  <span className={`text-sm ${getColorByValue(city.rent_yoy, 'change')}`}>
                    {formatPercentage(city.rent_yoy)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">المعاملات</span>
                  <span className="font-semibold">{formatTransactions(city.transactions)}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4 gap-2"
            >
              <Info className="w-4 h-4" />
              عرض التفاصيل
            </Button>
          </Card>
        ))}
      </div>

      {/* نافذة التفاصيل */}
      {selectedCity && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCity(null)}
        >
          <Card 
            className="max-w-2xl w-full p-8 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black mb-2">{selectedCity.name}</h2>
                <p className="text-muted-foreground">{selectedCity.note}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedCity(null)}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  أسعار البيع
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المتوسط</span>
                    <span className="font-semibold">{formatPricePerM2(selectedCity.sale_price_per_m2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النطاق (P25-P75)</span>
                    <span className="font-semibold text-xs">
                      {formatPriceRange(selectedCity.sale_p25, selectedCity.sale_p75)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النمو السنوي</span>
                    <span className={`font-semibold ${getColorByValue(selectedCity.sale_yoy, 'change')}`}>
                      {formatPercentage(selectedCity.sale_yoy)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  أسعار الإيجار
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المتوسط</span>
                    <span className="font-semibold">{formatRentPerM2(selectedCity.rent_price_per_m2_month)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النطاق (P25-P75)</span>
                    <span className="font-semibold text-xs">
                      {formatNumber(selectedCity.rent_p25)} - {formatNumber(selectedCity.rent_p75)} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النمو السنوي</span>
                    <span className={`font-semibold ${getColorByValue(selectedCity.rent_yoy, 'change')}`}>
                      {formatPercentage(selectedCity.rent_yoy)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">متوسط زمن البيع</p>
                <p className="text-lg font-bold">{formatDays(selectedCity.avg_days_to_sell)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">عدد المعاملات</p>
                <p className="text-lg font-bold">{formatTransactions(selectedCity.transactions)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">مستوى الثقة</p>
                <p className="text-lg font-bold">{formatConfidence(selectedCity.confidence)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// دالة مساعدة (تم نسيانها في formatters.js)
function formatNumber(num) {
  return new Intl.NumberFormat('ar-SA').format(num);
}

