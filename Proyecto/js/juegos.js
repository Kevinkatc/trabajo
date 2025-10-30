/* juegos.js - lógica completa de 5 juegos */
(() => {
  // ---------- elementos UI ----------
  const container = document.getElementById('game-container');
  const hud = document.getElementById('scoreHUD');
  const toastRoot = document.getElementById('toast-root');
  const scoreListEl = document.getElementById('scoreList');

  // ---------- estado global ----------
  const STORAGE_KEY = 'hw_highscores_v1';
  let highs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const activeTimers = []; // para limpiar timers al cambiar de juego
  let currentGame = null;

  // ---------- utilidades ----------
  function clearActive() {
    // limpiar timers
    while (activeTimers.length) clearInterval(activeTimers.pop());
    // vaciar contenedor
    container.innerHTML = '<div class="placeholder">🎮 Seleccioná un juego para empezar</div>';
    // limpiar overlay svg si existe
    const ov = container.querySelector('.match-overlay');
    if (ov) ov.remove();
    currentGame = null;
  }

  function saveHigh(game, score) {
    if (!highs[game] || score > highs[game]) {
      highs[game] = score;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(highs));
      showToast(`🎉 Nuevo récord en ${game}: ${score} pts`);
      renderHUD();
    }
  }

  function renderHUD() {
    hud.innerHTML = `<h4>🏆 Records</h4><ul>` +
      ['Quiz','Memotest','ArmarPC','Matching','Ahorcado'].map(k => {
        const val = highs[k] || 0;
        return `<li>${k}: ${val} pts</li>`;
      }).join('') + `</ul>`;
    // también en la sección historial (opcional)
    if (scoreListEl) {
      scoreListEl.innerHTML = Object.keys(highs).length ? 
        Object.keys(highs).map(g => `<li>${g}: ${highs[g]} pts</li>`).join('') : '<li>No hay records aún</li>';
    }
  }

  function showToast(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    toastRoot.appendChild(t);
    // enter
    requestAnimationFrame(() => t.classList.add('show'));
    // remove
    setTimeout(() => { t.classList.remove('show'); setTimeout(()=>t.remove(), 300); }, 3200);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---------- manejar cambio de juego ----------
  document.querySelectorAll('.game-btn').forEach(b => {
    b.addEventListener('click', () => {
      const g = b.dataset.game;
      loadGame(g);
    });
  });

  function loadGame(name) {
    clearActive();
    switch (name) {
      case 'quiz': startQuiz(); break;
      case 'memotest': startMemo(); break;
      case 'dragdrop': startDragDrop(); break;
      case 'match': startMatch(); break;
      case 'hangman': startHangman(); break;
      default: break;
    }
  }

  // ===================== QUIZ =====================
  function startQuiz() {
    currentGame = 'Quiz';
    const questions = [
      { q: "¿Qué componente procesa gráficos?", opts:["CPU","GPU","PSU","RAM"], a:1 },
      { q: "¿Qué significa NVMe?", opts:["Non-Volatile Memory express","Network Video Memory","New Video Memory","None"], a:0 },
      { q: "¿Qué guarda la CMOS?", opts:["Configuración BIOS","Imágenes","Controladores","Sistemas operativos"], a:0 },
      { q: "¿Cuál interfaz es rápida para SSD?", opts:["SATA","PCIe NVMe","IDE","USB 2.0"], a:1 },
      { q: "¿Qué mide la frecuencia de la RAM?", opts:["GB","MHz","Cores","Watt"], a:1 },
      { q: "¿Qué convierte la PSU?", opts:["Energía AC a DC","Señales de vídeo","Datos","Temperatura"], a:0 },
      { q: "¿Qué elemento mejora overclock?", opts:["Mejor refrigeración","Peor refrigeración","Menos RAM","Menos GPU"], a:0 },
      { q: "¿Cuál es una unidad no volátil?", opts:["RAM","VRAM","SSD","Cache L1"], a:2 }
    ];
    shuffle(questions);
    let idx = 0, score = 0, perQuestionTime = 30, timerId = null;

    // DOM
    const wrap = document.createElement('div');
    wrap.className = 'quiz-wrap';
    wrap.innerHTML = `<h3>Quiz avanzado</h3>
      <div id="qmeta"><span id="qcount"></span> — <span class="quiz-timer" id="qtimer"></span></div>
      <div id="qtext" style="margin-top:8px;font-weight:700"></div>
      <div id="qopts" class="quiz-options"></div>
      <div id="qfeedback" style="margin-top:10px;color:#9fbdd6"></div>`;
    container.appendChild(wrap);

    const qtext = wrap.querySelector('#qtext');
    const qopts = wrap.querySelector('#qopts');
    const qcount = wrap.querySelector('#qcount');
    const qtimer = wrap.querySelector('#qtimer');
    const qfeedback = wrap.querySelector('#qfeedback');

    function startTimer() {
      let t = perQuestionTime;
      qtimer.textContent = `Tiempo: ${t}s`;
      timerId = setInterval(() => {
        t--;
        qtimer.textContent = `Tiempo: ${t}s`;
        if (t <= 0) {
          clearInterval(timerId);
          handleAnswer(-1); // timeout => incorrect
        }
      }, 1000);
      activeTimers.push(timerId);
    }

    function renderQuestion() {
      qfeedback.textContent = '';
      qcount.textContent = `Pregunta ${idx+1} / ${questions.length}`;
      const it = questions[idx];
      qtext.textContent = it.q;
      qopts.innerHTML = '';
      // shuffle options but keep index mapping
      const optsMap = it.opts.map((o,i) => ({o,i}));
      shuffle(optsMap);
      optsMap.forEach(({o,i}) => {
        const btn = document.createElement('button');
        btn.textContent = o;
        btn.onclick = () => {
          clearInterval(timerId);
          handleAnswer(i, btn);
        };
        qopts.appendChild(btn);
      });
      startTimer();
    }

    function handleAnswer(selectedIndex, btnEl) {
      // selectedIndex === -1 means timeout => incorrect
      const it = questions[idx];
      const correctIndex = it.a;
      // find button corresponding to correct index
      const buttons = Array.from(qopts.querySelectorAll('button'));
      // highlight correct and incorrect
      buttons.forEach(b => {
        // identify which option index was used for this button
        const text = b.textContent;
        if (text === it.opts[correctIndex]) b.classList.add('correct');
      });
      if (selectedIndex === correctIndex) {
        score += 25; // premio fuerte
        if (btnEl) btnEl.classList.add('correct');
        qfeedback.textContent = "¡Correcto! +" + 25;
      } else {
        // marcar elegido (si existe)
        if (selectedIndex !== -1 && btnEl) btnEl.classList.add('incorrect');
        qfeedback.textContent = "Incorrecto. Exp: " + (it.exp || "Revisá la respuesta");
        // penalización suave
        score = Math.max(0, score - 7);
      }

      // avanzar
      idx++;
      setTimeout(() => {
        buttons.forEach(b => b.disabled = true);
        if (idx < questions.length) {
          renderQuestion();
        } else {
          finishQuiz();
        }
      }, 700);
    }

    function finishQuiz() {
      clearInterval(timerId);
      // mostrar resultado
      const res = document.createElement('div');
      res.style.marginTop = '12px';
      res.innerHTML = `<strong>Quiz finalizado</strong> — Puntaje: ${score} pts`;
      wrap.appendChild(res);
      saveHighAndRender('Quiz', score);
    }

    // iniciar
    renderQuestion();
  }

  // ===================== MEMOTEST =====================
  function startMemo() {
  currentGame = 'Memotest';
  const pairs = [
    { id: 'cpu', img: 'https://plus.unsplash.com/premium_photo-1681426698212-53e47fec9a2c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3B1fGVufDB8fDB8fHww' },
    { id: 'gpu', img: 'https://www.adslzone.net/app/uploads-adslzone.net/2022/04/GPU.jpg' },
    { id: 'ram', img: 'https://periodicodelomasvendido.com/wp-content/uploads/2023/12/Compatibilidad-de-la-memoria-RAM-de-tu-PC.jpg' },
    { id: 'ssd', img: 'https://img.freepik.com/fotos-premium/disco-unidades-estado-solido-ssd-fondo-negro_505080-2810.jpghttps://img.freepik.com/fotos-premium/disco-unidades-estado-solido-ssd-fondo-negro_505080-2810.jpg' },
    { id: 'hdd', img: 'https://previews.123rf.com/images/luzazure/luzazure2308/luzazure230877637/211930255-computer-hard-disk-drive-on-black-background-3d-render-illustration.jpg' },
    { id: 'psu', img: 'https://thumbs.dreamstime.com/b/cougar-gex-m%C3%A1s-psu-y-cable-de-alimentaci%C3%B3n-con-certificaci%C3%B3n-oro-en-un-fondo-oscuro-w-unidad-modular-impecable-varna-bulgaria-207311917.jpg' }
  ];

  let cards = pairs.concat(pairs).map((c, i) => ({ ...c, uid: i }));
  shuffle(cards);

  let first = null, matched = 0, attempts = 20;

  const wrap = document.createElement('div');
  wrap.innerHTML = `<h3>Memotest</h3><p>Intentos: <span id="memo-attempts">${attempts}</span></p>`;
  const grid = document.createElement('div');
  grid.className = 'memo-grid';
  wrap.appendChild(grid);
  container.appendChild(wrap);

  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = 'flip-card';
    el.innerHTML = `
      <div class="flip-inner">
        <div class="flip-front">?</div>
        <div class="flip-back"><img src="${card.img}" alt="${card.id}"></div>
      </div>`;
    grid.appendChild(el);

    el.addEventListener('click', () => {
      const inner = el.querySelector('.flip-inner');
      if (inner.classList.contains('flipped') || el.classList.contains('matched') || attempts <= 0) return;
      inner.classList.add('flipped');

      if (!first) {
        first = { el, id: card.id };
      } else {
        if (first.id === card.id) {
          el.classList.add('matched');
          first.el.classList.add('matched');
          matched++;
          first = null;
        } else {
          attempts--;
          wrap.querySelector('#memo-attempts').textContent = attempts;
          setTimeout(() => {
            inner.classList.remove('flipped');
            first.el.querySelector('.flip-inner').classList.remove('flipped');
            first = null;
          }, 700);
        }
      }
    });
  });
}

  // ===================== MATCHING =====================
  function startMatch() {
    currentGame = 'Matching';
    const pairs = [
      {k:'CPU', v:'Procesador central'},
      {k:'GPU', v:'Tarjeta gráfica'},
      {k:'RAM', v:'Memoria temporal'},
      {k:'SSD', v:'Almacenamiento rápido'},
      {k:'PSU', v:'Fuente de alimentación'},
      {k:'MOTHER', v:'Placa madre'}
    ];
    // crear overlay svg para líneas
    const svgNS = "http://www.w3.org/2000/svg";
    const overlay = document.createElementNS(svgNS, 'svg');
    overlay.setAttribute('class','match-overlay');
    overlay.setAttribute('width','100%');
    overlay.setAttribute('height','100%');
    overlay.style.position = 'absolute';
    overlay.style.left = 0; overlay.style.top = 0; overlay.style.pointerEvents = 'none';
    // wrapper
    const wrap = document.createElement('div');
    wrap.innerHTML = `<h3>Matching</h3><p>Une el componente con su descripción.</p>`;
    const cols = document.createElement('div');
    cols.className = 'match-columns';
    const leftCol = document.createElement('div'); leftCol.className='match-column';
    const rightCol = document.createElement('div'); rightCol.className='match-column';
    cols.appendChild(leftCol); cols.appendChild(rightCol);
    wrap.appendChild(cols);
    container.appendChild(wrap);
    container.appendChild(overlay);

    // left terms in order, right values randomized
    const leftItems = pairs.map(p=>p.k);
    const rightItems = shuffle(pairs.map(p=>p.v).slice());

    // create cards
    leftItems.forEach(t => {
      const c = document.createElement('div');
      c.className = 'match-card';
      c.textContent = t;
      leftCol.appendChild(c);
    });
    rightItems.forEach(v => {
      const c = document.createElement('div');
      c.className = 'match-card';
      c.textContent = v;
      rightCol.appendChild(c);
    });

    // matching logic
    let first = null, matched = 0, attempts = 0;
    function getPairValue(key) {
      const p = pairs.find(x => x.k === key);
      return p ? p.v : null;
    }

    // add listeners
    leftCol.querySelectorAll('.match-card').forEach(el => {
      el.addEventListener('click', () => {
        if (first && first.side === 'left') {
          // same side, replace
          first.el.style.background = '';
          first = null;
        } else {
          if (first && first.side === 'right') {
            // compare right->left
            const leftKey = el.textContent;
            const rightVal = first.el.textContent;
            checkMatch(first.el, el, rightVal, leftKey);
            first.el.style.background = '';
            first = null;
          } else {
            el.style.background = '#0a2f44';
            first = { side:'left', el };
          }
        }
      });
    });
    rightCol.querySelectorAll('.match-card').forEach(el => {
      el.addEventListener('click', () => {
        if (first && first.side === 'right') {
          first.el.style.background = '';
          first = null;
        } else {
          if (first && first.side === 'left') {
            // compare left->right
            const leftKey = first.el.textContent;
            const rightVal = el.textContent;
            checkMatch(first.el, el, rightVal, leftKey);
            first.el.style.background = '';
            first = null;
          } else {
            el.style.background = '#0a2f44';
            first = { side:'right', el };
          }
        }
      });
    });

    function checkMatch(elA, elB, rightVal, leftKey) {
      attempts++;
      const correct = getPairValue(leftKey) === rightVal;
      if (correct) {
        // lock them
        elA.style.pointerEvents = 'none';
        elB.style.pointerEvents = 'none';
        elA.style.background = '#9fffbf';
        elB.style.background = '#9fffbf';
        matched++;
        // draw animated line between centers (svg)
        drawLineBetween(elA, elB, overlay);
        if (matched === pairs.length) {
          const score = Math.max(20, 80 - attempts*3); // menos intentos => mayor score
          const res = document.createElement('div');
          res.style.marginTop='10px';
          res.innerHTML = `<strong>Matching completado</strong> — Puntaje: ${score} pts`;
          wrap.appendChild(res);
          saveHighAndRender('Matching', score);
        }
      } else {
        // small feedback
        elA.classList.add('bounce'); elB.classList.add('bounce');
        setTimeout(()=>{ elA.classList.remove('bounce'); elB.classList.remove('bounce'); },700);
        showToast('No coinciden');
      }
    }

    function drawLineBetween(a, b, svg) {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      const ax = aRect.left + aRect.width/2 - parentRect.left;
      const ay = aRect.top + aRect.height/2 - parentRect.top;
      const bx = bRect.left + bRect.width/2 - parentRect.left;
      const by = bRect.top + bRect.height/2 - parentRect.top;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', ax); line.setAttribute('y1', ay);
      line.setAttribute('x2', ax); line.setAttribute('y2', ay);
      line.setAttribute('stroke', '#16ffc1'); line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-linecap','round');
      svg.appendChild(line);
      // animate to target
      setTimeout(()=> {
        line.setAttribute('x2', bx);
        line.setAttribute('y2', by);
        line.style.transition = 'all .6s ease';
      },20);
    }
  }

  // ===================== AHORCADO =====================
  function startHangman() {
  currentGame = 'Ahorcado';
  const words = ['MICROPROCESADOR','ALMACENAMIENTO','TARJETAMADRE','REFRIGERACION','INTERFAZPCIEXPRESS'];
  const word = words[Math.floor(Math.random()*words.length)];
  let revealed = Array(word.length).fill('_');
  const maxWrong = 7;
  let wrong = 0;

  // contenedor principal
  const wrap = document.createElement('div');
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.gap = "12px";

  // SVG hangman (tamaño original)
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS,'svg');
  svg.className = 'hang-svg';
  svg.setAttribute('viewBox','0 0 120 150'); 
  svg.style.display = "block";
  svg.style.margin = "0 auto";

  // scaffold
  const base = document.createElementNS(svgNS,'line');
  base.setAttribute('x1',10);
  base.setAttribute('y1',120);
  base.setAttribute('x2',100);
  base.setAttribute('y2',120);
  base.setAttribute('stroke','#7cf5ff');
  base.setAttribute('stroke-width','2');
  svg.appendChild(base);

  const pole = document.createElementNS(svgNS,'line');
  pole.setAttribute('x1',20);
  pole.setAttribute('y1',120);
  pole.setAttribute('x2',20);
  pole.setAttribute('y2',20);
  pole.setAttribute('stroke','#7cf5ff');
  pole.setAttribute('stroke-width','2');
  svg.appendChild(pole);

  const arm = document.createElementNS(svgNS,'line');
  arm.setAttribute('x1',20);
  arm.setAttribute('y1',20);
  arm.setAttribute('x2',70);
  arm.setAttribute('y2',20);
  arm.setAttribute('stroke','#7cf5ff');
  arm.setAttribute('stroke-width','2');
  svg.appendChild(arm);

  const rope = document.createElementNS(svgNS,'line');
  rope.setAttribute('x1',70);
  rope.setAttribute('y1',20);
  rope.setAttribute('x2',70);
  rope.setAttribute('y2',40);
  rope.setAttribute('stroke','#7cf5ff');
  rope.setAttribute('stroke-width','2');
  svg.appendChild(rope);

  // partes del personaje
  const parts = [];
  const head = document.createElementNS(svgNS,'circle');
  head.setAttribute('cx',70);
  head.setAttribute('cy',50);
  head.setAttribute('r',10);
  head.setAttribute('class','hang-part');
  head.setAttribute('stroke-dasharray','100');
  head.setAttribute('stroke-dashoffset','100');
  svg.appendChild(head); parts.push(head);

  const body = document.createElementNS(svgNS,'line');
  body.setAttribute('x1',70);
  body.setAttribute('y1',60);
  body.setAttribute('x2',70);
  body.setAttribute('y2',90);
  body.setAttribute('class','hang-part');
  body.setAttribute('stroke-dasharray','100');
  body.setAttribute('stroke-dashoffset','100');
  svg.appendChild(body); parts.push(body);

  const larm = document.createElementNS(svgNS,'line');
  larm.setAttribute('x1',70);
  larm.setAttribute('y1',70);
  larm.setAttribute('x2',55);
  larm.setAttribute('y2',85);
  larm.setAttribute('class','hang-part');
  larm.setAttribute('stroke-dasharray','100');
  larm.setAttribute('stroke-dashoffset','100');
  svg.appendChild(larm); parts.push(larm);

  const rarm = document.createElementNS(svgNS,'line');
  rarm.setAttribute('x1',70);
  rarm.setAttribute('y1',70);
  rarm.setAttribute('x2',85);
  rarm.setAttribute('y2',85);
  rarm.setAttribute('class','hang-part');
  rarm.setAttribute('stroke-dasharray','100');
  rarm.setAttribute('stroke-dashoffset','100');
  svg.appendChild(rarm); parts.push(rarm);

  const lleg = document.createElementNS(svgNS,'line');
  lleg.setAttribute('x1',70);
  lleg.setAttribute('y1',90);
  lleg.setAttribute('x2',60);
  lleg.setAttribute('y2',110);
  lleg.setAttribute('class','hang-part');
  lleg.setAttribute('stroke-dasharray','100');
  lleg.setAttribute('stroke-dashoffset','100');
  svg.appendChild(lleg); parts.push(lleg);

  const rleg = document.createElementNS(svgNS,'line');
  rleg.setAttribute('x1',70);
  rleg.setAttribute('y1',90);
  rleg.setAttribute('x2',80);
  rleg.setAttribute('y2',110);
  rleg.setAttribute('class','hang-part');
  rleg.setAttribute('stroke-dasharray','100');
  rleg.setAttribute('stroke-dashoffset','100');
  svg.appendChild(rleg); parts.push(rleg);

  wrap.appendChild(svg);

  // título y palabra oculta (debajo del ahorcado)
  const header = document.createElement('div');
  header.innerHTML = `<h3 style="text-align:center;">Ahorcado</h3>
  <p style="text-align:center;">Adiviná la palabra relacionada con hardware.</p>`;
  
  const wordEl = document.createElement('p');
  wordEl.style.letterSpacing='6px';
  wordEl.style.fontWeight='800';
  wordEl.style.textAlign = 'center';
  wordEl.textContent = revealed.join(' ');
  header.appendChild(wordEl);
  wrap.appendChild(header);

  // letras
  const lettersWrap = document.createElement('div');
  lettersWrap.style.marginTop='8px';
  lettersWrap.style.textAlign = "center";
  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split('');
  alphabet.forEach(ch => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.style.margin='3px';
    b.textContent = ch;
    b.addEventListener('click', () => {
      b.disabled = true;
      handleGuess(ch);
    });
    lettersWrap.appendChild(b);
  });
  wrap.appendChild(lettersWrap);

  // status
  const status = document.createElement('div');
  status.style.marginTop='10px';
  wrap.appendChild(status);
  container.appendChild(wrap);

  function handleGuess(letter) {
    let found = false;
    for (let i=0;i<word.length;i++){
      if (word[i] === letter) { revealed[i] = letter; found = true; }
    }
    wordEl.textContent = revealed.join(' ');
    if (!found) {
      if (wrong < parts.length) {
        const p = parts[wrong];
        p.style.strokeDashoffset = '0';
        p.classList.add('drawn');
      }
      wrong++;
      status.textContent = `Fallos: ${wrong} / ${maxWrong}`;
      if (wrong >= maxWrong) {
        status.innerHTML = `Perdiste. La palabra era: <strong>${word}</strong>`;
      }
    } else {
      if (!revealed.includes('_')) {
        const score = Math.max(10, (maxWrong - wrong) * 8 + 30);
        status.innerHTML = `¡Ganaste! Puntaje: ${score} pts`;
        saveHighAndRender('Ahorcado', score);
      }
    }
  }
}



  // ---------- helper: save high & render HUD ----------
  function saveHighAndRender(gameKey, score) {
    saveHigh(gameKey, score);
    renderHUD();
  }

  // ---------- init ----------
  renderHUD();

  // expose loadGame (opcional)
  window.loadGame = loadGame;

  // saveHigh utility (internal)
  function saveHigh(k, v) {
    if (!highs[k] || v > highs[k]) {
      highs[k] = v;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(highs));
      showToast(`🎉 Nuevo récord: ${k} ${v} pts`);
    }
  }
})();






