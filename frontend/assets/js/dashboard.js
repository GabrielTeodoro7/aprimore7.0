const title = document.querySelector("#welcome-title");
const copy = document.querySelector("#welcome-copy");
const status = document.querySelector("#account-status");
const details = document.querySelector("#account-details");
const staffTools = document.querySelector("#staff-tools");
const teacherIdField = document.querySelector("#teacher-id-field");
const studentsHeading = document.querySelector("#students-heading");
const activitiesStatus = document.querySelector("#activities-status");
const activitiesList = document.querySelector("#activities-list");
const activitySearch = document.querySelector("#activity-search");
const studentsStatus = document.querySelector("#students-status");
const studentsList = document.querySelector("#students-list");
const classMessage = document.querySelector("#class-message");
const activityMessage = document.querySelector("#activity-message");
const studentMessage = document.querySelector("#student-message");
const correctionsSection = document.querySelector("#corrections-section");
const correctionsStatus = document.querySelector("#corrections-status");
const correctionsList = document.querySelector("#corrections-list");
const attendanceForm = document.querySelector("#attendance-form");
const attendanceMessage = document.querySelector("#attendance-message");
const attendanceHistorySection = document.querySelector("#attendance-history-section");
const attendanceHistoryStatus = document.querySelector("#attendance-history-status");
const attendanceHistoryList = document.querySelector("#attendance-history-list");
let csrfToken = "";
const contextPath = window.location.pathname.replace(/\/[^/]*$/, "");
document.querySelector("#year").textContent = new Date().getFullYear();
document.querySelector("#class-year").value = new Date().getFullYear();
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
document.querySelector("#attendance-date").value = today.toISOString().slice(0, 10);

function filtrarAtividades() {
  const cards = Array.from(activitiesList.children);
  if (!cards.length) return;

  const termo = (activitySearch?.value || "").trim().toLocaleLowerCase("pt-BR");
  let visiveis = 0;

  cards.forEach((card) => {
    const corresponde = (card.dataset.searchText || "").includes(termo);
    card.hidden = !corresponde;
    if (corresponde) visiveis++;
  });

  if (!termo) {
    activitiesStatus.textContent = cards.length + " atividade(s) disponível(is).";
  } else {
    activitiesStatus.textContent = visiveis
      ? visiveis + " atividade(s) correspondem à busca."
      : "Nenhuma atividade corresponde à busca.";
  }
}

activitySearch?.addEventListener("input", filtrarAtividades);

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

async function loadActivities(user) {
  activitiesList.replaceChildren();
  activitiesStatus.textContent = "Carregando atividades...";
  try {
    const activities = await requestJson("/api/atividades");
    activitiesStatus.textContent = activities.length ? activities.length + " atividade(s) disponível(is)." : "Ainda não há atividades para este perfil.";
    activities.forEach((item) => {
      const dueDate = item.dataEntrega ? "Entrega: " + new Date(item.dataEntrega + "T12:00:00").toLocaleDateString("pt-BR") : "Sem data de entrega";
      const lines = [item.materia, item.turmaNome, dueDate, "Dificuldade: " + item.dificuldade, item.adaptada ? "Atividade adaptada" : "Atividade padrão"];
      if (item.descricao) lines.push(item.descricao);
      const card = createCard(item.titulo, lines);
      card.dataset.searchText = [
        item.titulo,
        item.materia,
        item.turmaNome,
        item.descricao || "",
        item.dificuldade
      ].join(" ").toLocaleLowerCase("pt-BR");
      if (user.perfil === "ALUNO") {
        const form = document.createElement("form");
        form.className = "submission-form";
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "atividadeId";
        input.value = String(item.id);
        const field = document.createElement("div");
        field.className = "field";
        const label = document.createElement("label");
        label.textContent = "Sua resposta";
        label.htmlFor = "answer-" + item.id;
        const textarea = document.createElement("textarea");
        textarea.id = label.htmlFor;
        textarea.name = "resposta";
        textarea.rows = 4;
        textarea.maxLength = 20000;
        textarea.required = true;
        textarea.placeholder = "Escreva sua resposta aqui...";
        const message = document.createElement("p");
        message.className = "form-message";
        message.setAttribute("role", "status");
        const button = document.createElement("button");
        button.type = "submit";
        button.className = "button submit-button";
        button.textContent = "Enviar resposta";
        field.append(label, textarea);
        form.append(input, field, message, button);
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          button.disabled = true;
          try {
            await requestJson("/api/submissoes", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
              body: new URLSearchParams(new FormData(form))
            });
            showMessage(message, "Resposta enviada com sucesso.", true);
            textarea.disabled = true;
            button.disabled = true;
          } catch (error) {
            showMessage(message, error.message);
            button.disabled = false;
          }
        });
        card.append(form);
      }
      activitiesList.append(card);
    });
    filtrarAtividades();
  } catch (error) {
    activitiesStatus.textContent = error.message;
  }
}

