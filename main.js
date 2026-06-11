// ===== CONSTANTS =====
const AI_KEYS   = ['claude','chatgpt','gemini','copilot','grok','spark'];
const AI_LABELS = ['Claude','ChatGPT','Gemini','Copilot','Grok','Genspark'];
const AI_COLORS = {
  claude:'#c9a84c', chatgpt:'#10a37f', gemini:'#4285f4',
  copilot:'#0078d4', grok:'#e04444', spark:'#9b59b6'
};

const AI_FILES_MAP = {
  'ソクラテス': {
    claude:  './philosopher/socrates.html',
    chatgpt: './philosopher/socrates-chatgpt.html',
    gemini:  './philosopher/socrates-gemini.html',
    copilot: './philosopher/socrates-copilot.html',
    grok:    './philosopher/socrates-grok.html',
    spark:   './philosopher/socrates-genspark.html',
  },
  'プラトン': {
    claude:  './philosopher/plato.html',
    chatgpt: './philosopher/plato-chatgpt.html',
    gemini:  './philosopher/plato-gemini.html',
    copilot: './philosopher/plato-copilot.html',
    grok:    './philosopher/plato-grok.html',
    spark:   './philosopher/plato-genspark.html',
  },
  'アリストテレス': {
    claude:  './philosopher/aristotle.html',
    chatgpt: './philosopher/aristotle-chatgpt.html',
    gemini:  './philosopher/aristotle-gemini.html',
    copilot: './philosopher/aristotle-copilot.html',
    grok:    './philosopher/aristotle-grok.html',
    spark:   './philosopher/aristotle-genspark.html',
  },
};

const SUMMARY_FILES = {
  'ソクラテス':    './philosopher/socrates-summary.html',
  'プラトン':      './philosopher/plato-summary.html',
  'アリストテレス': './philosopher/aristotle-summary.html',
};

const INTENSIVE_FILES = {
  'アリストテレス': 'https://h9966882-max.github.io/intensive/aristotle/index.html',
};

const ERA_FLOWERS = {
  '古代':'🌻', '中世':'🌼', '近世':'🌸', '近代':'💐', '現代':'🌺', '東洋':'🌷'
};

// ===== HELPERS =====
function countFor(p){ return p[3]+p[4]+p[5]+p[6]+p[7]+p[8]; }
function isConsensus(p){ return countFor(p) === 6; }
function isUnique(p){ return countFor(p) === 1; }

let currentFilter = 'all';
let currentAI = null;

// ===== RENDER =====
function render(){
  const wrap = document.getElementById('grid-wrap');
  wrap.innerHTML = '';

  const eras = ['古代','中世','近世','近代','現代','東洋'];
  let totalShown = 0;

  eras.forEach(era => {
    const rows = philosophers.filter(p => {
      if(p[2] !== era) return false;
      if(currentFilter === 'consensus') return isConsensus(p);
      if(currentFilter === 'unique')    return isUnique(p);
      if(currentAI){
        const idx = AI_KEYS.indexOf(currentAI);
        return p[3+idx] === 1;
      }
      return true;
    });
    if(rows.length === 0) return;

    const sec = document.createElement('div');
    sec.className = 'era-section';

    const header = document.createElement('div');
    header.className = 'era-header';
    header.innerHTML = `
      <span class="era-flower">${ERA_FLOWERS[era]}</span>
      <span class="era-title">${era}</span>
      <div class="era-rule"></div>
    `;
    sec.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'era-grid';

    rows.forEach(p => {
      totalShown++;
      const card = document.createElement('div');
      card.className = 'phil-card' + (p[9] ? ' has-lecture' : ' greyed');

      const aiDots = AI_KEYS.map((key, ki) => {
        const has = p[3+ki];
        return `<div class="ai-dot${has ? '' : ' absent'}" style="${has ? 'background:'+AI_COLORS[key] : ''}"></div>`;
      }).join('');

      card.innerHTML = `
        ${p[9] ? '<div class="lecture-badge">🌸</div>' : ''}
        <div class="phil-num">No.${String(philosophers.indexOf(p)+1).padStart(2,'0')}</div>
        <div class="phil-name-ja">${p[0]}</div>
        <div class="phil-name-en">${p[1]}</div>
        <div class="ai-dots">${aiDots}</div>
      `;

      if(p[9]){
        card.addEventListener('click', () => openPopup(p));
      }

      grid.appendChild(card);
    });

    sec.appendChild(grid);
    wrap.appendChild(sec);
  });

  document.getElementById('stat-shown').textContent = totalShown;
  document.getElementById('stat-consensus').textContent = philosophers.filter(isConsensus).length;
  document.getElementById('stat-unique').textContent = philosophers.filter(isUnique).length;
}

