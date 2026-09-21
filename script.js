/* ==========================================================
   Coding Conf – Ticket Generator
   ========================================================== */

const MAX_SIZE = 500 * 1024;               // 500KB
const ALLOWED  = ["image/jpeg", "image/png"];
const DEFAULT_HINT = "Upload your photo (JPG or PNG, max size: 500KB).";

const $ = (id) => document.getElementById(id);

const form      = $("ticket-form");
const dropzone  = $("dropzone");
const fileInput = $("avatar-input");
const dzPreview = $("dz-preview");
const dzIcon    = dropzone.querySelector(".area-upload__icone");
const dzText    = $("dz-text");
const dzActions = $("dz-actions");
const avatarHint = $("avatar-hint");
const avatarHintText = avatarHint.querySelector("span");

let avatarFile = null;
let avatarURL  = null;

/* ---------- Avatar ---------- */
function setAvatarError(message) {
  const field = dropzone.closest(".campo");
  field.classList.toggle("com-erro", Boolean(message));
  avatarHintText.textContent = message || DEFAULT_HINT;
}

function setAvatar(file) {
  if (!file) return;

  if (!ALLOWED.includes(file.type)) {
    setAvatarError("Invalid file type. Please upload a JPG or PNG photo.");
    return;
  }
  if (file.size > MAX_SIZE) {
    setAvatarError("File too large. Please upload a photo under 500KB.");
    return;
  }

  if (avatarURL) URL.revokeObjectURL(avatarURL);
  avatarFile = file;
  avatarURL  = URL.createObjectURL(file);

  dzPreview.src = avatarURL;
  dzPreview.hidden = false;
  dzIcon.style.display = "none";
  dzText.hidden = true;
  dzActions.hidden = false;
  dropzone.classList.add("tem-arquivo");
  setAvatarError("");
}

function removeAvatar() {
  if (avatarURL) URL.revokeObjectURL(avatarURL);
  avatarFile = null;
  avatarURL  = null;
  fileInput.value = "";

  dzPreview.hidden = true;
  dzPreview.removeAttribute("src");
  dzIcon.style.display = "";
  dzText.hidden = false;
  dzActions.hidden = true;
  dropzone.classList.remove("tem-arquivo");
  setAvatarError("");
}

dropzone.addEventListener("click", (e) => {
  if (dropzone.classList.contains("tem-arquivo")) return;   // buttons handle it
  if (e.target.closest("button")) return;
  fileInput.click();
});
dropzone.addEventListener("keydown", (e) => {
  if (e.target !== dropzone) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});
fileInput.addEventListener("change", () => {
  setAvatar(fileInput.files[0]);
  if (!avatarFile) fileInput.value = "";
});

["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("arrastando");
  })
);
["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("arrastando");
  })
);
dropzone.addEventListener("drop", (e) => setAvatar(e.dataTransfer.files[0]));

$("btn-remove").addEventListener("click", (e) => { e.stopPropagation(); removeAvatar(); });
$("btn-change").addEventListener("click", (e) => { e.stopPropagation(); fileInput.click(); });

/* ---------- Field validation ---------- */
const rules = {
  name: {
    el: $("name"),
    test: (v) => v.trim().length >= 2,
    message: "Please enter your full name."
  },
  email: {
    el: $("email"),
    test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    message: "Please enter a valid email address."
  },
  github: {
    el: $("github"),
    test: (v) => /^@?[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(v.trim()),
    message: "Please enter a valid GitHub username."
  }
};

function setFieldError(key, message) {
  const { el } = rules[key];
  const field = el.closest(".campo");
  const hint  = $(`${key}-error`);
  field.classList.toggle("com-erro", Boolean(message));
  hint.hidden = !message;
  hint.querySelector("span").textContent = message || "";
  el.setAttribute("aria-invalid", message ? "true" : "false");
}

Object.entries(rules).forEach(([key, { el, test, message }]) => {
  el.addEventListener("input", () => {
    if (el.closest(".campo").classList.contains("com-erro") && test(el.value)) {
      setFieldError(key, "");
    }
  });
  el.addEventListener("blur", () => {
    if (el.value.trim() && !test(el.value)) setFieldError(key, message);
  });
});

/* ---------- Submit ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  let firstInvalid = null;

  if (!avatarFile) {
    setAvatarError("Please upload an avatar (JPG or PNG, under 500KB).");
    firstInvalid = dropzone;
  }

  Object.entries(rules).forEach(([key, { el, test, message }]) => {
    const ok = test(el.value);
    setFieldError(key, ok ? "" : message);
    if (!ok && !firstInvalid) firstInvalid = el;
  });

  if (firstInvalid) { firstInvalid.focus(); return; }

  showTicket({
    name:   rules.name.el.value.trim(),
    email:  rules.email.el.value.trim(),
    github: "@" + rules.github.el.value.trim().replace(/^@/, "")
  });
});

/* ---------- Ticket ---------- */
function showTicket({ name, email, github }) {
  $("t-name-heading").textContent = name;
  $("t-name").textContent   = name;
  $("t-email").textContent  = email;
  $("t-github").textContent = github;
  $("t-avatar").src = avatarURL;
  $("t-avatar").alt = `Avatar of ${name}`;

  const number = String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0");
  $("t-number").textContent = `#${number}`;

  $("form-view").hidden = true;
  $("ticket-view").hidden = false;
  window.scrollTo({ top: 0 });
}
