const form = document.querySelector("#auth-form");
const message = document.querySelector("#form-message");
const nameField = document.querySelector("#name-field");
const nameInput = document.querySelector("#nome");
const passwordInput = document.querySelector("#senha");
const submitButton = document.querySelector("#submit-button");
const tabs = document.querySelectorAll(".auth-tab");
let mode = "login";
const contextPath = window.location.pathname.replace(/\/[^/]*$/, "");

document.querySelector("#year").textContent = new Date().getFullYear();

function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";
  nameField.hidden = !registering;
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