async function loadStaffWorkspace(user) {
  const staff = ["PROFESSOR", "ADMIN", "CEO"].includes(user.perfil);
  staffTools.hidden = !staff;
  studentsHeading.hidden = !staff;
  correctionsSection.hidden = !staff;
  attendanceHistorySection.hidden = !staff;
  if (!staff) return;

  const teacher = user.perfil === "PROFESSOR";
  teacherIdField.hidden = teacher;
  const teacherIdInput = document.querySelector("#teacher-id");
  teacherIdInput.required = !teacher;

  try {
    const classes = await requestJson("/api/turmas");
    fillClassSelect(document.querySelector("#activity-class"), classes);
    fillClassSelect(document.querySelector("#student-class"), classes);
    fillClassSelect(document.querySelector("#attendance-class"), classes);
  } catch (error) {
    showMessage(classMessage, error.message);
    fillClassSelect(document.querySelector("#activity-class"), []);
    fillClassSelect(document.querySelector("#student-class"), []);
    fillClassSelect(document.querySelector("#attendance-class"), []);
  }

  studentsList.replaceChildren();
  document.querySelector("#attendance-student").replaceChildren();
  studentsStatus.textContent = "Carregando alunos...";
  try {
    const students = await requestJson("/api/alunos");
    studentsStatus.textContent = students.length ? students.length + " aluno(s) cadastrado(s)." : "Ainda não há alunos cadastrados.";
    students.forEach((student) => {
      const option = document.createElement("option");
      option.value = String(student.id);
      option.textContent = student.nome + " — " + student.turmaNome;
      document.querySelector("#attendance-student").append(option);
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
  await Promise.all([loadCorrections(), loadAttendanceHistory()]);
}

async function loadCorrections() {
  correctionsList.replaceChildren();
  correctionsStatus.textContent = "Carregando entregas...";
  try {
    const submissions = await requestJson("/api/correcoes");
    correctionsStatus.textContent = submissions.length ? submissions.length + " entrega(s) encontrada(s)." : "Nenhuma entrega para corrigir no momento.";
    submissions.forEach((item) => {
      const card = createCard(item.titulo, ["Aluno: " + item.alunoNome, "Resposta: " + (item.resposta || "Sem resposta"), "Status: " + item.status, "Nota atual: " + (item.nota ?? "Não corrigida"), item.feedback ? "Feedback: " + item.feedback : "Sem feedback registrado"]);
      const form = document.createElement("form");
      form.className = "submission-form";
      const id = document.createElement("input");
      id.type = "hidden";
      id.name = "submissaoId";
      id.value = String(item.id);
      const gradeField = document.createElement("div");
      gradeField.className = "field";
      const gradeLabel = document.createElement("label");
      gradeLabel.textContent = "Nota (0 a 10)";
      gradeLabel.htmlFor = "grade-" + item.id;
      const grade = document.createElement("input");
      grade.id = gradeLabel.htmlFor;
      grade.name = "nota";
      grade.type = "number";
      grade.min = "0";
      grade.max = "10";
      grade.step = "0.01";
      grade.required = true;
      if (item.nota !== null) grade.value = String(item.nota);
      gradeField.append(gradeLabel, grade);
      const feedbackField = document.createElement("div");
      feedbackField.className = "field";
      const feedbackLabel = document.createElement("label");
      feedbackLabel.textContent = "Feedback para o estudante";
      feedbackLabel.htmlFor = "feedback-" + item.id;
      const feedback = document.createElement("textarea");
      feedback.id = feedbackLabel.htmlFor;
      feedback.name = "feedback";
      feedback.rows = 3;
      feedback.maxLength = 2000;
      feedback.value = item.feedback || "";
      feedbackField.append(feedbackLabel, feedback);
      const message = document.createElement("p");
      message.className = "form-message";
      message.setAttribute("role", "status");
      const button = document.createElement("button");
      button.type = "submit";
      button.className = "button submit-button";
      button.textContent = "Salvar correção";
      form.append(id, gradeField, feedbackField, message, button);
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        button.disabled = true;
        try {
          await requestJson("/api/correcoes", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body: new URLSearchParams(new FormData(form)) });
          showMessage(message, "Correção salva.", true);
          await loadCorrections();
        } catch (error) {
          showMessage(message, error.message);
        } finally {
          button.disabled = false;
        }
      });
      card.append(form);
      correctionsList.append(card);
    });
  } catch (error) {
    correctionsStatus.textContent = error.message;
  }
}

