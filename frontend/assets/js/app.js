const form = document.querySelector("#auth-form");
const message = document.querySelector("#form-message");
const nameField = document.querySelector("#name-field");
const nameInput = document.querySelector("#nome");
const passwordInput = document.querySelector("#senha");
const submitButton = document.querySelector("#submit-button");
const tabs = document.querySelectorAll(".auth-tab");
const recoveryPanel = document.querySelector("#recovery-panel");
const recoveryForm = document.querySelector("#recovery-form");
const resetForm = document.querySelector("#reset-form");
const recoveryMessage = document.querySelector("#recovery-message");
const resetMessage = document.querySelector("#reset-message");
const showRecoveryButton = document.querySelector("#show-recovery");
let mode = "login";
const contextPath = window.location.pathname.replace(/\/[^/]*$/, "");

document.querySelector("#year").textContent = new Date().getFullYear();

function setMode(nextMode) {
  mode = nextMode;
  form.hidden = false;
  recoveryPanel.hidden = true;
  const registering = mode === "register";
  nameField.hidden = !registering;
  showRecoveryButton.hidden = registering;
  nameInput.required = registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  passwordInput.minLength = registering ? 10 : 1;
  submitButton.innerHTML = registering
    ? 'Criar minha conta <span aria-hidden="true">→</span>'
    : 'Entrar na conta <span aria-hidden="true">→</span>';
  tabs.forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  message.textContent = "";
  message.className = "form-message";
}

tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.mode)));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.className = "form-message";
  submitButton.disabled = true;
  try {
    const endpoint = mode === "register" ? "cadastro" : "login";
    const response = await fetch(`${contextPath}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(new FormData(form)),
      credentials: "same-origin"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.erro || "Não foi possível concluir o acesso.");
    message.textContent = mode === "register" ? "Conta criada. O cadastro foi concluído." : `Bem-vindo(a), ${payload.nome}!`;
    message.className = "form-message success";
    window.location.href = "./dashboard.html";
  } catch (error) {
    message.textContent = error instanceof TypeError
      ? "Não foi possível conectar ao servidor. Confira se a aplicação está em execução."
      : error.message;
    message.className = "form-message error";
  } finally {
    submitButton.disabled = false;
  }
});

showRecoveryButton.addEventListener("click", () => {
  recoveryPanel.hidden = false;
  form.hidden = true;
  document.querySelector("#recovery-email").value = document.querySelector("#email").value;
  recoveryMessage.textContent = "";
  resetMessage.textContent = "";
});

document.querySelector("#show-login").addEventListener("click", () => setMode("login"));

recoveryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = recoveryForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const response = await fetch(contextPath + "/api/auth/recuperacao", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(new FormData(recoveryForm)),
      credentials: "same-origin"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.erro || "Não foi possível solicitar a recuperação.");
    recoveryMessage.textContent = payload.mensagem || "Se a conta existir, você receberá instruções.";
    recoveryMessage.className = "form-message success";
  } catch (error) {
    recoveryMessage.textContent = error instanceof TypeError ? "Não foi possível conectar ao servidor." : error.message;
    recoveryMessage.className = "form-message error";
  } finally {
    button.disabled = false;
  }
});

resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = resetForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const response = await fetch(contextPath + "/api/auth/redefinir-senha", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(new FormData(resetForm)),
      credentials: "same-origin"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.erro || "Não foi possível redefinir a senha.");
    recoveryPanel.hidden = true;
    resetForm.reset();
    form.hidden = false;
    setMode("login");
    message.textContent = payload.mensagem || "Senha redefinida. Entre com a nova senha.";
    message.className = "form-message success";
  } catch (error) {
    resetMessage.textContent = error instanceof TypeError ? "Não foi possível conectar ao servidor." : error.message;
    resetMessage.className = "form-message error";
  } finally {
    button.disabled = false;
  }
});
