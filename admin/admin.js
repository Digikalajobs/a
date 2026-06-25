const btn = document.getElementById("loadBtn");
const pass = document.getElementById("password");
const rows = document.getElementById("rows");
const statusBox = document.getElementById("adminStatus");

function status(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

btn.addEventListener("click", async () => {
  status("در حال دریافت اطلاعات...");
  rows.innerHTML = "";

  try {
    const res = await fetch("/.netlify/functions/admin-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass.value })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.message || "خطا در دریافت اطلاعات");

    if (!data.items.length) {
      rows.innerHTML = `<tr><td colspan="7">هنوز ثبت‌نامی وجود ندارد.</td></tr>`;
      status("لیست خالی است.", "ok");
      return;
    }

    rows.innerHTML = data.items.map(item => `
      <tr>
        <td>${escapeHtml(item.registrationCode || "-")}</td>
        <td>${escapeHtml(item.fullName || "-")}</td>
        <td>${escapeHtml(item.phone || "-")}</td>
        <td>${escapeHtml(item.city || "-")}</td>
        <td>${escapeHtml(item.position || "-")}</td>
        <td>${escapeHtml(item.paymentStatus || "-")}</td>
        <td>${escapeHtml(item.createdAt || "-")}</td>
      </tr>
    `).join("");

    status("اطلاعات با موفقیت بارگذاری شد.", "ok");
  } catch (err) {
    status(err.message, "error");
    rows.innerHTML = `<tr><td colspan="7">خطا در دریافت اطلاعات.</td></tr>`;
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[ch]));
}