// ===== POPUP =====
function openPopup(p){
  const overlay = document.getElementById('popup-overlay');
  document.getElementById('popup-flower').textContent = ERA_FLOWERS[p[2]] || '🌸';
  document.getElementById('popup-name').textContent = p[0];
  document.getElementById('popup-name-en').textContent = p[1];

  const btns = document.getElementById('popup-buttons');
  btns.innerHTML = '';

  // 総括ページ
  const summaryFile = SUMMARY_FILES[p[0]];
  if(summaryFile){
    const summary = document.createElement('a');
    summary.className = 'summary-btn';
    summary.href = summaryFile;
    summary.innerHTML = `
      <span class="summary-btn-icon">🌸</span>
      <span class="summary-btn-text">
        6AI総括講義
        <span class="summary-btn-sub">全AIの内容をまとめて読む</span>
      </span>
      <span class="ai-btn-arrow">→</span>
    `;
    btns.appendChild(summary);

    // 集中講義
    const intensiveFile = INTENSIVE_FILES[p[0]];
    if(intensiveFile){
      const intensive = document.createElement('a');
      intensive.className = 'intensive-btn';
      intensive.href = intensiveFile;
      intensive.innerHTML = `
        <span class="intensive-btn-icon">🏛️</span>
        <span class="intensive-btn-name">
          集中講義（全15講）
          <span class="intensive-btn-sub">シラバス比較・各AI講義</span>
        </span>
        <span class="ai-btn-arrow">→</span>
      `;
      btns.appendChild(intensive);
    }

    const divider = document.createElement('div');
    divider.className = 'popup-divider';
    divider.textContent = 'または AI別に読む';
    btns.appendChild(divider);
  }

  // AI別講義ボタン
  AI_KEYS.forEach((key, i) => {
    const has = p[3+i];
    if(!has) return;
    const a = document.createElement('a');
    a.className = 'ai-lecture-btn';
    a.href = (AI_FILES_MAP[p[0]] || {})[key] || '#';
    a.innerHTML = `
      <div class="ai-btn-dot" style="background:${AI_COLORS[key]}"></div>
      <span class="ai-btn-name">${AI_LABELS[i]}の講義</span>
      <span class="ai-btn-arrow">→</span>
    `;
    btns.appendChild(a);
  });

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePopup(){
  document.getElementById('popup-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('popup-close').addEventListener('click', closePopup);
document.getElementById('popup-overlay').addEventListener('click', e => {
  if(e.target === e.currentTarget) closePopup();
});

// ===== FILTERS =====
document.querySelectorAll('.fbtn[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    currentAI = null;
    render();
  });
});

document.querySelectorAll('.fbtn[data-ai]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAI = btn.dataset.ai;
    currentFilter = 'all';
    render();
  });
});

// ===== INSIGHTS =====
function buildInsights(){
  const grid = document.getElementById('insights-grid');
  const consensus = philosophers.filter(isConsensus);
  const uniqueRows = philosophers.filter(isUnique);

  grid.innerHTML += `
    <div class="insight-card">
      <div class="insight-label">🌸 全AI一致</div>
      <div class="insight-value">${consensus.length}<span style="font-size:1rem;color:var(--warm)"> 人</span></div>
      <div class="insight-list">${consensus.slice(0,6).map(p=>`<span>${p[0]}</span>`).join(' · ')}…</div>
    </div>`;

  grid.innerHTML += `
    <div class="insight-card">
      <div class="insight-label">🌼 独自選出</div>
      <div class="insight-value">${uniqueRows.length}<span style="font-size:1rem;color:var(--warm)"> 人</span></div>
      <div class="insight-sub">1つのAIだけが選んだ人物</div>
    </div>`;

  AI_KEYS.forEach((key, i) => {
    const names = philosophers.filter(p => isUnique(p) && p[3+i]===1).map(p=>p[0]);
    grid.innerHTML += `
      <div class="insight-card">
        <div class="insight-label" style="color:${AI_COLORS[key]}">${AI_LABELS[i]} 独自選出</div>
        <div class="insight-value" style="color:${AI_COLORS[key]}">${names.length}<span style="font-size:1rem;color:var(--warm)"> 人</span></div>
        <div class="insight-list">${names.length ? names.map(n=>`<span>${n}</span>`).join('<br>') : '<span style="color:var(--warm)">なし</span>'}</div>
      </div>`;
  });

  const eastern = philosophers.filter(p=>p[2]==='東洋').length;
  const western = philosophers.length - eastern;
  grid.innerHTML += `
    <div class="insight-card">
      <div class="insight-label">🌷 東洋 vs 西洋</div>
      <div class="insight-value">${eastern} <span style="font-size:0.9rem;color:var(--warm)">vs</span> ${western}</div>
      <div class="insight-sub">東洋 ${eastern}人 / 西洋 ${western}人</div>
    </div>`;
}

// ===== INIT =====
render();
buildInsights();
