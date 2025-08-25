// Erica app
const WORDS = [
  {pt:'eu', de:'ich'}, {pt:'voce', de:'du'}, {pt:'ele', de:'er'}, {pt:'ela', de:'sie'}, {pt:'nos', de:'wir'}, {pt:'voces', de:'ihr'}, {pt:'eles', de:'sie'},
  {pt:'aqui', de:'hier'}, {pt:'ali', de:'dort'}, {pt:'agora', de:'jetzt'},
  {pt:'um', de:'eins'}, {pt:'dois', de:'zwei'}, {pt:'tres', de:'drei'}, {pt:'quatro', de:'vier'}, {pt:'cinco', de:'fuenf'}, {pt:'seis', de:'sechs'}, {pt:'sete', de:'sieben'}, {pt:'oito', de:'acht'}, {pt:'nove', de:'neun'}, {pt:'dez', de:'zehn'},
  {pt:'segunda-feira', de:'Montag'}, {pt:'terca-feira', de:'Dienstag'}, {pt:'quarta-feira', de:'Mittwoch'}, {pt:'quinta-feira', de:'Donnerstag'}, {pt:'sexta-feira', de:'Freitag'}, {pt:'sabado', de:'Samstag'}, {pt:'domingo', de:'Sonntag'},
  {pt:'vermelho', de:'rot'}, {pt:'azul', de:'blau'}, {pt:'verde', de:'gruen'}, {pt:'amarelo', de:'gelb'}, {pt:'preto', de:'schwarz'}, {pt:'branco', de:'weiss'}, {pt:'cinza', de:'grau'}, {pt:'marrom', de:'braun'}, {pt:'rosa', de:'rosa'}, {pt:'roxo', de:'lila'},
  {pt:'mae', de:'Mutter'}, {pt:'pai', de:'Vater'}, {pt:'filho', de:'Sohn'}, {pt:'filha', de:'Tochter'}, {pt:'irmao', de:'Bruder'}, {pt:'irma', de:'Schwester'}, {pt:'avo', de:'Grossvater'}, {pt:'avo feminina', de:'Grossmutter'}, {pt:'tio', de:'Onkel'}, {pt:'tia', de:'Tante'}, {pt:'primo', de:'Cousin'}, {pt:'prima', de:'Cousine'},
  {pt:'cabeca', de:'Kopf'}, {pt:'mao', de:'Hand'}, {pt:'pe', de:'Fuss'}, {pt:'olho', de:'Auge'}, {pt:'boca', de:'Mund'}, {pt:'nariz', de:'Nase'}, {pt:'coracao', de:'Herz'}, {pt:'corpo', de:'Koerper'},
  {pt:'ser', de:'sein'}, {pt:'estar', de:'sein'}, {pt:'ter', de:'haben'}, {pt:'ir', de:'gehen'}, {pt:'fazer', de:'machen'}, {pt:'poder', de:'koennen'}, {pt:'dizer', de:'sagen'}, {pt:'ver', de:'sehen'}, {pt:'vir', de:'kommen'}, {pt:'dar', de:'geben'}, {pt:'saber', de:'wissen'}, {pt:'querer', de:'wollen'}, {pt:'precisar', de:'brauchen'}, {pt:'trabalhar', de:'arbeiten'}, {pt:'comer', de:'essen'},
  {pt:'agua', de:'Wasser'}, {pt:'comida', de:'Essen'}, {pt:'cafe', de:'Kaffee'}, {pt:'cha', de:'Tee'}, {pt:'leite', de:'Milch'}, {pt:'pao', de:'Brot'}, {pt:'arroz', de:'Reis'}, {pt:'carne', de:'Fleisch'}, {pt:'fruta', de:'Obst'}, {pt:'legume', de:'Gemuese'},
  {pt:'casa', de:'Haus'}, {pt:'apartamento', de:'Wohnung'}, {pt:'rua', de:'Strasse'}, {pt:'cidade', de:'Stadt'}, {pt:'escola', de:'Schule'}, {pt:'trabalho', de:'Arbeit'}, {pt:'empresa', de:'Firma'}, {pt:'dinheiro', de:'Geld'},
  {pt:'quem', de:'wer'}, {pt:'o que', de:'was'}, {pt:'onde', de:'wo'}, {pt:'quando', de:'wann'}, {pt:'por que', de:'warum'}, {pt:'como', de:'wie'}, {pt:'qual', de:'welche'}, {pt:'quanto', de:'wieviel'}, {pt:'sim', de:'ja'}, {pt:'nao', de:'nein'},
  {pt:'hoje', de:'heute'}, {pt:'amanha', de:'morgen'}, {pt:'ontem', de:'gestern'}, {pt:'sempre', de:'immer'}, {pt:'nunca', de:'nie'}, {pt:'depois', de:'spaeter'}, {pt:'antes', de:'vorher'}
];