async function loadAttendanceHistory() {
  attendanceHistoryList.replaceChildren();
  attendanceHistoryStatus.textContent = "Carregando registros...";
  try {
    const records = await requestJson("/api/frequencia");
    attendanceHistoryStatus.textContent = records.length ? records.length + " registro(s) encontrado(s)." : "Nenhum registro de frequência encontrado.";
    records.slice(0, 30).forEach((record) => {
      attendanceHistoryList.append(createCard(record.alunoNome, ["Turma: " + record.turmaNome, "Data: " + new Date(record.dataAula + "T12:00:00").toLocaleDateString("pt-BR"), record.presente ? "Presente" : "Ausente", record.justificativa ? "Justificativa: " + record.justificativa : "Sem justificativa"]));
    });
  } catch (error) {
    attendanceHistoryStatus.textContent = error.message;
  }
}

async function loadStudentSubmissions() {
  const section = document.querySelector("#student-submissions-section");
  const status = document.querySelector("#student-submissions-status");
  const list = document.querySelector("#student-submissions-list");
  section.hidden = false;
  list.replaceChildren();
  status.textContent = "Carregando suas entregas...";
  try {
    const submissions = await requestJson("/api/submissoes");
    if (!submissions.length) {
      status.textContent = "Você ainda não enviou respostas. Suas entregas aparecerão aqui.";
      return;
    }
    status.textContent = submissions.length + " entrega(s) registrada(s).";
    submissions.forEach((item) => {
      const nota = item.nota === null ? "Aguardando correção" : "Nota: " + Number(item.nota).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " / 10";
      const data = item.entregueEm ? new Date(item.entregueEm.replace(" ", "T")).toLocaleString("pt-BR") : "Data não disponível";
      const detalhes = [
        "Status: " + (item.status === "CORRIGIDA" ? "Corrigida" : "Entregue"),
        nota,
        "Enviada em: " + data,
        "Sua resposta: " + (item.resposta || "Sem resposta registrada")
      ];
      if (item.feedback) detalhes.push("Feedback do professor: " + item.feedback);
      list.append(createCard(item.titulo, detalhes));
    });
  } catch (error) {
    status.textContent = error.message;
  }
}

async function loadWorkspace(user) {
  await Promise.all([loadActivities(user), loadStaffWorkspace(user)]);
  if (user.perfil === "ALUNO") await loadStudentSubmissions();
  reportsSection.hidden = !["ADMIN", "CEO"].includes(user.perfil);
  const reportsNavLink = document.querySelector("#reports-nav-link");
  if (reportsNavLink) reportsNavLink.hidden = reportsSection.hidden;
  if (["ADMIN", "CEO"].includes(user.perfil)) await loadReports();
}

