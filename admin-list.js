exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, message: "Method Not Allowed" });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {}

  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    return jsonResponse(401, { ok: false, message: "رمز مدیریت اشتباه است." });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return jsonResponse(400, {
      ok: false,
      message: "برای پنل مدیریت باید Supabase را در Environment Variables فعال کنید."
    });
  }

  const endpoint = `${url}/rest/v1/applicants?select=registrationCode,fullName,phone,city,position,paymentStatus,createdAt&order=createdAt.desc&limit=200`;

  const res = await fetch(endpoint, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });

  if (!res.ok) {
    return jsonResponse(500, { ok: false, message: "خطا در اتصال به دیتابیس." });
  }

  const items = await res.json();

  return jsonResponse(200, { ok: true, items });
};

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
