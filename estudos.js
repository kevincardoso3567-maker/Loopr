// ====================================================================
// ESTUDOS - IMAGENS LOCAIS: AN.png (não concluída) / CK.png (concluída)
// ====================================================================

let currentWeek = 2;
let currentDay = 'seg';
let subjects = JSON.parse(localStorage.getItem('loopr-subjects')) || [];

document.addEventListener('DOMContentLoaded', () => {
  populateWeekSelects();
  setupIconUpload();
  setupAddSubject();
  setupDayTabs();
  renderDay(currentWeek, currentDay);
  updateTitle();

  document.getElementById('prevWeek').addEventListener('click', () => {
    if (currentWeek > 1) {
      currentWeek--;
      syncWeekAndRender();
    }
  });

  document.getElementById('nextWeek').addEventListener('click', () => {
    if (currentWeek < 52) {
      currentWeek++;
      syncWeekAndRender();
    }
  });

  document.getElementById('weekSelect').addEventListener('change', (e) => {
    currentWeek = parseInt(e.target.value);
    syncWeekAndRender();
  });
});

// === NAVEGAÇÃO POR DIA ===
function setupDayTabs() {
  document.querySelectorAll('.day-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentDay = tab.dataset.day;
      renderDay(currentWeek, currentDay);
    });
  });
}

function renderDay(week, day) {
  const title = document.getElementById('selectedDayTitle');
  const container = document.getElementById('daySubjects');

  const dayNames = {
    seg: 'Segunda-feira', ter: 'Terça-feira', qua: 'Quarta-feira',
    qui: 'Quinta-feira', sex: 'Sexta-feira', sab: 'Sábado', dom: 'Domingo'
  };

  title.textContent = dayNames[day];

  const daySubjects = subjects.filter(s => s.week === week && s.day === day);

  container.innerHTML = '';
  if (daySubjects.length === 0) {
    container.innerHTML = '<p style="color:#94A3B8; text-align:center; margin:2rem 0;">Nenhuma matéria neste dia.</p>';
  } else {
    daySubjects.forEach(s => {
      const card = document.createElement('div');
      card.className = 'day-subject-card';

      const iconHTML = s.iconSrc 
        ? `<div class="icon"><img src="${s.iconSrc}" alt="Ícone"></div>`
        : `<div class="icon" style="background: ${getRandomColor()};">${getRandomIcon()}</div>`;

      // CORREÇÃO AQUI → caminho correto + imagem visível
      const statusImg = s.done ? 'CK.png' : 'AN.png';   // ← se estiver em pasta assets/, troque pra 'assets/CK.png'

      card.innerHTML = `
        ${iconHTML}
        <div class="subject-info">
          <h3>${s.name}</h3>
          <p>${s.time}</p>
        </div>
        <button class="check-btn ${s.done ? 'done' : ''}">
          <img src="${statusImg}" alt="${s.done ? 'Concluído' : 'Pendente'}" class="check-icon">
        </button>
      `;

      container.appendChild(card);

      // Botão de toggle
      card.querySelector('.check-btn').addEventListener('click', () => {
        s.done = !s.done;
        saveToStorage();
        renderDay(week, day);
      });
    });
  }
}

// === OUTRAS FUNÇÕES (100% originais suas) ===
function populateWeekSelects() {
  const selects = [document.getElementById('weekSelect'), document.getElementById('subjectWeek')];
  selects.forEach(select => {
    for (let i = 1; i <= 52; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Semana ${i}`;
      if (i === currentWeek) opt.selected = true;
      select.appendChild(opt);
    }
  });
  updateNavButtons();
}

function syncWeekAndRender() {
  document.getElementById('weekSelect').value = currentWeek;
  updateTitle();
  renderDay(currentWeek, currentDay);
  updateNavButtons();
}

function updateTitle() {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const date = new Date();
  date.setDate(date.getDate() + (currentWeek - 2) * 7);
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const ordinal = getOrdinal(currentWeek);
  document.getElementById('pageTitle').textContent = `${ordinal} Semana – ${month} ${year}`;
}

function getOrdinal(n) {
  const ordinals = ['Primeira', 'Segunda', 'Terceira', 'Quarta', 'Quinta', 'Sexta', 'Sétima', 'Oitava', 'Nona', 'Décima'];
  return n <= 10 ? ordinals[n-1] : `${n}ª`;
}

function updateNavButtons() {
  document.getElementById('prevWeek').disabled = currentWeek === 1;
  document.getElementById('nextWeek').disabled = currentWeek === 52;
}

function setupIconUpload() {
  const input = document.getElementById('iconUpload');
  const preview = document.getElementById('iconPreview');
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Ícone">`;
      };
      reader.readAsDataURL(file);
    }
  });
  preview.addEventListener('click', () => input.click());
}

function setupAddSubject() {
  document.getElementById('addSubjectBtn').addEventListener('click', addSubject);
  document.getElementById('subjectTime').addEventListener('keyup', e => {
    if (e.key === 'Enter') addSubject();
  });
}

function addSubject() {
  const name = document.getElementById('subjectName').value.trim();
  const week = document.getElementById('subjectWeek').value;
  const day = document.getElementById('subjectDay').value;
  const time = document.getElementById('subjectTime').value.trim();
  const iconSrc = document.querySelector('#iconPreview img')?.src || null;

  if (!name || !week || !day || !time) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }

  const subject = { name, week: parseInt(week), day, time, iconSrc, done: false };
  subjects.push(subject);
  saveToStorage();

  ['subjectName', 'subjectWeek', 'subjectDay', 'subjectTime'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('iconPreview').innerHTML = '<i class="fa-solid fa-image"></i>';
  document.getElementById('iconUpload').value = '';

  renderDay(currentWeek, currentDay);
}

function getRandomColor() {
  const colors = ['#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomIcon() {
  const icons = ['Code', 'Pill', 'Layout', 'Brain', 'Book'];
  return icons[Math.floor(Math.random() * icons.length)];
}

function saveToStorage() {
  localStorage.setItem('loopr-subjects', JSON.stringify(subjects));
}
