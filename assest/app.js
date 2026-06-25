const form = document.getElementById("recruitmentForm");
const formSteps = [...document.querySelectorAll(".form-step")];
const stepButtons = [...document.querySelectorAll(".step")];
const progressBar = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const statusBox = document.getElementById("status");

let currentStep = 1;

function setStatus(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

function updateUI() {
  formSteps.forEach(step => {
    step.classList.toggle("active", Number(step.dataset.step) === currentStep);
  });

  stepButtons.forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.step) <= currentStep);
  });

  progressBar.style.width = `${(currentStep / 3) * 100}%`;
  prevBtn.style.visibility = currentStep === 1 ? "hidden" : "visible";
  nextBtn.classList.toggle("hidden", currentStep === 3);
  submitBtn.classList.toggle("hidden", currentStep !== 3);
  setStatus("");
}

function validateStep(stepNumber) {
  const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
  const fields = [...step.querySelectorAll("input, select, textarea")];

  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  return true;
}

prevBtn.addEventListener("click", () => {
  currentStep = Math.max(1, currentStep - 1);
  updateUI();
});

nextBtn.addEventListener("click", () => {
  if (!validateStep(currentStep)) return;
  currentStep = Math.min(3, currentStep + 1);
  updateUI();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateStep(3)) return;

  setStatus("در حال ثبت اطلاعات و ساخت کد رهگیری...", "");
  submitBtn.disabled = true;

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "ثبت اطلاعات ناموفق بود.");
    }

    localStorage.setItem("registrationCode", result.registrationCode);
    if (result.downloadLink) {
      localStorage.setItem("downloadLink", result.downloadLink);
    }

    const params = new URLSearchParams({
      code: result.registrationCode,
      download: result.downloadLink || "#"
    });

    setStatus("ثبت شد. در حال انتقال...", "ok");
    location.href = `./success.html?${params.toString()}`;
  } catch (error) {
    setStatus(error.message || "خطا در ارتباط با سرور.", "error");
    submitBtn.disabled = false;
  }
});

updateUI();
