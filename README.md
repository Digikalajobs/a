# نسخه حرفه‌ای فرم استخدام

این پروژه شامل این بخش‌هاست:

- فرم چندمرحله‌ای حرفه‌ای
- اعتبارسنجی شماره موبایل
- تولید کد رهگیری
- صفحه موفقیت با QR نمایشی
- ارسال اطلاعات به ربات تلگرام
- ذخیره اختیاری اطلاعات در Supabase
- پنل مدیریت `/admin`
- قالب آماده اتصال پرداخت
- تنظیمات آماده Netlify

## اجرای سریع روی Netlify

1. فایل ZIP را Extract کنید.
2. فایل‌ها را داخل یک GitHub Repository قرار دهید.
3. در Netlify:
   - Add new project
   - Import from Git
   - Repository را انتخاب کنید
4. تنظیمات:
   - Build command: خالی
   - Publish directory: `.`
   - Functions directory: `functions`
5. Environment Variables را اضافه کنید:

```env
TELEGRAM_BOT_TOKEN=توکن جدید
TELEGRAM_CHAT_ID=آیدی چت
APP_DOWNLOAD_LINK=لینک دانلود اپ
```

## فعال‌سازی دیتابیس و پنل مدیریت

1. در Supabase یک پروژه بسازید.
2. فایل `docs/supabase-schema.sql` را در SQL Editor اجرا کنید.
3. این متغیرها را به Netlify اضافه کنید:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=یک رمز قوی
```

4. مسیر پنل:
`https://YOUR_SITE.netlify.app/admin/`

## امنیت

توکن تلگرام و کلید Supabase را داخل HTML یا JS عمومی قرار ندهید.
فقط داخل Environment Variables بگذارید.

اگر توکن ربات را جایی منتشر کرده‌اید، آن را از BotFather لغو و دوباره بسازید.

## پرداخت

قالب پرداخت در فایل زیر آماده شده:
`functions/verify-payment.js`

جزئیات بیشتر:
`docs/payment-integration.md`