async function loadAccount() {
  try {
    const user = await requestJson("/api/auth/me");
    csrfToken = user.csrfToken || "";
    wellbeingSection.hidden = user.perfil !== "ALUNO";
    title.textContent = "Olá, " + user.nome + ".";
    copy.textContent = "Sua sessão está ativa. Os recursos disponíveis dependem do seu perfil de acesso.";
    status.textContent = "Sessão ativa";
    status.className = "form-message success";
    details.replaceChildren();
    addDetail("Nome", user.nome);
    addDetail("E-mail", user.email);
    addDetail("Perfil", user.perfil);
    await loadWorkspace(user);
    await Promise.all([loadContacts(), loadMessages()]);
    if (user.perfil === "ALUNO") await loadWellbeingHistory();
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

const tutorForm = document.querySelector("#tutor-form");
const tutorMessage = document.querySelector("#tutor-message");
const tutorSubmit = document.querySelector("#tutor-submit");
const tutorAnswer = document.querySelector("#tutor-answer");
const wellbeingSection = document.querySelector("#wellbeing-section");
const wellbeingForm = document.querySelector("#wellbeing-form");
const wellbeingMessage = document.querySelector("#wellbeing-message");
const wellbeingHistory = document.querySelector("#wellbeing-history");
const messageForm = document.querySelector("#message-form");
const messageFormStatus = document.querySelector("#message-form-status");
const messagesStatus = document.querySelector("#messages-status");
const messagesList = document.querySelector("#messages-list");
const messageRecipient = document.querySelector("#message-recipient");
const reportsSection = document.querySelector("#reports-section");
const reportsStatus = document.querySelector("#reports-status");
const reportsGrid = document.querySelector("#reports-grid");

tutorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  tutorMessage.textContent = "";
  tutorMessage.className = "form-message";
  tutorAnswer.hidden = true;
  tutorSubmit.disabled = true;
  try {
    const payload = await requestJson("/api/ia/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(new FormData(tutorForm))
    });
    tutorAnswer.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = "Resposta do tutor";
    const paragraph = document.createElement("p");
    paragraph.textContent = payload.resposta;
    tutorAnswer.append(heading, paragraph);
    tutorAnswer.hidden = false;
    showMessage(tutorMessage, "Resposta recebida.", true);
  } catch (error) {
    showMessage(tutorMessage, error.message);
  } finally {
    tutorSubmit.disabled = false;
  }
});


async function loadWellbeingHistory() {
  wellbeingHistory.replaceChildren();
  try {
    const records = await requestJson("/api/sentimentos");
    if (!records.length) {
      const empty = document.createElement("p");
      empty.textContent = "Seus registros aparecerão aqui quando você decidir salvar um.";
      wellbeingHistory.append(empty);
      return;
    }
    records.forEach((record) => {
      const entry = document.createElement("p");
      const date = record.criadoEm ? new Date(record.criadoEm.replace(" ", "T")).toLocaleString("pt-BR") : "";
      entry.textContent = date + " — " + record.emocao + " (intensidade " + record.intensidade + ")";
      wellbeingHistory.append(entry);
    });
  } catch (error) {
    const note = document.createElement("p");
    note.textContent = error.message;
    wellbeingHistory.append(note);
  }
}

wellbeingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = wellbeingForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await requestJson("/api/sentimentos", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(new FormData(wellbeingForm))
    });
    wellbeingForm.reset();
    showMessage(wellbeingMessage, "Registro salvo com sucesso.", true);
    await loadWellbeingHistory();
  } catch (error) {
    showMessage(wellbeingMessage, error.message);
  } finally {
    button.disabled = false;
  }
});


attendanceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = attendanceForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await requestJson("/api/frequencia", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(new FormData(attendanceForm))
    });
    showMessage(attendanceMessage, "Frequência salva.", true);
    attendanceForm.querySelector("#attendance-note").value = "";
    await loadAttendanceHistory();
  } catch (error) {
    showMessage(attendanceMessage, error.message);
  } finally {
    button.disabled = false;
  }
});


async function loadContacts() {
  messageRecipient.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecione um contato";
  messageRecipient.append(placeholder);
  try {
    const contacts = await requestJson("/api/contatos");
    contacts.forEach((contact) => {
      const option = document.createElement("option");
      option.value = String(contact.id);
      option.textContent = contact.nome + " — " + contact.perfil;
      messageRecipient.append(option);
    });
    messageRecipient.disabled = contacts.length === 0;
  } catch (error) {
    messageRecipient.disabled = true;
    messagesStatus.textContent = error.message;
  }
}

