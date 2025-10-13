import { Card } from '@/components/ui/card.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RentVsSaleChart({ data }) {
  // تحويل البيانات للرسم البياني
  const chartData = data.map(item => ({
    month: item.month_ar,
    'البيع (ر.س/م²)': item.sale_price_per_m2,
    'الإيجار (ر.س/م²/شهر)': item.rent_price_per_m2_month
  }));

  // مكون Tooltip مخصص
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {new Intl.NumberFormat('ar-SA').format(entry.value)}
            </p>
          ))}
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">اتجاهات الأسعار</h2>
        <p className="text-muted-foreground">تطور أسعار البيع والإيجار خلال آخر 12 شهر</p>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.01 220)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'oklch(0.50 0.01 240)', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: 'oklch(0.50 0.01 240)', fontSize: 12 }}
              label={{ value: 'سعر البيع (ر.س/م²)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'oklch(0.50 0.01 240)', fontSize: 12 }}
              label={{ value: 'سعر الإيجار (ر.س/م²/شهر)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="البيع (ر.س/م²)" 
              stroke="oklch(0.45 0.15 240)" 
              strokeWidth={3}
              dot={{ fill: 'oklch(0.45 0.15 240)', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="الإيجار (ر.س/م²/شهر)" 
              stroke="oklch(0.60 0.15 180)" 
              strokeWidth={3}
              dot={{ fill: 'oklch(0.60 0.15 180)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="font-semibold">البيع</span>
          </div>
          <p className="text-xs text-muted-foreground">
            نمو مستمر بنسبة 6٪ سنوياً
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="font-semibold">الإيجار</span>
          </div>
          <p className="text-xs text-muted-foreground">
            استقرار نسبي مع نمو 4٪ سنوياً
          </p>
        </div>
      </div>
    </Card>
  );
}

