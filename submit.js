exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, message: "Method Not Allowed" });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { ok: false, message: "فرمت اطلاعات نامعتبر است." });
  }

  const validation = validateApplicant(data);
  if (!validation.ok) {
    return jsonResponse(400, validation);
  }

  const registrationCode = generateRegistrationCode();

  // پرداخت:
  // نسخه فعلی «ثبت اولیه» است.
  // برای پرداخت واقعی، فایل docs/payment-integration.md را ببینید.
  const paymentStatus = process.env.PAYMENT_REQUIRED === "true" ? "pending_payment" : "registered";

  const applicant = {
    registrationCode,
    fullName: clean(data.fullName),
    phone: clean(data.phone),
    city: clean(data.city),
    age: clean(data.age),
    position: clean(data.position),
    experience: clean(data.experience),
    workType: clean(data.workType),
    callTime: clean(data.callTime || "-"),
    message: clean(data.message || "-"),
    paymentStatus,
    createdAt: new Date().toISOString()
  };

  await saveToSupabase(applicant);
  await sendToTelegram(buildTelegramMessage(applicant));

  return jsonResponse(200, {
    ok: true,
    registrationCode,
    paymentStatus,
    downloadLink: process.env.APP_DOWNLOAD_LINK || ""
  });
};

function validateApplicant(data) {
  const required = ["fullName", "phone", "city", "age", "position", "experience", "workType"];
  for (const field of required) {
    if (!data[field] || String(data[field]).trim() === "") {
      return { ok: false, message: "لطفاً همه فیلدهای ضروری را کامل کنید." };
    }
  }

  if (!/^09\d{9}$/.test(String(data.phone).trim())) {
    return { ok: false, message: "شماره تماس باید با 09 شروع شود و ۱۱ رقم باشد." };
  }

  const age = Number(data.age);
  if (!Number.isFinite(age) || age < 16 || age > 65) {
    return { ok: false, message: "سن واردشده معتبر نیست." };
  }

  return { ok: true };
}

function generateRegistrationCode() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DG-${y}${m}${day}-${random}`;
}

function buildTelegramMessage(a) {
  return [
    "🚀 ثبت‌نام جدید همکاری",
    "",
    `کد رهگیری: ${a.registrationCode}`,
    `نام: ${a.fullName}`,
    `شماره تماس: ${a.phone}`,
    `شهر: ${a.city}`,
    `سن: ${a.age}`,
    `موقعیت: ${a.position}`,
    `تجربه: ${a.experience}`,
    `نوع همکاری: ${a.workType}`,
    `زمان تماس: ${a.callTime}`,
    `توضیحات: ${a.message}`,
    `وضعیت پرداخت/ثبت: ${a.paymentStatus}`,
    `زمان ثبت: ${a.createdAt}`
  ].join("\n");
}

async function sendToTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram env vars missing; skipped.");
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!res.ok) {
    console.error("Telegram send failed:", await res.text());
  }
}

async function saveToSupabase(applicant) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn("Supabase env vars missing; skipped database save.");
    return;
  }

  const endpoint = `${url}/rest/v1/applicants`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(applicant)
  });

  if (!res.ok) {
    console.error("Supabase save failed:", await res.text());
  }
}

function clean(value) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, 1500);
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(payload)
  };
}
