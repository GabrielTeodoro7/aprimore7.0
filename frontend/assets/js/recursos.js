(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const stage = $("#game-stage");
  if (!stage) return;
  const storageKey = "aprimore.jogos.pontuacoes.v1";
  const games = {
    quiz: { name: "Quiz relâmpago" },
    memory: { name: "Jogo da memória" },
    math: { name: "Desafio de matemática" },
    words: { name: "Palavra embaralhada" }
  };
  let scores = readScores();
  let activeGame = "quiz";
  let gameState = null;
  let calendarDate = new Date();
  let calendarActivities = [];

  function readScores() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return Object.fromEntries(Object.keys(games).map((key) => [key, Number.isFinite(saved[key]) ? Math.max(0, saved[key]) : 0]));
    } catch { return Object.fromEntries(Object.keys(games).map((key) => [key, 0])); }
  }
  function saveScores() {
    try { localStorage.setItem(storageKey, JSON.stringify(scores)); } catch { /* O jogo segue sem salvar recordes. */ }
    renderScores();
  }
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(label, callback, className = "button") {
    const node = el("button", label, className);
    node.type = "button";
    node.addEventListener("click", callback);
    return node;
  }
  function setStage(title, description) {
    stage.replaceChildren(el("h3", title));
    if (description) stage.append(el("p", description));
  }
  function stats(values) { stage.append(el("div", values.join("   ·   "), "game-stat-row")); }
  function finish(points, summary) {
    scores[activeGame] = Math.max(scores[activeGame] || 0, points);
    saveScores();
    setStage("Mandou bem! 🎉", summary);
    stage.append(el("p", "Pontuação desta rodada: " + points + " ponto(s)."));
    stage.append(el("p", "Seu recorde: " + scores[activeGame] + " ponto(s)."));
    stage.append(button("Jogar novamente", () => startGame(activeGame)));
  }
  function renderScores() {
    const target = $("#game-scores");
    if (!target) return;
    target.replaceChildren();
    Object.entries(games).forEach(([key, game]) => {
      const card = el("article", null, "feature-card");
      card.append(el("h3", game.name), el("p", "Melhor pontuação: " + scores[key]));
      target.append(card);
    });
    const summary = $("#games-summary");
    if (summary) summary.textContent = "Recordes salvos neste dispositivo: " + Object.values(scores).reduce((sum, value) => sum + value, 0) + " ponto(s) somados.";
  }
  function showQuiz() {
    const questions = [
      ["Qual planeta é conhecido como Planeta Vermelho?", ["Vênus", "Marte", "Júpiter", "Saturno"], 1, "Marte tem óxidos de ferro em sua superfície."],
      ["Quanto é 8 × 7?", ["54", "56", "64", "48"], 1, "8 vezes 7 é igual a 56."],
      ["Qual é o plural de cidadão?", ["Cidadões", "Cidadães", "Cidadãos", "Cidadans"], 2, "O plural correto é cidadãos."],
      ["Qual é o maior oceano?", ["Atlântico", "Índico", "Ártico", "Pacífico"], 3, "O Pacífico é o maior oceano da Terra."],
      ["A água no estado de vapor está em qual estado?", ["Sólido", "Gasoso", "Metálico", "Mineral"], 1, "O vapor é água no estado gasoso."],
      ["Quanto é 1/2 + 1/4?", ["2/6", "1/6", "3/4", "1/8"], 2, "Dois quartos mais um quarto são três quartos."],
      ["Qual órgão bombeia o sangue?", ["Pulmão", "Coração", "Estômago", "Rim"], 1, "O coração bombeia o sangue."],
      ["Qual destas palavras é um verbo?", ["Rapidamente", "Azul", "Estudar", "Caderno"], 2, "Estudar indica uma ação."],
      ["Quantos lados tem um hexágono?", ["5", "6", "7", "8"], 1, "Hexa significa seis."],
      ["Qual estrela está mais próxima da Terra?", ["Sirius", "Sol", "Vega", "Proxima Centauri"], 1, "O Sol é a estrela mais próxima." ]
    ];
    gameState = { questions, index: 0, points: 0, answered: false };
    showQuizQuestion();
  }
  function showQuizQuestion() {
    const s = gameState;
    if (s.index >= s.questions.length) return finish(s.points, "Você concluiu o quiz. Cada acerto vale 10 pontos.");
    const [question, options, answer, explanation] = s.questions[s.index];
    setStage("Quiz relâmpago", "Pergunta " + (s.index + 1) + " de " + s.questions.length);
    stats(["Pontos: " + s.points, "Cada acerto vale 10"]);
    stage.append(el("p", question, "game-question"));
    const grid = el("div", null, "game-answer-grid");
    options.forEach((option, index) => grid.append(button(option, () => {
      if (s.answered) return;
      s.answered = true;
      const correct = index === answer;
      if (correct) s.points += 10;
      grid.querySelectorAll("button").forEach((item) => { item.disabled = true; });
      const feedback = el("p", (correct ? "Correto! " : "Quase! ") + explanation, "game-feedback");
      feedback.style.color = correct ? "var(--green)" : "var(--orange)";
      stage.append(feedback, button(s.index === s.questions.length - 1 ? "Ver resultado" : "Próxima pergunta", () => {
        s.index++;
        s.answered = false;
        showQuizQuestion();
      }));
    }, "game-answer")));
    stage.append(grid);
  }
  function showMemory() {
    const symbols = ["📚", "🌎", "🧩", "🎨", "🚀", "🎵", "🌱", "🔬"];
    const deck = [...symbols, ...symbols].map((symbol, id) => ({ symbol, id, matched: false, revealed: false }));
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    gameState = { deck, first: null, locked: false, moves: 0, matches: 0 };
    renderMemoryBoard();
  }
  function renderMemoryBoard() {
    const s = gameState;
    setStage("Jogo da memória", "Encontre os 8 pares. Cada tentativa revela duas cartas.");
    stats(["Pares: " + s.matches + "/8", "Tentativas: " + s.moves]);
    const board = el("div", null, "memory-board");
    s.deck.forEach((card, index) => {
      const tile = button(card.revealed || card.matched ? card.symbol : "?", () => {
        if (s.locked || card.matched || card.revealed) return;
        card.revealed = true;
        tile.textContent = card.symbol;
        tile.setAttribute("aria-label", card.symbol);
        if (s.first === null) { s.first = index; return; }
        s.moves++;
        const first = s.deck[s.first];
        if (first.symbol === card.symbol) {
          first.matched = card.matched = true;
          first.revealed = card.revealed = true;
          s.matches++;
          s.first = null;
          renderMemoryBoard();
          if (s.matches === 8) finish(Math.max(0, 100 - (s.moves - 8) * 5), "Você encontrou todos os pares em " + s.moves + " tentativas.");
        } else {
          s.locked = true;
          const stat = stage.querySelector(".game-stat-row");
          if (stat) stat.textContent = "Pares: " + s.matches + "/8   ·   Tentativas: " + s.moves;
          setTimeout(() => {
            first.revealed = false;
            card.revealed = false;
            s.first = null;
            s.locked = false;
            renderMemoryBoard();
          }, 800);
        }
      }, "memory-tile");
      tile.setAttribute("aria-label", card.revealed || card.matched ? card.symbol : "Carta fechada");
      if (card.matched) tile.classList.add("matched");
      tile.disabled = card.matched;
      board.append(tile);
    });
    stage.append(board, button("Reiniciar memória", showMemory));
  }
  function showMath() {
    gameState = { round: 0, points: 0, locked: false, answer: 0 };
    showMathQuestion();
  }
  function showMathQuestion() {
    const s = gameState;
    if (s.round >= 10) return finish(s.points, "Você concluiu os 10 desafios de matemática.");
    const a = 2 + Math.floor(Math.random() * 12), b = 2 + Math.floor(Math.random() * 12);
    const op = ["+", "−", "×"][Math.floor(Math.random() * 3)];
    s.answer = op === "+" ? a + b : op === "−" ? Math.max(a, b) - Math.min(a, b) : a * b;
    const question = op === "−" ? Math.max(a, b) + " − " + Math.min(a, b) : a + " " + op + " " + b;
    s.locked = false;
    setStage("Desafio de matemática", "Resolva 10 contas. Cada acerto vale 10 pontos.");
    stats(["Rodada: " + (s.round + 1) + "/10", "Pontos: " + s.points]);
    stage.append(el("p", question + " = ?", "game-question"));
    const form = el("form", null, "game-math-form"), field = el("div", null, "field");
    const label = el("label", "Sua resposta"); label.htmlFor = "math-answer";
    const input = el("input"); input.id = "math-answer"; input.type = "number"; input.step = "1"; input.required = true; input.autocomplete = "off";
    field.append(label, input);
    const message = el("p", "", "game-feedback");
    const submit = el("button", "Conferir resposta", "button"); submit.type = "submit";
    form.append(field, submit, message);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (s.locked) return;
      s.locked = true;
      const correct = Number(input.value) === s.answer;
      if (correct) s.points += 10;
      message.textContent = correct ? "Isso mesmo! A resposta é " + s.answer + "." : "A resposta correta é " + s.answer + ".";
      message.style.color = correct ? "var(--green)" : "var(--orange)";
      submit.disabled = true;
      form.append(button(s.round === 9 ? "Ver resultado" : "Próxima conta", () => { s.round++; showMathQuestion(); }));
    });
    stage.append(form); input.focus();
  }
  const wordBank = [
    ["ESCOLA", "Lugar onde aprendemos."], ["LEITURA", "Transforma letras em ideias."],
    ["PLANETA", "A Terra é um deles."], ["CIENCIA", "Investiga o mundo com evidências."],
    ["AMIZADE", "Relação de carinho e confiança."], ["NATUREZA", "Inclui florestas, rios e animais."],
    ["HISTORIA", "Estuda acontecimentos do passado."], ["MATEMATICA", "Trabalha com números e padrões."]
  ];
  function scramble(word) {
    const chars = word.split("");
    for (let tries = 0; tries < 10; tries++) {
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      if (chars.join("") !== word) break;
    }
    return chars.join("");
  }
  function showWords() {
    gameState = { rounds: [...wordBank].sort(() => Math.random() - 0.5).slice(0, 6), index: 0, points: 0, locked: false };
    showWordQuestion();
  }
  function showWordQuestion() {
    const s = gameState;
    if (s.index >= s.rounds.length) return finish(s.points, "Você completou o desafio de palavras.");
    const [word, hint] = s.rounds[s.index];
    s.locked = false;
    setStage("Palavra embaralhada", "Organize as letras para descobrir a palavra.");
    stats(["Palavra: " + (s.index + 1) + "/6", "Pontos: " + s.points]);
    stage.append(el("p", scramble(word).split("").join(" · "), "game-question"), el("p", "Dica: " + hint));
    const form = el("form", null, "game-word-form"), field = el("div", null, "field");
    const label = el("label", "Palavra correta"); label.htmlFor = "word-answer";
    const input = el("input"); input.id = "word-answer"; input.type = "text"; input.autocomplete = "off"; input.maxLength = 30; input.required = true;
    input.setAttribute("autocapitalize", "characters");
    field.append(label, input);
    const message = el("p", "", "game-feedback");
    const submit = el("button", "Conferir palavra", "button"); submit.type = "submit";
    form.append(field, submit, message);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (s.locked) return;
      s.locked = true;
      const answer = input.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
      const correct = answer === word;
      if (correct) s.points += 10;
      message.textContent = correct ? "Acertou! A palavra é " + word + "." : "A palavra era " + word + ". Continue tentando!";
      message.style.color = correct ? "var(--green)" : "var(--orange)";
      submit.disabled = true;
      form.append(button(s.index === s.rounds.length - 1 ? "Ver resultado" : "Próxima palavra", () => { s.index++; showWordQuestion(); }));
    });
    stage.append(form); input.focus();
  }
  function startGame(key) {
    activeGame = games[key] ? key : "quiz";
    document.querySelectorAll("[data-game]").forEach((item) => {
      const selected = item.dataset.game === activeGame;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    if (activeGame === "quiz") showQuiz();
    else if (activeGame === "memory") showMemory();
    else if (activeGame === "math") showMath();
    else showWords();
  }
  document.querySelectorAll("[data-game]").forEach((item) => item.addEventListener("click", () => startGame(item.dataset.game)));
  $("#reset-games")?.addEventListener("click", () => {
    if (!confirm("Quer apagar os recordes dos quatro jogos neste dispositivo?")) return;
    scores = Object.fromEntries(Object.keys(games).map((key) => [key, 0]));
    saveScores(); startGame(activeGame);
  });

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value + "T12:00:00");
    return Number.isNaN(date.getTime()) ? null : date;
  }
  function dateLabel(value) {
    const date = parseDate(value);
    return date ? date.toLocaleDateString("pt-BR") : "Sem data definida";
  }
  function card(title, lines, extraClass = "") {
    const node = el("article", null, "feature-card " + extraClass);
    node.append(el("h3", title));
    lines.forEach((line) => node.append(el("p", line)));
    return node;
  }
  function renderCalendar() {
    const grid = $("#calendar-grid"), events = $("#calendar-events"), label = $("#calendar-month-label"), status = $("#calendar-status");
    if (!grid || !events || !label || !status) return;
    grid.replaceChildren(); events.replaceChildren();
    const year = calendarDate.getFullYear(), month = calendarDate.getMonth(), today = new Date();
    label.textContent = calendarDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach((day) => grid.append(el("div", day, "calendar-weekday")));
    const offsets = new Date(year, month, 1).getDay(), days = new Date(year, month + 1, 0).getDate(), due = new Map();
    calendarActivities.forEach((item) => {
      const date = parseDate(item.dataEntrega);
      if (date && date.getFullYear() === year && date.getMonth() === month) due.set(date.getDate(), [...(due.get(date.getDate()) || []), item]);
    });
    for (let i = 0; i < offsets; i++) grid.append(el("div", "", "calendar-day empty"));
    for (let day = 1; day <= days; day++) {
      const dayItems = due.get(day) || [];
      const dayButton = button(String(day), () => {
        events.replaceChildren(el("h3", "Prazos de " + day + " de " + calendarDate.toLocaleDateString("pt-BR", { month: "long" })));
        if (!dayItems.length) events.append(el("p", "Nenhuma atividade com prazo neste dia."));
        dayItems.forEach((item) => events.append(card(item.titulo, [item.materia, item.turmaNome, "Entrega: " + dateLabel(item.dataEntrega)])));
      }, "calendar-day");
      dayButton.setAttribute("role", "gridcell");
      if (dayItems.length) {
        dayButton.classList.add("has-event");
        dayButton.append(el("small", dayItems.length + (dayItems.length === 1 ? " prazo" : " prazos")));
        dayButton.setAttribute("aria-label", day + ", " + dayItems.length + " prazo(s)");
      }
      if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) dayButton.classList.add("today");
      grid.append(dayButton);
    }
    status.textContent = calendarActivities.length ? "Selecione um dia para ver os prazos das atividades cadastradas." : "Nenhuma atividade disponível para exibir. Os prazos aparecerão quando forem cadastrados.";
  }
  async function apiGet(path) {
    const context = window.location.pathname.replace(/\/[^/]*$/, "");
    const response = await fetch(context + path, { credentials: "same-origin", cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.erro || "Não foi possível carregar os dados.");
    return payload;
  }
  async function loadCalendar() {
    try { calendarActivities = await apiGet("/api/atividades"); renderCalendar(); }
    catch (error) { const status = $("#calendar-status"); if (status) status.textContent = error.message; }
  }
  $("#calendar-previous")?.addEventListener("click", () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1); renderCalendar(); });
  $("#calendar-next")?.addEventListener("click", () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1); renderCalendar(); });

  async function loadNotifications() {
    const list = $("#notifications-list"), status = $("#notifications-status");
    if (!list || !status) return;
    list.replaceChildren(); status.textContent = "Buscando atualizações...";
    try {
      const [activities, messages, submissions] = await Promise.all([
        apiGet("/api/atividades"), apiGet("/api/mensagens"), apiGet("/api/submissoes").catch(() => [])
      ]);
      const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const upcoming = activities.filter((item) => {
        const date = parseDate(item.dataEntrega);
        if (!date) return false;
        const days = Math.ceil((date.getTime() - today.getTime()) / 86400000);
        return days >= 0 && days <= 7;
      });
      const unread = messages.filter((item) => item.recebida && !item.lida);
      const pending = submissions.filter((item) => item.status !== "CORRIGIDA");
      const items = [
        ...upcoming.map((item) => ({ type: "warning", title: "Prazo próximo: " + item.titulo, text: "Entrega em " + dateLabel(item.dataEntrega) + " · " + item.materia })),
        ...unread.map((item) => ({ type: "normal", title: "Mensagem não lida: " + item.assunto, text: "De " + item.remetenteNome + " · " + (item.conteudo || "").slice(0, 140) })),
        ...pending.map((item) => ({ type: "normal", title: "Correção pendente: " + item.titulo, text: "Sua entrega está aguardando o retorno do professor." }))
      ];
      if (!items.length) list.append(card("Tudo em dia! ✨", ["Nenhum prazo próximo, mensagem não lida ou entrega aguardando correção."], "notification-card success"));
      else items.slice(0, 30).forEach((item) => list.append(card(item.title, [item.text], item.type === "warning" ? "notification-card warning" : "notification-card")));
      status.textContent = items.length ? items.length + " aviso(s) encontrado(s)." : "Nenhuma notificação pendente.";
    } catch (error) { status.textContent = error.message; }
  }
  $("#refresh-notifications")?.addEventListener("click", loadNotifications);

  function applyAccessibility() {
    let scale = 0;
    try { scale = Number(localStorage.getItem("aprimore.textScale") || 0); } catch { scale = 0; }
    if (![-1, 0, 1].includes(scale)) scale = 0;
    const contrast = localStorage.getItem("aprimore.highContrast") === "true";
    const reduced = localStorage.getItem("aprimore.reduceMotion") === "true";
    document.body.classList.toggle("text-scale-small", scale === -1);
    document.body.classList.toggle("text-scale-large", scale === 1);
    document.body.classList.toggle("high-contrast", contrast);
    document.body.classList.toggle("reduce-motion", reduced);
    $("#high-contrast-toggle").checked = contrast;
    $("#reduced-motion-toggle").checked = reduced;
    $("#text-size-status").textContent = scale === -1 ? "Texto reduzido." : scale === 1 ? "Texto ampliado." : "Tamanho padrão.";
  }
  function changeScale(value) {
    let scale = 0;
    try { scale = Number(localStorage.getItem("aprimore.textScale") || 0); } catch { scale = 0; }
    scale = value === "reset" ? 0 : Math.max(-1, Math.min(1, scale + value));
    try { localStorage.setItem("aprimore.textScale", String(scale)); } catch { /* Preferência válida nesta sessão. */ }
    applyAccessibility();
  }
  $("#text-smaller")?.addEventListener("click", () => changeScale(-1));
  $("#text-larger")?.addEventListener("click", () => changeScale(1));
  $("#text-normal")?.addEventListener("click", () => changeScale("reset"));
  $("#high-contrast-toggle")?.addEventListener("change", (event) => {
    try { localStorage.setItem("aprimore.highContrast", String(event.currentTarget.checked)); } catch { /* Preferência válida nesta sessão. */ }
    applyAccessibility();
  });
  $("#reduced-motion-toggle")?.addEventListener("change", (event) => {
    try { localStorage.setItem("aprimore.reduceMotion", String(event.currentTarget.checked)); } catch { /* Preferência válida nesta sessão. */ }
    applyAccessibility();
  });

  async function loadAudit() {
    const section = $("#audit-section"), status = $("#audit-status"), list = $("#audit-list");
    if (!section || !status || !list) return;
    try {
      const me = await apiGet("/api/auth/me");
      section.hidden = !["ADMIN", "CEO"].includes(me.perfil);
      if (section.hidden) return;
      const entries = await apiGet("/api/auditoria");
      list.replaceChildren();
      entries.forEach((entry) => list.append(card(entry.acao, [
        "Responsável: " + (entry.usuarioNome || "Conta removida"),
        "Recurso: " + entry.entidade + (entry.entidadeId ? " #" + entry.entidadeId : ""),
        "Data: " + (entry.criadoEm ? new Date(entry.criadoEm.replace(" ", "T")).toLocaleString("pt-BR") : "Indisponível"),
        "Origem: " + (entry.ipOrigem || "Não disponível")
      ])));
      status.textContent = entries.length ? entries.length + " evento(s) recente(s)." : "Nenhuma alteração registrada ainda. As próximas operações bem-sucedidas serão registradas.";
    } catch { section.hidden = true; }
  }

  renderScores();
  startGame("quiz");
  renderCalendar();
  applyAccessibility();
  loadCalendar();
  loadNotifications();
  loadAudit();
})();