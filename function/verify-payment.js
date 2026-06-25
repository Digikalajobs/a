exports.handler = async function(event) {
  // این فایل قالب اتصال پرداخت است.
  // درگاه واقعی مثل زرین‌پال/نکست‌پی/IDPay باید طبق مستندات خودش اینجا متصل شود.

  const params = event.queryStringParameters || {};
  const authority = params.Authority || params.authority || "";
  const status = params.Status || params.status || "";

  if (!authority || status.toLowerCase() !== "ok") {
    return redirect("/success.html?code=PAYMENT-FAILED");
  }

  // TODO:
  // 1) ارسال درخواست Verify به API درگاه پرداخت
  // 2) بررسی amount/refId
  // 3) آپدیت رکورد Supabase
  // 4) ارسال پیام پرداخت موفق به تلگرام
  // 5) هدایت کاربر به success.html?code=...

  return redirect("/success.html?code=PAYMENT-VERIFIED");
};

function redirect(location) {
  return {
    statusCode: 302,
    headers: { Location: location },
    body: ""
  };
}
