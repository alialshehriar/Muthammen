import { Badge } from '@/components/ui/badge.jsx';
import { Card } from '@/components/ui/card.jsx';
import { AlertCircle, Calendar, Database } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function DataFreshness({ data }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-blue-100">
          <Database className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-bold text-lg">حالة البيانات</h3>
            <Badge className="bg-blue-600">نسخة تجريبية</Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-muted-foreground">آخر تحديث:</span>
              <span className="font-semibold">{formatDate(data.updated_at)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-muted-foreground">الفترة:</span>
              <span className="font-semibold">{data.period}</span>
            </div>
          </div>
          
          <div className="p-4 bg-white/80 rounded-lg border border-blue-200">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">ملاحظة:</strong> {data.note}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              البيانات الحالية محلية ومُعدّة للعرض التوضيحي. في النسخة النهائية، سيتم تحديث البيانات تلقائياً من مصادر رسمية معتمدة.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

