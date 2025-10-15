import { useEffect } from 'react';

/**
 * Hook لالتقاط رمز الإحالة من URL وحفظه محلياً
 * 
 * يعمل على:
 * 1. قراءة معامل ?ref= من URL
 * 2. حفظه في localStorage و cookie
 * 3. إنشاء معرّف زائر فريد (visitor ID)
 * 4. إرسال حدث التتبع (اختياري - stub الآن)
 */
export default function useRefCapture() {
  useEffect(() => {
    try {
      // قراءة معامل ref من URL
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      
      if (ref && ref.length >= 6 && ref.length <= 8) {
        // التحقق من صحة الكود (حروف وأرقام فقط)
        if (!/^[A-Z0-9]+$/.test(ref)) {
          console.warn('رمز إحالة غير صالح:', ref);
          return;
        }

        // حفظ في localStorage
        localStorage.setItem('muth_ref', ref);
        localStorage.setItem('muth_ref_timestamp', Date.now().toString());
        
        // حفظ في cookie (صالح لمدة 14 يوم)
        const maxAge = 60 * 60 * 24 * 14; // 14 يوم بالثواني
        document.cookie = `muth_ref=${ref};path=/;max-age=${maxAge};SameSite=Lax`;
        
        // إنشاء أو استرجاع معرّف الزائر
        let visitorId = localStorage.getItem('muth_vid');
        if (!visitorId) {
          // إنشاء معرّف فريد للزائر
          visitorId = generateVisitorId();
          localStorage.setItem('muth_vid', visitorId);
        }
        
        // تسجيل الحدث محلياً
        logReferralEvent({
          type: 'click',
          ref,
          visitorId,
          timestamp: Date.now(),
          url: window.location.href
        });
        
        // إرسال حدث التتبع (stub - سيتم تفعيله لاحقاً)
        trackReferralClick(ref, visitorId).catch(err => {
          console.log('تتبع الإحالة (محلي فقط):', err.message);
        });
        
        console.log('✅ تم حفظ رمز الإحالة:', ref);
      }
    } catch (error) {
      console.error('خطأ في معالجة رمز الإحالة:', error);
    }
  }, []);
}

/**
 * توليد معرّف فريد للزائر
 */
function generateVisitorId() {
  // استخدام crypto.randomUUID إن كان متاحاً
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // بديل بسيط
  return 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * تسجيل حدث الإحالة محلياً
 */
function logReferralEvent(event) {
  try {
    const events = JSON.parse(localStorage.getItem('muth_ref_events') || '[]');
    events.push(event);
    
    // الاحتفاظ بآخر 100 حدث فقط
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('muth_ref_events', JSON.stringify(events));
  } catch (error) {
    console.error('خطأ في تسجيل حدث الإحالة:', error);
  }
}

/**
 * إرسال حدث التتبع إلى الخادم (stub)
 * سيتم تفعيله لاحقاً عند ربط الباك-إند
 */
async function trackReferralClick(ref, visitorId) {
  // Stub - لا يرسل فعلياً الآن
  // في المستقبل سيرسل إلى /api/ref/track
  
  const endpoint = '/api/ref/track';
  const params = new URLSearchParams({
    ref,
    vid: visitorId,
    ts: Date.now().toString()
  });
  
  // محاكاة الإرسال (لا يتم فعلياً)
  return new Promise((resolve, reject) => {
    // reject(new Error('API غير متصل (محلي فقط)'));
    // في الإنتاج:
    // return fetch(`${endpoint}?${params}`);
    resolve({ ok: true, stub: true });
  });
}

/**
 * استرجاع رمز الإحالة المحفوظ
 */
export function getSavedReferralCode() {
  return localStorage.getItem('muth_ref') || null;
}

/**
 * مسح رمز الإحالة المحفوظ
 */
export function clearReferralCode() {
  localStorage.removeItem('muth_ref');
  localStorage.removeItem('muth_ref_timestamp');
  document.cookie = 'muth_ref=;path=/;max-age=0';
}

/**
 * الحصول على إحصائيات الإحالات المحلية
 */
export function getReferralStats() {
  try {
    const events = JSON.parse(localStorage.getItem('muth_ref_events') || '[]');
    const clicks = events.filter(e => e.type === 'click').length;
    const signups = events.filter(e => e.type === 'signup').length;
    
    return {
      clicks,
      signups,
      events: events.length
    };
  } catch {
    return { clicks: 0, signups: 0, events: 0 };
  }
}

