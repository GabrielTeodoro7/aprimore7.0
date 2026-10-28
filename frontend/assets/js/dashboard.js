const title = document.querySelector("#welcome-title");
const copy = document.querySelector("#welcome-copy");
const status = document.querySelector("#account-status");
const details = document.querySelector("#account-details");
document.querySelector("#year").textContent = new Date().getFullYear();

function addDetail(label, value) {
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value || "—";
  term.style.color = "var(--muted)";
  term.style.fontSize = "12px";
  term.style.marginTop = "16px";
  description.style.margin = "3px 0 0";
  description.style.fontWeight = "650";
  details.append(term, description);
}

async function loadAccount() {
  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
    if (response.status === 401) {
      window.location.replace("./index.html#acesso");
      return;
    }
    const user = await response.json();
    if (!response.ok) throw new Error(user.erro || "Não foi possível carregar o perfil.");
    title.textContent = `Olá, ${user.nome}.`;
    copy.textContent = "Sua sessão está ativa. Esta área será expandida com os módulos pedagógicos durante a migração.";
    status.textContent = "Sessão ativa";
    status.className = "form-message success";
    addDetail("Nome", user.nome);
    addDetail("E-mail", user.email);
    addDetail("Perfil", user.perfil);
  } catch {
    status.textContent = "Não foi possível conectar ao servidor. Confira a configuração da aplicação.";
    status.className = "form-message error";
  }
}

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } finally {
    window.location.replace("./index.html");
  }
});

loadAccount();