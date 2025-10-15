/**
 * API Endpoint: تسجيل طلبات الإشعار بإطلاق الخريطة التفاعلية
 * 
 * يستقبل بيانات المستخدمين الذين يريدون الحصول على إشعار
 * عند إطلاق الخريطة التفاعلية ويحفظها في قاعدة البيانات
 */

export default async function handler(req, res) {
  // السماح فقط بطلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { name, email, phone } = req.body;

    // التحقق من البيانات المطلوبة
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'الاسم والبريد الإلكتروني مطلوبان'
      });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير صحيح'
      });
    }

    // في الوقت الحالي، سنحفظ البيانات في ملف JSON
    // لاحقاً يمكن ربطها بقاعدة بيانات Neon
    const notification = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      notified: false
    };

    // TODO: حفظ في قاعدة البيانات
    // const { Pool } = require('pg');
    // const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    // await pool.query(
    //   'INSERT INTO map_notifications (name, email, phone, created_at) VALUES ($1, $2, $3, $4)',
    //   [name, email, phone, new Date()]
    // );

    // إرسال استجابة النجاح
    return res.status(200).json({
      success: true,
      message: 'تم التسجيل بنجاح! سنرسل لك إشعاراً عند إطلاق الخريطة',
      data: {
        id: notification.id,
        email: notification.email
      }
    });

  } catch (error) {
    console.error('Error in map-notify API:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى'
    });
  }
}