const rand = (n) => Math.floor(Math.random() * n);
const shuffle = (arr) => arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);
const state = { tab: 'choice', poolSize: Math.min(100, WORDS.length), optionsCount: 3, correct: 0, total: 0, streak: 0, currentItem: null };
const scorebar = document.getElementById('scorebar');
const panel = document.getElementById('panel');
const btnSkip = document.getElementById('btn-skip');
const btnReset = document.getElementById('btn-reset');
const settingsPanel = document.getElementById('settings-panel');

function normalizeGerman(str){
  return String(str||'').toLowerCase()
    .replaceAll('ä','ae').replaceAll('ö','oe').replaceAll('ü','ue')
    .replaceAll('Ä','ae').replaceAll('Ö','oe').replaceAll('Ü','ue')
    .replaceAll('ß','ss').replace(/\s+/g,' ').trim();
}

// TTS
const voiceSel = document.getElementById('voice-de');
const rateEl = document.getElementById('rate');
const autoEl = document.getElementById('auto-say');
let voices = [], deVoices = [];
function loadVoices(){
  voices = window.speechSynthesis.getVoices();
  deVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('de'));
  voiceSel.innerHTML = deVoices.map((v,i)=>`<option value="${i}">${v.name} (${v.lang})</option>`).join('');
  if(deVoices.length === 0){
    voiceSel.innerHTML = `<option value="-1">Voz DE padrao</option>`;
  }
}
if('speechSynthesis' in window){
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}
function speak(text, lang='de-DE'){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = parseFloat(rateEl.value || '1');
  const idx = parseInt(voiceSel.value || '-1', 10);
  if(deVoices && idx >= 0 && deVoices[idx]) u.voice = deVoices[idx];
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function pickItem(){
  const pool = WORDS.slice(0, state.poolSize);
  const idx = rand(pool.length);
  return { ...pool[idx], idx };
}

function renderScore(){
  scorebar.innerHTML = `
    <span class="stat">Acertos: ${state.correct}</span>
    <span class="stat">Total: ${state.total}</span>
    <span class="stat">Serie: ${state.streak}</span>
    <span class="stat">Conjunto: ${state.poolSize}</span>
  `;
}

function nextTask(){
  renderScore();
  if(state.tab === 'choice') renderChoice();
  else if(state.tab === 'typing') renderTyping();
  else if(state.tab === 'games') renderGamesHome();
  else if(state.tab === 'wortliste') renderList();
  else if(state.tab === 'einstellungen') renderSettings();
}

// Modes
function renderChoice(){
  const item = pickItem();
  state.currentItem = item;
  const pool = WORDS.slice(0, state.poolSize);
  const wrongs = shuffle(pool.filter(w=>normalizeGerman(w.de)!==normalizeGerman(item.de))).slice(0, state.optionsCount-1).map(w=>w.de);
  const opts = shuffle([item.de, ...wrongs]);
  panel.innerHTML = `
    <div class="small-hint">Traduza para alemao</div>
    <div class="big-row">
      <div class="big-word">${item.pt}</div>
      <button class="icon-btn" id="say-pt">🔊 PT</button>
    </div>
    <div class="options">
      ${opts.map(o=>`
        <div class="opt">
          <span>${o}</span>
          <button class="icon-btn say-de" data-text="${o}">🔊 DE</button>
        </div>`).join('')}
    </div>
  `;
  document.getElementById('say-pt').onclick = ()=> speak(item.pt, 'pt-BR');
  panel.querySelectorAll('.say-de').forEach(b=> b.onclick = ()=> speak(b.dataset.text, 'de-DE'));
  panel.querySelectorAll('.opt').forEach(opt=>{
    opt.addEventListener('click', (e) => {
      if(e.target.classList.contains('say-de')) return;
      const val = opt.querySelector('span').textContent;
      const ok = normalizeGerman(val) === normalizeGerman(item.de);
      opt.classList.add(ok ? 'correct' : 'wrong');
      if(!ok){
        panel.querySelectorAll('.opt').forEach(o=>{
          if(normalizeGerman(o.querySelector('span').textContent)===normalizeGerman(item.de)) o.classList.add('correct');
        });
        speak(`Falsch. Richtig ist ${item.de}`, 'de-DE');
      } else {
        speak(`Richtig. ${item.de}`, 'de-DE');
      }
      registerResult(ok);
    }, {once:true});
  });
  if(autoEl.checked){ speak(item.de, 'de-DE'); }
}

function renderTyping(){
  const item = pickItem();
  state.currentItem = item;
  panel.innerHTML = `
    <div class="small-hint">Escreva a traducao em alemao</div>
    <div class="big-row">
      <div class="big-word">${item.pt}</div>
      <button class="icon-btn" id="say-pt">🔊 PT</button>
    </div>
    <div class="input-line">
      <input type="text" id="ans" placeholder="palavra em alemao" autocomplete="off" inputmode="latin" />
      <button class="btn primary" id="check">Verificar</button>
      <button class="icon-btn" id="say-de-ref">🔊 DE</button>
    </div>
    <div id="feedback" class="small-hint" style="margin-top:10px"></div>
  `;
  const ans = panel.querySelector('#ans');
  const fb = panel.querySelector('#feedback');
  const check = panel.querySelector('#check');
  document.getElementById('say-pt').onclick = ()=> speak(item.pt, 'pt-BR');
  document.getElementById('say-de-ref').onclick = ()=> speak(item.de, 'de-DE');
  const submit = () => {
    const ok = normalizeGerman(ans.value) === normalizeGerman(state.currentItem.de);
    fb.textContent = ok ? 'Correto' : `Errado. Correto: ${state.currentItem.de}`;
    fb.style.color = ok ? 'var(--ok)' : 'var(--warn)';
    if(!ok) speak(`Richtig ist ${state.currentItem.de}`, 'de-DE'); else speak(state.currentItem.de, 'de-DE');
    registerResult(ok);
    ans.disabled = true; check.disabled = true;
  };
  check.addEventListener('click', submit);
  ans.addEventListener('keydown', e=>{ if(e.key==='Enter') submit(); });
  ans.focus();
  if(autoEl.checked){ speak(item.de, 'de-DE'); }
}

// Games
function renderGamesHome(){
  panel.innerHTML = `
    <div class="small-hint">Escolha um jogo</div>
    <div class="options">
      <button class="btn" id="g-memory">Pares de cartas</button>
      <button class="btn" id="g-drag">Arrastar e corresponder</button>
    </div>
    <div id="gamearea" style="margin-top:12px"></div>
  `;
  document.getElementById('g-memory').addEventListener('click', renderMemory);
  document.getElementById('g-drag').addEventListener('click', renderDragMatch);
}

function renderMemory(){
  const gamearea = document.getElementById('gamearea');
  const pairs = shuffle(WORDS.slice(0,state.poolSize)).slice(0,12);
  const tiles = shuffle([
    ...pairs.map((p,i)=>({key:'pt-'+i, text:p.pt, id:i, lang:'pt-BR'})),
    ...pairs.map((p,i)=>({key:'de-'+i, text:p.de, id:i, lang:'de-DE'}))
  ]);
  let first = null, lock=false, found=0, moves=0;
  gamearea.innerHTML = `
    <div class="score" style="margin-bottom:8px">
      <span class="stat" id="mv">Jogadas 0</span>
      <span class="stat" id="fd">Encontrado 0 de ${pairs.length}</span>
    </div>
    <div class="board">${tiles.map(t=>`<div class="tile" data-key="${t.key}" data-id="${t.id}" data-lang="${t.lang}"><span>${t.text}</span></div>`).join('')}</div>
  `;
  const mv = document.getElementById('mv');
  const fd = document.getElementById('fd');
  gamearea.querySelectorAll('.tile').forEach(tile=>{
    tile.addEventListener('click', () =>{
      speak(tile.textContent, tile.dataset.lang || 'de-DE');
      if(lock || tile.classList.contains('matched')) return;
      tile.classList.add('revealed');
      if(!first){ first = tile; return; }
      moves++; mv.textContent = `Jogadas ${moves}`;
      const id1 = first.dataset.id, id2 = tile.dataset.id;
      if(id1 === id2 && first !== tile){
        first.classList.add('matched'); tile.classList.add('matched');
        found++; fd.textContent = `Encontrado ${found} de ${pairs.length}`;
        first = null;
      } else {
        lock = true;
        setTimeout(()=>{ first.classList.remove('revealed'); tile.classList.remove('revealed'); first=null; lock=false; }, 650);
      }
    });
  });
}

function renderDragMatch(){
  const gamearea = document.getElementById('gamearea');
  const subset = shuffle(WORDS.slice(0,state.poolSize)).slice(0,8);
  const left = subset.map((p,i)=>({i, pt:p.pt, de:p.de}));
  const right = shuffle(subset.map((p,i)=>({i, de:p.de})));
  gamearea.innerHTML = `
    <div class="match-wrap">
      <div>
        ${left.map(row=>`
          <div class="pair-slot" data-i="${row.i}">
            <div class="pill">Portugues</div>
            <div style="flex:1">${row.pt}</div>
            <div class="dropzone" data-i="${row.i}" aria-label="solte a palavra em alemao aqui"></div>
            <button class="icon-btn say-pt" data-text="${row.pt}">🔊 PT</button>
          </div>
        `).join('')}
      </div>
      <div>
        <div class="small-hint">Arraste a palavra correta em alemao</div>
        ${right.map(col=>`<span class="drag" draggable="true" data-i="${col.i}">${col.de}</span>`).join(' ')}
        <div style="margin-top:8px">${right.map(col=>`<button class="icon-btn say-de" data-text="${col.de}">🔊 ${col.de}</button>`).join(' ')}</div>
      </div>
    </div>
    <div id="drag-msg" class="small-hint" style="margin-top:10px"></div>
  `;
  const msg = document.getElementById('drag-msg');
  const drags = Array.from(gamearea.querySelectorAll('.drag'));
  const drops = Array.from(gamearea.querySelectorAll('.dropzone'));
  gamearea.querySelectorAll('.say-pt').forEach(b=> b.onclick = ()=> speak(b.dataset.text, 'pt-BR'));
  gamearea.querySelectorAll('.say-de').forEach(b=> b.onclick = ()=> speak(b.dataset.text, 'de-DE'));
  let matched = 0;
  drags.forEach(el=>{
    el.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', el.dataset.i); e.dataTransfer.effectAllowed = 'move'; el.classList.add('dragging'); });
    el.addEventListener('dragend', ()=> el.classList.remove('dragging'));
  });
  drops.forEach(dz=>{
    dz.addEventListener('dragover', e=>{ e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    dz.addEventListener('drop', e=>{
      e.preventDefault();
      const from = e.dataTransfer.getData('text/plain');
      if(!from) return;
      const correct = String(dz.dataset.i) === String(from);
      const dragEl = drags.find(d=>d.dataset.i === from);
      if(!dragEl) return;
      speak(dragEl.textContent, 'de-DE');
      if(correct){
        dz.textContent = dragEl.textContent;
        dz.closest('.pair-slot').classList.remove('wrong');
        dz.closest('.pair-slot').classList.add('correct');
        dragEl.setAttribute('draggable','false');
        dragEl.style.opacity = '0.4';
        matched++;
        msg.textContent = `Correto: ${matched} de ${subset.length}`;
        msg.style.color = 'var(--ok)';
        if(matched === subset.length){ msg.textContent = 'Muito bom. Todos os pares encontrados.'; }
      } else {
        dz.closest('.pair-slot').classList.remove('correct');
        dz.closest('.pair-slot').classList.add('wrong');
        msg.textContent = 'Nao combina. Tente outra palavra.';
        msg.style.color = 'var(--warn)';
        setTimeout(()=> dz.closest('.pair-slot').classList.remove('wrong'), 600);
      }
    });
  });
}

function renderList(){
  const list = WORDS.slice(0, state.poolSize);
  panel.innerHTML = `
    <div class="small-hint">100 palavras basicas. Portugues para Alemao.</div>
    <div style="display:grid; grid-template-columns: 1fr 1fr auto; gap:8px; margin-top:10px">
      <div class="pill">PT</div><div class="pill">DE</div><div class="pill">Audio</div>
      ${list.map(w=>`<div>${w.pt}</div><div>${w.de}</div><div><button class="icon-btn say-de" data-text="${w.de}">🔊</button></div>`).join('')}
    </div>
  `;
  panel.querySelectorAll('.say-de').forEach(b=> b.onclick = ()=> speak(b.dataset.text, 'de-DE'));
}

function renderSettings(){
  const maxPool = Math.min(100, WORDS.length);
  settingsPanel.classList.remove('hidden');
  settingsPanel.innerHTML = `
    <div class="small-hint">Ajuste a Erica</div>
    <div style="display:grid; gap:12px; margin-top:10px">
      <label>Opcoes por questao
        <select id="opt-count" class="btn" style="width:100%">
          ${[2,3,4,5].map(n=>`<option value="${n}" ${n===state.optionsCount?'selected':''}>${n}</option>`).join('')}
        </select>
      </label>
      <label>Tamanho do conjunto
        <input id="pool-range" type="range" min="20" max="${maxPool}" value="${Math.min(state.poolSize, maxPool)}" />
        <div class="small-hint">Atual: <span id="pool-val">${Math.min(state.poolSize, maxPool)}</span></div>
      </label>
      <button class="btn" id="btn-export">Exportar progresso</button>
    </div>
  `;
  const optSel = document.getElementById('opt-count');
  const poolRange = document.getElementById('pool-range');
  const poolVal = document.getElementById('pool-val');
  optSel.addEventListener('change', ()=>{ state.optionsCount = parseInt(optSel.value,10); nextTask(); save(); });
  poolRange.addEventListener('input', ()=>{ poolVal.textContent = poolRange.value; });
  poolRange.addEventListener('change', ()=>{ state.poolSize = parseInt(poolRange.value,10); renderScore(); save(); });
  document.getElementById('btn-export').addEventListener('click', ()=>{
    const data = {correct: state.correct, total: state.total, streak: state.streak, poolSize: state.poolSize, timestamp: new Date().toISOString()};
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'erica-progresso.json'; a.click(); URL.revokeObjectURL(url);
  });
}

// Tabs and controls
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.tab = btn.dataset.tab;
    if(state.tab !== 'einstellungen'){ settingsPanel.classList.add('hidden'); }
    nextTask();
  });
});
btnSkip.addEventListener('click', nextTask);
btnReset.addEventListener('click', ()=>{
  state.correct = 0; state.total = 0; state.streak = 0; save(); renderScore(); nextTask();
  localStorage.removeItem('erica-progress-pt');
});

function save(){ localStorage.setItem('erica-progress-pt', JSON.stringify({correct:state.correct,total:state.total,streak:state.streak,poolSize:state.poolSize,options:state.optionsCount})); }
(function load(){
  const raw = localStorage.getItem('erica-progress-pt');
  if(!raw) return; try{ const d = JSON.parse(raw); state.correct=d.correct||0; state.total=d.total||0; state.streak=d.streak||0; state.poolSize=d.poolSize||state.poolSize; state.optionsCount=d.options||state.optionsCount; }catch{}
})();

if('serviceWorker' in navigator){ window.addEventListener('load', ()=> navigator.serviceWorker.register('./sw.js')); }

renderScore();
nextTask();
