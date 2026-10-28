(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const catalog = $("#game-catalog");
  const stage = $("#game-stage");
  if (!catalog || !stage) return;

  const games = [
    {id:"operacoes",title:"Desafio das Operações",emoji:"➕",subject:"Matemática",description:"Resolva contas e suba sua pontuação.",kind:"math"},
    {id:"gramatica",title:"Mestre da Gramática",emoji:"📚",subject:"Português",description:"Pratique ortografia e gramática.",kind:"quiz"},
    {id:"celula",title:"Célula Interativa",emoji:"🔬",subject:"Ciências",description:"Conheça organelas e funções celulares.",kind:"quiz"},
    {id:"labirinto",title:"Labirinto de Lógica",emoji:"🧩",subject:"Raciocínio",description:"Encontre a chave e chegue à saída.",kind:"maze"},
    {id:"global",title:"Explorador Global",emoji:"🌎",subject:"Geografia",description:"Descubra países, capitais e continentes.",kind:"quiz"},
    {id:"estudio",title:"Estúdio Criativo",emoji:"🎨",subject:"Artes",description:"Monte um desenho usando uma paleta de cores.",kind:"paint"},
    {id:"ecossistema",title:"Ecossistema em Equilíbrio",emoji:"🌱",subject:"Ciências",description:"Aprenda sobre cadeias alimentares e biodiversidade.",kind:"quiz"},
    {id:"geometria",title:"Geometria Espacial",emoji:"📐",subject:"Matemática",description:"Explore formas, áreas e sólidos geométricos.",kind:"quiz"},
    {id:"historia",title:"Linha do Tempo: Brasil",emoji:"🏛️",subject:"História",description:"Relembre fatos importantes da história brasileira.",kind:"quiz"},
    {id:"ingles",title:"Vocabulário Ninja",emoji:"🇬🇧",subject:"Inglês",description:"Pratique vocabulário em inglês.",kind:"quiz"},
    {id:"criativo",title:"Desafio Criativo",emoji:"✨",subject:"Criatividade",description:"Resolva desafios de padrões e observação; não exige serviço de IA.",kind:"quiz"},
    {id:"ritmo",title:"Ritmo & Melodia",emoji:"🎵",subject:"Música",description:"Memorize e repita sequências de sons visuais.",kind:"rhythm"},
    {id:"letras",title:"Corrida das Letras",emoji:"🏎️",subject:"Português",description:"Digite palavras corretamente para avançar.",kind:"typing"},
    {id:"memoria",title:"Memória Espacial",emoji:"🌌",subject:"Memória",description:"Encontre todos os pares de símbolos.",kind:"memory"},
    {id:"ninja",title:"Matemática Ninja",emoji:"🥷",subject:"Matemática",description:"Encare 10 contas cada vez mais desafiadoras.",kind:"math"},
    {id:"natureza",title:"Quebra-Cabeça Natural",emoji:"🦋",subject:"Ciências",description:"Responda desafios sobre a natureza.",kind:"quiz"},
    {id:"palavras",title:"Palavra Embaralhada",emoji:"🔤",subject:"Vocabulário",description:"Descubra palavras a partir de letras misturadas.",kind:"words"},
    {id:"quiz",title:"Quiz Relâmpago",emoji:"🧠",subject:"Conhecimentos gerais",description:"Teste conhecimentos em várias matérias.",kind:"quiz"}
  ];
  const questionSets = {
    gramatica:[
      ["Qual palavra está escrita corretamente?",["Excessão","Exceção","Escessão","Eceção"],1,"Exceção é a grafia correta."],
      ["Qual é o plural de papel?",["Papels","Papéis","Papeis","Papezes"],1,"O plural é papéis."],
      ["Qual frase usa pontuação adequada?",["Vamos comer crianças!","Vamos comer, crianças!","Vamos, comer crianças!","Vamos comer crianças"],1,"A vírgula muda o sentido da frase."],
      ["Qual palavra é um adjetivo?",["Correr","Bonito","Mesa","Ontem"],1,"Bonito caracteriza um substantivo."],
      ["Qual é o antônimo de generoso?",["Solidário","Bondoso","Egoísta","Gentil"],2,"Egoísta expressa sentido oposto."]
    ],
    celula:[
      ["Qual estrutura controla as atividades da célula?",["Membrana","Núcleo","Ribossomo","Citoplasma"],1,"O núcleo contém o material genético e coordena atividades celulares."],
      ["Qual organela produz energia para a célula?",["Mitocôndria","Lisossomo","Vacúolo","Parede celular"],0,"A mitocôndria participa da produção de ATP."],
      ["Qual estrutura delimita a célula?",["Membrana plasmática","DNA","Nucléolo","Cromossomo"],0,"A membrana controla a entrada e saída de substâncias."],
      ["Qual organela realiza fotossíntese em plantas?",["Mitocôndria","Cloroplasto","Lisossomo","Ribossomo"],1,"Os cloroplastos contêm clorofila."],
      ["Qual molécula guarda a informação genética?",["Amido","DNA","Água","Glicose"],1,"O DNA contém instruções genéticas."]
    ],
    global:[
      ["Qual é a capital do Brasil?",["Rio de Janeiro","Brasília","Salvador","São Paulo"],1,"Brasília é a capital federal."],
      ["Em qual continente fica o Egito?",["Europa","Ásia","África","Oceania"],2,"A maior parte do território egípcio fica na África."],
      ["Qual é o maior país em extensão territorial?",["Canadá","China","Estados Unidos","Rússia"],3,"A Rússia é o maior país por área."],
      ["Qual oceano banha a costa leste do Brasil?",["Pacífico","Atlântico","Índico","Ártico"],1,"O litoral brasileiro fica no Atlântico."],
      ["Qual é a capital da Argentina?",["Lima","Santiago","Buenos Aires","Montevidéu"],2,"Buenos Aires é a capital argentina."]
    ],
    ecossistema:[
      ["Qual é um produtor numa cadeia alimentar?",["Capim","Leão","Fungo","Gavião"],0,"Plantas produzem alimento usando energia solar."],
      ["O que significa biodiversidade?",["Quantidade de prédios","Variedade de seres vivos","Temperatura do solo","Volume de chuva"],1,"Biodiversidade é a variedade da vida."],
      ["O que pode acontecer quando uma espécie desaparece?",["Nada muda sempre","A cadeia alimentar pode ser afetada","Todos os seres crescem","A água deixa de existir"],1,"Espécies se relacionam no ecossistema."],
      ["Qual atitude ajuda a economizar água?",["Deixar a torneira aberta","Consertar vazamentos","Lavar calçadas com mangueira","Tomar banhos longos"],1,"Consertar vazamentos reduz desperdício."],
      ["Qual destes é um decompositor?",["Fungo","Coelho","Árvore","Águia"],0,"Fungos ajudam a decompor matéria orgânica."]
    ],
    geometria:[
      ["Quantas faces tem um cubo?",["4","6","8","12"],1,"Um cubo tem seis faces quadradas."],
      ["Qual é a fórmula da área de um retângulo?",["Base + altura","Base × altura","2 × base","Base ÷ altura"],1,"A área é base multiplicada pela altura."],
      ["Quantos graus tem um ângulo reto?",["45°","90°","180°","360°"],1,"O ângulo reto mede 90 graus."],
      ["Quantas arestas tem um cubo?",["6","8","12","16"],2,"O cubo tem doze arestas."],
      ["Qual sólido tem uma base circular e um vértice?",["Cubo","Cone","Cilindro","Esfera"],1,"O cone tem base circular e um vértice."]
    ],
    historia:[
      ["Em que ano foi proclamada a Independência do Brasil?",["1500","1822","1889","1922"],1,"A Independência foi proclamada em 1822."],
      ["Quem foi o primeiro imperador do Brasil?",["Dom Pedro I","Dom Pedro II","Getúlio Vargas","Tiradentes"],0,"Dom Pedro I foi o primeiro imperador."],
      ["Em que ano foi proclamada a República no Brasil?",["1822","1888","1889","1930"],2,"A República foi proclamada em 15 de novembro de 1889."],
      ["Qual lei aboliu oficialmente a escravidão no Brasil?",["Lei de Terras","Lei Áurea","Lei do Ventre Livre","Constituição de 1824"],1,"A Lei Áurea foi assinada em 1888."],
      ["Quem era o povo originário do Brasil antes da colonização portuguesa?",["Somente europeus","Diversos povos indígenas","Somente africanos","Nenhum povo"],1,"Muitos povos indígenas já viviam no território."]
    ],
    ingles:[
      ["O que significa 'book'?",["Mesa","Livro","Janela","Caneta"],1,"Book significa livro."],
      ["Como se diz 'bom dia' em inglês?",["Good night","Good morning","Good bye","Good luck"],1,"Good morning é bom dia."],
      ["Qual é o plural de 'child'?",["Childs","Children","Childes","Childrens"],1,"O plural irregular é children."],
      ["O que significa 'water'?",["Fogo","Terra","Água","Ar"],2,"Water significa água."],
      ["Qual palavra significa 'amizade'?",["Friendship","Homework","Window","Morning"],0,"Friendship significa amizade."]
    ],
    criativo:[
      ["Qual elemento completa a sequência: círculo, quadrado, círculo, quadrado, ...?",["Triângulo","Círculo","Estrela","Retângulo"],1,"A sequência alterna círculo e quadrado."],
      ["Você precisa construir uma ponte com poucos materiais. Qual atitude ajuda mais?",["Testar uma estrutura simples","Usar tudo sem planejar","Ignorar o peso","Desistir antes de tentar"],0,"Planejar e testar permite aprender e melhorar."],
      ["Qual combinação forma uma cor secundária?",["Azul + amarelo = verde","Azul + vermelho = amarelo","Verde + amarelo = azul","Vermelho + verde = roxo"],0,"Azul e amarelo formam verde na mistura tradicional de tintas."],
      ["Uma solução não funcionou. Qual é o melhor próximo passo?",["Esconder o erro","Observar, ajustar e tentar de novo","Repetir sem pensar","Culpar outra pessoa"],1,"Aprender com o erro ajuda a melhorar a solução."],
      ["Qual objeto tem simetria aproximada?",["Uma borboleta com asas abertas","Uma nuvem irregular","Uma pedra quebrada","Um galho torto"],0,"As asas de uma borboleta costumam apresentar simetria bilateral."]
    ],
    natureza:[
      ["O que as plantas absorvem do ar para a fotossíntese?",["Oxigênio apenas","Dióxido de carbono","Hélio","Hidrogênio puro"],1,"As plantas usam dióxido de carbono e água na fotossíntese."],
      ["Qual animal é um polinizador importante?",["Abelha","Tubarão","Pinguim","Lobo"],0,"Abelhas transportam pólen entre flores."],
      ["Qual é uma fonte de energia renovável?",["Carvão mineral","Petróleo","Energia solar","Gasolina"],2,"A energia solar vem da luz do Sol."],
      ["Qual ação reduz resíduos?",["Reutilizar materiais","Jogar tudo no rio","Queimar plástico","Desperdiçar alimentos"],0,"Reutilizar reduz a quantidade de lixo."],
      ["Qual ambiente é essencial para muitas espécies marinhas?",["Recife de coral","Deserto seco","Geleira continental apenas","Campo de trigo"],0,"Recifes abrigam uma grande diversidade marinha."]
    ],
    quiz:[
      ["Quanto é 9 × 6?",["42","54","56","63"],1,"9 vezes 6 é 54."],
      ["Qual planeta é conhecido como Planeta Vermelho?",["Vênus","Marte","Júpiter","Saturno"],1,"Marte tem aparência avermelhada."],
      ["Qual é o plural de cidadão?",["Cidadões","Cidadãos","Cidadães","Cidadans"],1,"O plural é cidadãos."],
      ["Quantos lados tem um hexágono?",["5","6","7","8"],1,"Um hexágono tem seis lados."],
      ["Qual órgão bombeia sangue?",["Pulmão","Coração","Estômago","Rim"],1,"O coração bombeia o sangue."]
    ],
    palavras:[
      ["ESCOLA","Lugar onde aprendemos."],["LEITURA","Transforma letras em ideias."],["PLANETA","A Terra é um deles."],
      ["CIENCIA","Investiga o mundo com evidências."],["AMIZADE","Relação de carinho e confiança."],
      ["NATUREZA","Inclui florestas, rios e animais."],["HISTORIA","Estuda acontecimentos do passado."],["MUSICA","Pode ter ritmo e melodia."]
    ]
  };
  const key = "aprimore.jogos.completos.v1";
  let scores = readScores();
  let active = "operacoes";
  let state = null;
  let selectedColor = "#8977ed";
  const colors = ["#8977ed","#ff9b54","#37c992","#56a8ff","#f472b6","#f5f5f5","#111827"];

  function readScores() {
    try { const value = JSON.parse(localStorage.getItem(key) || "{}"); return Object.fromEntries(games.map((game) => [game.id, Number.isFinite(value[game.id]) ? value[game.id] : 0])); }
    catch { return Object.fromEntries(games.map((game) => [game.id, 0])); }
  }
  function saveScores() {
    try { localStorage.setItem(key, JSON.stringify(scores)); } catch { /* A partida funciona mesmo sem salvar recordes. */ }
    renderScores();
  }
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function btn(text, callback, className = "button") {
    const node = el("button", text, className); node.type = "button"; node.addEventListener("click", callback); return node;
  }
  function card(title, lines) {
    const node = el("article", null, "feature-card");
    node.append(el("h3", title)); lines.forEach((line) => node.append(el("p", line))); return node;
  }
  function currentGame() { return games.find((game) => game.id === active) || games[0]; }
  function start(id) {
    active = games.some((game) => game.id === id) ? id : games[0].id;
    const game = currentGame();
    catalog.querySelectorAll("[data-game]").forEach((node) => {
      const selected = node.dataset.game === active;
      node.classList.toggle("active", selected); node.setAttribute("aria-pressed", String(selected));
    });
    if (game.kind === "math") startMath();
    else if (game.kind === "memory") startMemory();
    else if (game.kind === "words") startWords();
    else if (game.kind === "maze") startMaze();
    else if (game.kind === "paint") startPaint();
    else if (game.kind === "rhythm") startRhythm();
    else if (game.kind === "typing") startTyping();
    else startQuiz();
  }
  function buildCatalog() {
    const filter = $("#game-category-filter");
    const subjects = ["Todos", ...new Set(games.map((game) => game.subject))];
    filter.replaceChildren(...subjects.map((subject) => {
      const option = el("option", subject); option.value = subject; return option;
    }));
    function render() {
      catalog.replaceChildren();
      const subject = filter.value || "Todos";
      games.filter((game) => subject === "Todos" || game.subject === subject).forEach((game) => {
        const node = btn("", () => start(game.id), "game-choice");
        node.dataset.game = game.id;
        node.append(el("span", game.emoji, "game-emoji"), el("span", game.title, "game-title"),
          el("span", game.subject + " · " + scores[game.id] + " pts de recorde", "game-subject"),
          el("span", game.description, "game-description"));
        node.setAttribute("aria-pressed", String(game.id === active));
        if (game.id === active) node.classList.add("active");
        catalog.append(node);
      });
    }
    filter.addEventListener("change", render);
    render();
  }
  function renderScores() {
    const target = $("#game-scores"); if (!target) return;
    target.replaceChildren();
    games.forEach((game) => target.append(card(game.emoji + " " + game.title, ["Recorde: " + scores[game.id] + " ponto(s)."])));
    const summary = $("#games-summary");
    if (summary) summary.textContent = "18 jogos disponíveis. Recordes salvos neste dispositivo: " + Object.values(scores).reduce((sum, value) => sum + value, 0) + " ponto(s).";
    catalog.querySelectorAll("[data-game]").forEach((node) => {
      const item = games.find((game) => game.id === node.dataset.game);
      const subtitle = node.querySelector(".game-subject");
      if (item && subtitle) subtitle.textContent = item.subject + " · " + scores[item.id] + " pts de recorde";
    });
  }
  function setStage(title, description) {
    stage.replaceChildren(el("h3", title));
    if (description) stage.append(el("p", description));
  }
  function stats(values) { stage.append(el("div", values.join("   ·   "), "game-stat-row")); }
  function finish(points, message) {
    scores[active] = Math.max(scores[active] || 0, points); saveScores();
    setStage("Desafio concluído! 🎉", message);
    stage.append(el("p", "Pontuação desta rodada: " + points + " ponto(s)."), el("p", "Seu recorde: " + scores[active] + " ponto(s)."), btn("Jogar novamente", () => start(active)));
  }
  function startQuiz() {
    const set = questionSets[active] || questionSets.quiz;
    state = { questions: [...set].sort(() => Math.random() - 0.5), index: 0, points: 0, answered: false };
    showQuestion();
  }
  function showQuestion() {
    const s = state;
    if (s.index >= s.questions.length) return finish(s.points, "Você respondeu a todas as perguntas.");
    const [question, options, answer, explanation] = s.questions[s.index];
    setStage(currentGame().title, "Pergunta " + (s.index + 1) + " de " + s.questions.length);
    stats(["Pontos: " + s.points, "Acerto vale 10 pontos"]);
    stage.append(el("p", question, "game-question"));
    const grid = el("div", null, "game-answer-grid");
    options.forEach((option, index) => grid.append(btn(option, () => {
      if (s.answered) return;
      s.answered = true;
      const correct = index === answer; if (correct) s.points += 10;
      grid.querySelectorAll("button").forEach((item) => { item.disabled = true; });
      const feedback = el("p", (correct ? "Correto! " : "Vamos aprender: ") + explanation, "game-feedback");
      feedback.style.color = correct ? "var(--green)" : "var(--orange)";
      stage.append(feedback, btn(s.index === s.questions.length - 1 ? "Ver resultado" : "Próxima pergunta", () => { s.index++; s.answered = false; showQuestion(); }));
    }, "game-answer")));
    stage.append(grid);
  }
  function startMath() { state = {round:0,points:0,locked:false}; showMathQuestion(); }
  function showMathQuestion() {
    const s = state; if (s.round >= 10) return finish(s.points, "Você concluiu as 10 contas.");
    const level = Math.min(20, 5 + s.round * 2);
    const a = 1 + Math.floor(Math.random() * level), b = 1 + Math.floor(Math.random() * level);
    const ops = ["+", "−", "×"], op = ops[Math.floor(Math.random() * (s.round < 3 ? 2 : 3))];
    s.answer = op === "+" ? a + b : op === "−" ? Math.max(a,b) - Math.min(a,b) : a*b;
    const expression = op === "−" ? Math.max(a,b) + " − " + Math.min(a,b) : a + " " + op + " " + b;
    s.locked = false; setStage(currentGame().title, "Resolva 10 contas. A dificuldade aumenta aos poucos.");
    stats(["Rodada " + (s.round+1) + "/10", "Pontos: " + s.points]);
    stage.append(el("p", expression + " = ?", "game-question"));
    const form = el("form", null, "game-math-form"), field = el("div", null, "field");
    const label = el("label", "Sua resposta"); label.htmlFor = "answer-math";
    const input = el("input"); input.id = "answer-math"; input.type = "number"; input.required = true; input.step = "1"; input.autocomplete = "off";
    const message = el("p", "", "game-feedback"), submit = el("button", "Conferir", "button"); submit.type = "submit";
    field.append(label,input); form.append(field,submit,message);
    form.addEventListener("submit", (event) => {
      event.preventDefault(); if (s.locked) return; s.locked = true;
      const correct = Number(input.value) === s.answer; if (correct) s.points += 10;
      message.textContent = correct ? "Isso mesmo! +10 pontos." : "A resposta correta é " + s.answer + ".";
      message.style.color = correct ? "var(--green)" : "var(--orange)"; submit.disabled = true;
      form.append(btn(s.round === 9 ? "Ver resultado" : "Próxima conta", () => { s.round++; showMathQuestion(); }));
    });
    stage.append(form); input.focus();
  }
  function startMemory() {
    const symbols = ["📚","🌎","🧩","🎨","🚀","🎵","🌱","🔬"];
    const deck = [...symbols,...symbols].map((symbol,index)=>({symbol,id:index,matched:false,revealed:false}));
    for (let i=deck.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    state = {deck,first:null,locked:false,moves:0,matches:0}; renderMemory();
  }
  function renderMemory() {
    const s=state; setStage(currentGame().title,"Encontre os oito pares de símbolos.");
    stats(["Pares: "+s.matches+"/8","Tentativas: "+s.moves]);
    const board=el("div",null,"memory-board");
    s.deck.forEach((item,index)=>{
      const tile=btn(item.matched||item.revealed?item.symbol:"?",()=>{
        if(s.locked||item.matched||item.revealed)return;
        item.revealed=true; tile.textContent=item.symbol;
        if(s.first===null){s.first=index;return;}
        s.moves++; const first=s.deck[s.first];
        if(first.symbol===item.symbol){
          first.matched=item.matched=true; first.revealed=item.revealed=true; s.matches++; s.first=null;
          if(s.matches===8){renderMemory();return finish(Math.max(0,100-(s.moves-8)*5),"Você encontrou todos os pares em "+s.moves+" tentativas.");}
          renderMemory();
        } else {
          s.locked=true;
          const stat=stage.querySelector(".game-stat-row"); if(stat)stat.textContent="Pares: "+s.matches+"/8 · Tentativas: "+s.moves;
          setTimeout(()=>{if(state!==s)return;first.revealed=false;item.revealed=false;s.first=null;s.locked=false;renderMemory();},800);
        }
      },"memory-tile");
      tile.setAttribute("aria-label",item.matched||item.revealed?item.symbol:"Carta fechada");
      if(item.matched)tile.classList.add("matched"); tile.disabled=item.matched; board.append(tile);
    });
    stage.append(board,btn("Reiniciar memória",startMemory));
  }
  function startWords() {
    const words=[["ESCOLA","Lugar onde aprendemos."],["LEITURA","Transforma letras em ideias."],["PLANETA","A Terra é um deles."],["CIENCIA","Investiga o mundo com evidências."],["AMIZADE","Relação de carinho e confiança."],["NATUREZA","Inclui florestas, rios e animais."],["HISTORIA","Estuda o passado."],["MUSICA","Tem ritmo e melodia."]];
    state={words:words.sort(()=>Math.random()-.5).slice(0,6),index:0,points:0,locked:false}; showWord();
  }
  function showWord() {
    const s=state;if(s.index>=s.words.length)return finish(s.points,"Você concluiu o desafio de palavras.");
    const [word,hint]=s.words[s.index], letters=word.split("");
    for(let i=letters.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[letters[i],letters[j]]=[letters[j],letters[i]];}
    if(letters.join("")===word)letters.reverse();
    s.locked=false;setStage(currentGame().title,"Organize as letras e use a dica.");
    stats(["Palavra "+(s.index+1)+"/6","Pontos: "+s.points]);
    stage.append(el("p",letters.join(" · "),"game-question"),el("p","Dica: "+hint));
    const form=el("form",null,"game-word-form"),field=el("div",null,"field"),label=el("label","Sua resposta");
    label.htmlFor="word-answer";const input=el("input");input.id="word-answer";input.required=true;input.autocomplete="off";
    const message=el("p","","game-feedback"),submit=el("button","Conferir palavra","button");submit.type="submit";
    field.append(label,input);form.append(field,submit,message);
    form.addEventListener("submit",(event)=>{
      event.preventDefault();if(s.locked)return;s.locked=true;
      const value=input.value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toUpperCase(),correct=value===word;
      if(correct)s.points+=10;
      message.textContent=correct?"Acertou! +10 pontos.":"A palavra era "+word+".";message.style.color=correct?"var(--green)":"var(--orange)";submit.disabled=true;
      form.append(btn(s.index===s.words.length-1?"Ver resultado":"Próxima palavra",()=>{s.index++;showWord();}));
    });
    stage.append(form);input.focus();
  }
  function startTyping() {
    const words=["aprendizagem","curiosidade","conhecimento","descoberta","criatividade","biblioteca","experimento","imaginação"];
    state={words:words.sort(()=>Math.random()-.5).slice(0,6),index:0,points:0,locked:false};showTyping();
  }
  function showTyping() {
    const s=state;if(s.index>=s.words.length)return finish(s.points,"Você completou a corrida de letras.");
    const word=s.words[s.index];s.locked=false;setStage(currentGame().title,"Digite cada palavra sem copiar e colecione pontos.");
    stats(["Palavra "+(s.index+1)+"/6","Pontos: "+s.points]);
    stage.append(el("p",word,"game-question"));
    const form=el("form",null,"game-word-form"),field=el("div",null,"field"),label=el("label","Digite a palavra acima");
    label.htmlFor="typing-answer";const input=el("input");input.id="typing-answer";input.autocomplete="off";input.required=true;
    const message=el("p","","game-feedback"),submit=el("button","Avançar","button");submit.type="submit";
    field.append(label,input);form.append(field,submit,message);
    form.addEventListener("submit",(event)=>{event.preventDefault();if(s.locked)return;s.locked=true;
      const correct=input.value.trim().toLocaleLowerCase("pt-BR")===word;
      if(correct)s.points+=10;message.textContent=correct?"Palavra correta! +10 pontos.":"Confira a escrita: "+word+".";
      message.style.color=correct?"var(--green)":"var(--orange)";submit.disabled=true;
      form.append(btn(s.index===s.words.length-1?"Ver resultado":"Próxima palavra",()=>{s.index++;showTyping();}));
    });
    stage.append(form);input.focus();
  }
  function startMaze() {
    state={x:0,y:0,key:false,steps:0,done:false};
    state.walls=new Set(["0,2","1,2","3,1","3,2","2,4"]);
    renderMaze();
  }
  function renderMaze() {
    const s=state;setStage(currentGame().title,"Encontre a chave 🔑 e depois alcance a saída 🏁. Use os botões direcionais.");
    stats(["Passos: "+s.steps,"Chave: "+(s.key?"encontrada":"faltando")]);
    const board=el("div",null,"maze-board");
    for(let y=0;y<5;y++)for(let x=0;x<5;x++){
      const pos=x+","+y,cell=el("div",null,"maze-cell");
      if(s.walls.has(pos))cell.classList.add("wall");
      if(s.x===x&&s.y===y)cell.textContent="🧑";
      else if(x===2&&y===2&&!s.key)cell.textContent="🔑";
      else if(x===4&&y===4)cell.textContent="🏁";
      else if(s.walls.has(pos))cell.textContent="■";
      board.append(cell);
    }
    const controls=el("div",null,"maze-controls");
    controls.append(el("span"),btn("↑",()=>moveMaze(0,-1)),el("span"),
      btn("←",()=>moveMaze(-1,0)),btn("↓",()=>moveMaze(0,1)),btn("→",()=>moveMaze(1,0)));
    stage.append(board,controls,btn("Reiniciar labirinto",startMaze));
  }
  function moveMaze(dx,dy) {
    const s=state;if(s.done)return;
    const x=s.x+dx,y=s.y+dy;
    if(x<0||x>4||y<0||y>4||s.walls.has(x+","+y))return;
    s.x=x;s.y=y;s.steps++;
    if(x===2&&y===2)s.key=true;
    if(x===4&&y===4){
      if(s.key){s.done=true;renderMaze();return finish(Math.max(10,100-s.steps*3),"Você encontrou a chave e escapou em "+s.steps+" passos.");}
      s.x-=dx;s.y-=dy;s.steps--;
      const status=stage.querySelector(".game-stat-row");if(status)status.textContent="Você precisa encontrar a chave antes da saída.";
      return;
    }
    renderMaze();
  }
  function startPaint() {
    state={painted:0,cells:Array(25).fill("#f5f5f5")};selectedColor=colors[0];renderPaint();
  }
  function renderPaint() {
    const s=state;setStage(currentGame().title,"Escolha uma cor e pinte os quadrados para criar um mosaico.");
    stats(["Quadrados pintados: "+s.painted+"/25"]);
    const palette=el("div",null,"paint-palette");
    colors.forEach((color)=>{const item=btn("",()=>{selectedColor=color;palette.querySelectorAll("button").forEach((node)=>node.setAttribute("aria-pressed",String(node.dataset.color===color)));},"paint-color");item.style.backgroundColor=color;item.dataset.color=color;item.setAttribute("aria-label","Selecionar cor");item.setAttribute("aria-pressed",String(selectedColor===color));palette.append(item);});
    const board=el("div",null,"paint-board");
    s.cells.forEach((color,index)=>{const cell=btn("",()=>{if(s.cells[index]===selectedColor)return;s.cells[index]=selectedColor;s.painted=s.cells.filter((value)=>value!=="#f5f5f5").length;cell.style.backgroundColor=selectedColor;const stat=stage.querySelector(".game-stat-row");if(stat)stat.textContent="Quadrados pintados: "+s.painted+"/25";},"paint-cell");cell.style.backgroundColor=color;cell.setAttribute("aria-label","Quadrado "+(index+1));board.append(cell);});
    stage.append(palette,board,btn("Finalizar desenho",()=>finish(s.painted*4,"Sua arte foi finalizada. Você pode voltar e criar outro mosaico.")),btn("Limpar tela",startPaint));
  }
  function startRhythm() {state={sequence:[],round:0,points:0,showing:false};nextRhythmRound();}
  function nextRhythmRound() {
    const s=state;if(s.round>=6)return finish(s.points,"Você repetiu as sequências musicais.");
    const pads=["🔵","🟣","🟢","🟠"];if(s.sequence.length<=s.round)s.sequence.push(pads[Math.floor(Math.random()*pads.length)]);
    s.input=[];s.showing=true;setStage(currentGame().title,"Observe a sequência e repita tocando nas cores na mesma ordem.");
    stats(["Rodada "+(s.round+1)+"/6","Pontos: "+s.points]);
    const sequence=el("div",null,"rhythm-sequence");sequence.id="rhythm-sequence";sequence.textContent="Observe: "+s.sequence.join(" ");stage.append(sequence);
    const controls=el("div",null,"game-answer-grid");
    pads.forEach((pad,index)=>controls.append(btn(pad,()=>{if(s.showing)return;s.input.push(pad);
      const correct=s.input.every((value,i)=>value===s.sequence[i]);
      if(!correct){s.showing=true;const message=el("p","Sequência incorreta. Vamos tentar outra vez!","game-feedback");message.style.color="var(--orange)";stage.append(message,btn("Tentar novamente",()=>{s.sequence=[];s.round=0;s.points=0;nextRhythmRound();}));return;}
      if(s.input.length===s.sequence.length){s.points+=10;s.round++;s.showing=true;const message=el("p","Perfeito! Sequência concluída.","game-feedback");stage.append(message,btn(s.round===6?"Ver resultado":"Próxima sequência",nextRhythmRound));}
      else sequence.textContent="Sua sequência: "+s.input.join(" ");
    },"rhythm-pad")));
    stage.append(controls,btn("Começar a repetir",()=>{s.showing=false;sequence.textContent="Sua vez! Repita a sequência."; }));
  }

  const reset=$("#reset-games");
  if(reset){const replacement=reset.cloneNode(true);reset.replaceWith(replacement);replacement.addEventListener("click",()=>{if(!confirm("Apagar os recordes de todos os jogos neste dispositivo?"))return;scores=Object.fromEntries(games.map((game)=>[game.id,0]));saveScores();start(active);});}
  buildCatalog();
  renderScores();
  start(active);
})();