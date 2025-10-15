import { Card } from '@/components/ui/card.jsx';
import { TrendingUp, TrendingDown, Home, Building2, Clock, Target } from 'lucide-react';
import { 
  formatPricePerM2, 
  formatRentPerM2, 
  formatPercentage,
  formatDays,
  formatConfidence,
  getColorByValue
} from '../utils/formatters';

export default function KPICards({ data }) {
  const kpis = [
    {
      id: 'sale',
      title: 'سعر البيع',
      value: formatPricePerM2(data.national.sale_price_per_m2),
      change: data.national.sale_yoy,
      icon: Building2,
      color: 'blue'
    },
    {
      id: 'rent',
      title: 'سعر الإيجار',
      value: formatRentPerM2(data.national.rent_price_per_m2_month),
      change: data.national.rent_yoy,
      icon: Home,
      color: 'green'
    },
    {
      id: 'sale_growth',
      title: 'نمو البيع السنوي',
      value: formatPercentage(data.national.sale_yoy),
      change: data.national.sale_yoy,
      icon: data.national.sale_yoy > 0 ? TrendingUp : TrendingDown,
      color: data.national.sale_yoy > 0 ? 'green' : 'red'
    },
    {
      id: 'rent_growth',
      title: 'نمو الإيجار السنوي',
      value: formatPercentage(data.national.rent_yoy),
      change: data.national.rent_yoy,
      icon: data.national.rent_yoy > 0 ? TrendingUp : TrendingDown,
      color: data.national.rent_yoy > 0 ? 'green' : 'amber'
    },
    {
      id: 'days_to_sell',
      title: 'متوسط زمن البيع',
      value: formatDays(data.national.avg_days_to_sell),
      icon: Clock,
      color: 'purple'
    },
    {
      id: 'confidence',
      title: 'مستوى الثقة الوطني',
      value: formatConfidence(data.national.national_confidence),
      icon: Target,
      color: 'amber'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      amber: 'bg-amber-100 text-amber-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const colorClasses = getColorClasses(kpi.color);
        
        return (
          <Card key={kpi.id} className="p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${colorClasses}`}>
                <Icon className="w-6 h-6" />
              </div>
              
              {kpi.change !== undefined && (
                <div className={`text-sm font-semibold ${getColorByValue(kpi.change, 'change')}`}>
                  {kpi.change > 0 ? '↗' : kpi.change < 0 ? '↘' : '→'}
                  {' '}
                  {formatPercentage(Math.abs(kpi.change))}
                </div>
              )}
            </div>
            
            <h3 className="text-sm text-muted-foreground mb-2">{kpi.title}</h3>
            <p className="text-2xl font-black">{kpi.value}</p>
          </Card>
        );
      })}
    </div>
  );
}

