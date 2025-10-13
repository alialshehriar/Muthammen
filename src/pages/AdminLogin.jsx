/**
 * ═══════════════════════════════════════════════════════════════════════════
 * صفحة تسجيل دخول الأدمن - Admin Login Page
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function AdminLogin({ onLoginSuccess }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify the API key by making a test request
      const response = await fetch('/api/admin/stats', {
        headers: {
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        // Store the API key in localStorage
        localStorage.setItem('adminApiKey', apiKey);
        onLoginSuccess();
      } else {
        setError('مفتاح API غير صحيح');
      }
    } catch (err) {
      setError('حدث خطأ أثناء التحقق');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            لوحة الإدارة
          </h1>
          <p className="text-gray-600">
            أدخل مفتاح API للوصول إلى لوحة التحكم
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مفتاح API
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل مفتاح API"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 text-center">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !apiKey}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900 text-center">
            <strong>ملاحظة:</strong> مفتاح API موجود في متغيرات البيئة (ADMIN_API_KEY)
          </p>
        </div>
      </Card>
    </div>
  );
}

