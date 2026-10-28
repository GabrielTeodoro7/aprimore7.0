const title = document.querySelector("#welcome-title");
const copy = document.querySelector("#welcome-copy");
const status = document.querySelector("#account-status");
const details = document.querySelector("#account-details");
const staffTools = document.querySelector("#staff-tools");
const teacherIdField = document.querySelector("#teacher-id-field");
const studentsHeading = document.querySelector("#students-heading");
const activitiesStatus = document.querySelector("#activities-status");
const activitiesList = document.querySelector("#activities-list");
const studentsStatus = document.querySelector("#students-status");
const studentsList = document.querySelector("#students-list");
const classMessage = document.querySelector("#class-message");
const activityMessage = document.querySelector("#activity-message");
const studentMessage = document.querySelector("#student-message");
let csrfToken = "";
const contextPath = window.location.pathname.replace(/\/[^/]*$/, "");
document.querySelector("#year").textContent = new Date().getFullYear();
document.querySelector("#class-year").value = new Date().getFullYear();

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

async function requestJson(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.method && options.method.toUpperCase() === "POST" && csrfToken) headers.set("X-CSRF-Token", csrfToken);
  const targetUrl = url.startsWith("/") ? `${contextPath}${url}` : url;
  const response = await fetch(targetUrl, { credentials: "same-origin", cache: "no-store", ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.replace("./index.html#acesso");
    throw new Error("Sua sessão expirou. Entre novamente.");
  }
  if (!response.ok) throw new Error(payload.erro || "Não foi possível concluir a operação.");
  return payload;
}

function showMessage(element, text, success = false) {
  element.textContent = text;
  element.className = success ? "form-message success" : "form-message error";
}

function createCard(titleText, lines) {
  const article = document.createElement("article");
  article.className = "feature-card";
  const heading = document.createElement("h3");
  heading.textContent = titleText;
  article.append(heading);
  lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    article.append(paragraph);
  });
  return article;
}

function fillClassSelect(select, classes) {
  select.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = classes.length ? "Selecione uma turma" : "Nenhuma turma cadastrada";
  select.append(placeholder);
  classes.forEach((item) => {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = item.nome + " — " + item.anoLetivo;
    select.append(option);
  });
  select.disabled = classes.length === 0;
}

async function loadActivities() {
  activitiesList.replaceChildren();
  activitiesStatus.textContent = "Carregando atividades...";
  try {
    const activities = await requestJson("/api/atividades");
    activitiesStatus.textContent = activities.length ? activities.length + " atividade(s) disponível(is)." : "Ainda não há atividades para este perfil.";
    activities.forEach((item) => {
      const dueDate = item.dataEntrega ? "Entrega: " + new Date(item.dataEntrega + "T12:00:00").toLocaleDateString("pt-BR") : "Sem data de entrega";
      const lines = [item.materia, item.turmaNome, dueDate, "Dificuldade: " + item.dificuldade, item.adaptada ? "Atividade adaptada" : "Atividade padrão"];
      if (item.descricao) lines.push(item.descricao);
      activitiesList.append(createCard(item.titulo, lines));
    });
  } catch (error) {
    activitiesStatus.textContent = error.message;
  }
}

async function loadStaffWorkspace(user) {
  const staff = ["PROFESSOR", "ADMIN", "CEO"].includes(user.perfil);
  staffTools.hidden = !staff;
  studentsHeading.hidden = !staff;
  if (!staff) return;

  const teacher = user.perfil === "PROFESSOR";
  teacherIdField.hidden = teacher;
  const teacherIdInput = document.querySelector("#teacher-id");
  teacherIdInput.required = !teacher;

  try {
    const classes = await requestJson("/api/turmas");
    fillClassSelect(document.querySelector("#activity-class"), classes);
    fillClassSelect(document.querySelector("#student-class"), classes);
  } catch (error) {
    showMessage(classMessage, error.message);
    fillClassSelect(document.querySelector("#activity-class"), []);
    fillClassSelect(document.querySelector("#student-class"), []);
  }

  studentsList.replaceChildren();
  studentsStatus.textContent = "Carregando alunos...";
  try {
    const students = await requestJson("/api/alunos");
    studentsStatus.textContent = students.length ? students.length + " aluno(s) cadastrado(s)." : "Ainda não há alunos cadastrados.";
    students.forEach((student) => {
      studentsList.append(createCard(student.nome, [
        "Turma: " + student.turmaNome,
        student.responsavel ? "Responsável: " + student.responsavel : "Responsável não informado",
        student.ativo ? "Cadastro ativo" : "Cadastro inativo",
        student.necessidadeEducacional ? "Apoio informado: " + student.necessidadeEducacional : "Nenhuma necessidade educacional registrada"
      ]));
    });
  } catch (error) {
    studentsStatus.textContent = error.message;
  }
}

async function loadWorkspace(user) {
  await Promise.all([loadActivities(), loadStaffWorkspace(user)]);
}

async function loadAccount() {
  try {
    const user = await requestJson("/api/auth/me");
    csrfToken = user.csrfToken || "";
    title.textContent = "Olá, " + user.nome + ".";
    copy.textContent = "Sua sessão está ativa. Os recursos disponíveis dependem do seu perfil de acesso.";
    status.textContent = "Sessão ativa";
    status.className = "form-message success";
    details.replaceChildren();
    addDetail("Nome", user.nome);
    addDetail("E-mail", user.email);
    addDetail("Perfil", user.perfil);
    await loadWorkspace(user);
  } catch (error) {
    status.textContent = error.message;
    status.className = "form-message error";
  }
}

async function submitForm(form, endpoint, messageElement, successMessage, afterSuccess) {
  messageElement.textContent = "";
  messageElement.className = "form-message";
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const data = new URLSearchParams(new FormData(form));
    await requestJson(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: data
    });
    showMessage(messageElement, successMessage, true);
    form.reset();
    document.querySelector("#class-year").value = new Date().getFullYear();
    if (afterSuccess) await afterSuccess();
  } catch (error) {
    showMessage(messageElement, error.message);
  } finally {
    button.disabled = false;
  }
}

document.querySelector("#create-class-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm(event.currentTarget, "/api/turmas", classMessage, "Turma criada com sucesso.", loadAccount);
});
document.querySelector("#create-activity-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm(event.currentTarget, "/api/atividades", activityMessage, "Atividade publicada com sucesso.", loadAccount);
});
document.querySelector("#create-student-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm(event.currentTarget, "/api/alunos", studentMessage, "Aluno cadastrado com sucesso.", loadAccount);
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await fetch(`${contextPath}/api/auth/logout`, { method: "POST", credentials: "same-origin", headers: { "X-CSRF-Token": csrfToken } });
  } finally {
    window.location.replace("./index.html");
  }
});

loadAccount();