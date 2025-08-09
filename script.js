// Tahap 1 — interaksi dasar (add / delete / complete / pin / search / refresh / dark)
// Simple localStorage support included for convenience.

const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

const taskInput = qs('#taskInput');
const taskDate = qs('#taskDate');
const addBtn = qs('#addBtn');
const taskList = qs('#taskList');
const emptyMessage = qs('#emptyMessage');

const searchInput = qs('#search');
const refreshBtn = qs('#refreshBtn');
const clearAllBtn = qs('#clearAllBtn');
const darkToggle = qs('#darkToggle');

const statTotal = qs('#statTotal');
const statDone = qs('#statDone');

const STORAGE_KEY = 'tds_stage1_v1';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// helpers
const uid = ()=> Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const save = ()=> localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

function formatDate(iso){
  if(!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch(e){ return iso; }
}

// render
function render(){
  const q = (searchInput.value || '').trim().toLowerCase();
  const filtered = tasks.filter(t=>{
    if(!q) return true;
    return t.text.toLowerCase().includes(q) || (t.date && t.date.includes(q));
  });

  taskList.innerHTML = '';
  if(filtered.length === 0){
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
    // pinned first
    filtered.sort((a,b)=> (b.pinned - a.pinned) || (a.created - b.created));
    filtered.forEach((t, i)=>{
      const li = document.createElement('li');
      li.className = 'task-item' + (t.completed ? ' completed' : '');
      li.dataset.id = t.id;
      li.innerHTML = `
        <div><button class="pin-btn" title="Pin/Unpin">${t.pinned ? '📌' : '🔖'}</button></div>
        <div>
          <div class="title">${escapeHtml(t.text)}</div>
          <div class="meta">${t.date ? `⏰ ${formatDate(t.date)}` : ''}</div>
        </div>
        <div class="task-actions">
          <button class="done" title="Toggle Selesai">${t.completed ? '↺' : '✔'}</button>
          <button class="edit" title="Edit">✏️</button>
          <button class="del" title="Hapus">🗑️</button>
        </div>
      `;
      // events
      li.querySelector('.pin-btn').addEventListener('click', (e)=>{
        e.stopPropagation();
        togglePin(t.id);
      });
      li.querySelector('.done').addEventListener('click', (e)=>{
        e.stopPropagation();
        toggleComplete(t.id);
      });
      li.querySelector('.del').addEventListener('click', (e)=>{
        e.stopPropagation();
        removeTask(t.id);
      });
      li.querySelector('.edit').addEventListener('click', (e)=>{
        e.stopPropagation();
        editTask(t.id);
      });
      taskList.appendChild(li);
    });
  }

  // stats
  statTotal.textContent = tasks.length;
  statDone.textContent = tasks.filter(x=>x.completed).length;
  save();
}

// actions
function addTask(){
  const text = (taskInput.value || '').trim();
  if(!text) return;
  tasks.push({
    id: uid(),
    text,
    date: taskDate.value || null,
    completed: false,
    pinned: false,
    created: Date.now()
  });
  taskInput.value = '';
  taskDate.value = '';
  render();
}

function removeTask(id){
  if(!confirm('Hapus tugas ini?')) return;
  tasks = tasks.filter(t=>t.id !== id);
  render();
}

function toggleComplete(id){
  const t = tasks.find(x=>x.id===id); if(!t) return;
  t.completed = !t.completed;
  render();
}

function togglePin(id){
  const t = tasks.find(x=>x.id===id); if(!t) return;
  t.pinned = !t.pinned;
  render();
}

function editTask(id){
  const t = tasks.find(x=>x.id===id); if(!t) return;
  const newText = prompt('Edit tugas:', t.text);
  if(newText === null) return;
  t.text = newText.trim() || t.text;
  const newDate = prompt('Tanggal (YYYY-MM-DD) kosong untuk hapus:', t.date || '');
  t.date = newDate ? newDate : null;
  render();
}

function removeAll(){
  if(!confirm('Hapus semua tugas?')) return;
  tasks = [];
  render();
}

// misc
function refreshList(){
  render();
  // small visual feedback
  refreshBtn.animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:600});
}

// escape html
function escapeHtml(s){ return (s+'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

// events
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e=>{ if(e.key==='Enter') addTask(); });
searchInput.addEventListener('input', ()=> setTimeout(render, 120));
refreshBtn.addEventListener('click', refreshList);
clearAllBtn.addEventListener('click', removeAll);
darkToggle.addEventListener('click', ()=> document.body.classList.toggle('dark'));

// initial
render();

// ===== Background Bintang Animasi =====
const starContainer = document.createElement("div");
starContainer.classList.add("starry-bg");
document.body.appendChild(starContainer);

function createStars(num) {
    for (let i = 0; i < num; i++) {
        const star = document.createElement("div");
        const size = Math.random() * 3 + 1 + "px";
        const posX = Math.random() * window.innerWidth + "px";
        const posY = Math.random() * window.innerHeight + "px";
        const delay = Math.random() * 2 + "s";

        star.classList.add("star");
        star.style.width = size;
        star.style.height = size;
        star.style.left = posX;
        star.style.top = posY;
        star.style.animationDelay = delay;

        starContainer.appendChild(star);
    }
}

createStars(100);

document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", function(e) {
    let rect = btn.getBoundingClientRect();
    let btnColor = window.getComputedStyle(btn).backgroundColor;

    for (let i = 0; i < 8; i++) {
      let star = document.createElement("div");
      star.className = "star-particle";
      star.style.background = btnColor;
      star.style.boxShadow = `0 0 6px ${btnColor}`;

      star.style.left = (e.clientX - rect.left) + "px";
      star.style.top = (e.clientY - rect.top) + "px";

      star.style.setProperty("--x", (Math.random() - 0.5) * 100 + "px");
      star.style.setProperty("--y", (Math.random() - 0.5) * 100 + "px");

      btn.appendChild(star);

      setTimeout(() => star.remove(), 800);
    }
  });
});

// Fungsi bikin bintang
function createStars(count) {
  const container = document.querySelector('.stars');
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2}s`;

    // Efek klik meledak
    star.addEventListener('click', () => {
      star.style.animation = 'pop 0.5s forwards';
      setTimeout(() => star.remove(), 500);
    });

    container.appendChild(star);
  }
}

// Tambahkan layer bintang ke body
document.body.insertAdjacentHTML("afterbegin", `<div class="stars"></div>`);
createStars(50);

// Efek bintang klik meledak
document.addEventListener("click", function(e) {
  for (let i = 0; i < 5; i++) {
    let star = document.createElement("div");
    star.classList.add("star-click");

    // Posisi awal di klik, sedikit acak
    let offsetX = (Math.random() - 0.5) * 30;
    let offsetY = (Math.random() - 0.5) * 30;

    star.style.left = `${e.clientX + offsetX}px`;
    star.style.top = `${e.clientY + offsetY}px`;

    // Warna acak untuk variasi
    let colors = ["yellow", "white", "lightblue", "pink", "orange"];
    star.style.background = colors[Math.floor(Math.random() * colors.length)];

    document.body.appendChild(star);

    // Hapus setelah animasi selesai
    setTimeout(() => {
      star.remove();
    }, 800);
  }
});