async function loadMessages() {
  messagesList.replaceChildren();
  messagesStatus.textContent = "Carregando mensagens...";
  try {
    const messages = await requestJson("/api/mensagens");
    messagesStatus.textContent = messages.length ? messages.length + " mensagem(ns)." : "Sua caixa de mensagens está vazia.";
    messages.forEach((message) => {
      const direction = message.recebida ? "De: " + message.remetenteNome : "Para: " + message.destinatarioNome;
      const card = createCard(message.assunto, [direction, message.conteudo, message.lida ? "Lida" : (message.recebida ? "Não lida" : "Enviada")]);
      if (message.recebida && !message.lida) {
        const readButton = document.createElement("button");
        readButton.type = "button";
        readButton.className = "button button-small";
        readButton.textContent = "Marcar como lida";
        readButton.addEventListener("click", async () => {
          readButton.disabled = true;
          try {
            await requestJson("/api/mensagens", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
              body: new URLSearchParams({ mensagemId: String(message.id), marcarLida: "true" })
            });
            await loadMessages();
          } catch (error) {
            messagesStatus.textContent = error.message;
            readButton.disabled = false;
          }
        });
        card.append(readButton);
      }
      const date = document.createElement("small");
      date.textContent = message.criadoEm ? new Date(message.criadoEm.replace(" ", "T")).toLocaleString("pt-BR") : "";
      card.append(date);
      messagesList.append(card);
    });
  } catch (error) {
    messagesStatus.textContent = error.message;
  }
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = messageForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await requestJson("/api/mensagens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(new FormData(messageForm))
    });
    messageForm.reset();
    showMessage(messageFormStatus, "Mensagem enviada.", true);
    await loadMessages();
  } catch (error) {
    showMessage(messageFormStatus, error.message);
  } finally {
    button.disabled = false;
  }
});


async function loadReports() {
  reportsGrid.replaceChildren();
  reportsStatus.textContent = "Carregando indicadores...";
  try {
    const report = await requestJson("/api/relatorios/resumo");
    const metrics = [
      ["Usuários ativos", report.usuariosAtivos],
      ["Alunos ativos", report.alunosAtivos],
      ["Professores ativos", report.professoresAtivos],
      ["Turmas", report.turmas],
      ["Perfis escolares", report.perfisAluno],
      ["Atividades publicadas", report.atividadesPublicadas],
      ["Entregas pendentes", report.entregasPendentes],
      ["Entregas corrigidas", report.entregasCorrigidas],
      ["Presenças registradas", report.presencas],
      ["Registros de frequência", report.registrosFrequencia]
    ];
    metrics.forEach(([label, value]) => {
      const card = createCard(label, [Number(value).toLocaleString("pt-BR")]);
      card.classList.add("report-metric");
      reportsGrid.append(card);
    });
    const classes = await requestJson("/api/relatorios/resumo?tipo=turmas");
    const heading = document.createElement("h3");
    heading.textContent = "Desempenho por turma";
    heading.className = "report-subheading";
    reportsGrid.append(heading);
    if (!classes.length) {
      reportsGrid.append(createCard("Sem turmas cadastradas", ["Cadastre uma turma para começar a acompanhar os indicadores."]));
    } else {
      classes.forEach((item) => {
        const average = item.mediaNotas === null ? "Ainda sem notas" : Number(item.mediaNotas).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " / 10";
        const attendance = item.registrosFrequencia ? Math.round(item.presencas / item.registrosFrequencia * 100) : null;
        const card = createCard(item.nome + " — " + item.anoLetivo, [
          "Alunos ativos: " + item.alunos,
          "Atividades publicadas: " + item.atividades,
          "Entregas registradas: " + item.entregas,
          "Média das notas: " + average,
          "Frequência registrada: " + (attendance === null ? "Sem registros" : attendance + "%")
        ]);
        card.classList.add("report-class-card");
        reportsGrid.append(card);
      });
    }
    reportsStatus.textContent = "Indicadores gerais e dados por turma atualizados.";
  } catch (error) {
    reportsStatus.textContent = error.message;
  }
}
