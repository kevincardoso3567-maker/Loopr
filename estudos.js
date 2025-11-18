// ====================================================================
// LOOPR - ESTUDOS (VERSÃO FINAL COM EDIÇÃO E EXCLUSÃO - 2025)
// ====================================================================

let currentWeek = 2;
let currentDay = 'seg';
let subjects = JSON.parse(localStorage.getItem('loopr-subjects')) || [];
subjects = subjects.map(s => ({ ...s, lessons: s.lessons || [], done: s.done || false }));

document.addEventListener('DOMContentLoaded', () => {
  populateWeekSelects();
  setupIconUpload();
  setupAddSubject();
  setupDayTabs();
  renderDay(currentWeek, currentDay);
  updateTitle();

  document.getElementById('prevWeek').onclick = () => { if (currentWeek > 1) { currentWeek--; syncWeekAndRender(); } };
  document.getElementById('nextWeek').onclick = () => { if (currentWeek < 52) { currentWeek++; syncWeekAndRender(); } };
  document.getElementById('weekSelect').onchange = e => { currentWeek = parseInt(e.target.value); syncWeekAndRender(); };
});

function setupDayTabs() {
  document.querySelectorAll('.day-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentDay = tab.dataset.day;
      renderDay(currentWeek, currentDay);
    };
  });
}

function renderDay(week, day) {
  document.getElementById('selectedDayTitle').textContent = {
    seg: 'Segunda-feira', ter: 'Terça-feira', qua: 'Quarta-feira',
    qui: 'Quinta-feira', sex: 'Sexta-feira', sab: 'Sábado', dom: 'Domingo'
  }[day];

  const daySubjects = subjects.filter(s => s.week === week && s.day === day);
  const container = document.getElementById('daySubjects');
  container.innerHTML = daySubjects.length === 0
    ? '<p style="color:#94A3B8;text-align:center;margin:2rem 0;">Nenhuma matéria neste dia.</p>'
    : '';

  daySubjects.forEach((subject, globalIndex) => {
    const card = document.createElement('div');
    card.className = 'day-subject-card';

    const iconHTML = subject.iconSrc
      ? `<img src="${subject.iconSrc}" alt="Ícone">`
      : `<div style="background:${getRandomColor()};width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:1.1rem;">${getRandomIcon()}</div>`;

    const statusImg = subject.done ? 'CK.png' : 'AN.png';

    const lessonsHTML = subject.lessons.length > 0
      ? subject.lessons.map((l, i) => `<div class="lesson-item"><span>• ${l}</span><button class="delete-lesson" data-index="${i}">×</button></div>`).join('')
      : '<p class="no-lessons">Nenhuma aula adicionada ainda.</p>';

    card.innerHTML = `
      <div class="card-header">
        <div class="icon">${iconHTML}</div>
        <div class="subject-main-info">
          <h3 class="subject-name">${subject.name}</h3>
          <p class="subject-time">${subject.time}</p>
        </div>
        <button class="check-btn ${subject.done ? 'done' : ''}"><img src="${statusImg}" alt="Status"></button>
      </div>

      <div class="lessons-container">
        <div class="lessons-header"><span>Aulas</span><button class="add-lesson-btn">+</button></div>
        <div class="lessons-list 'lessons-list">${lessonsHTML}</div>
        <div class="lesson-input hidden">
          <input type="text" class="lesson-text" placeholder="Ex: Capítulo 10">
          <button class="save-lesson">Salvar</button>
          <button class="cancel-lesson">Cancelar</button>
        </div>
      </div>

      <div class="edit-mode hidden">
        <div class="edit-header">
          <input type="text" class="edit-name input-field" value="${subject.name}">
          <input type="text" class="edit-time input-field" value="${subject.time}" placeholder="Horário">
        </div>
        <div class="edit-actions">
          <button class="save-edit">Salvar</button>
          <button class="cancel-edit">Cancelar</button>
          <button class="delete-subject">Excluir matéria</button>
        </div>
      </div>
    `;

    container.appendChild(card);

    const editMode = card.querySelector('.edit-mode');
    const header = card.querySelector('.card-header');
    const lessonsContainer = card.querySelector('.lessons-container');

    // DUPLO CLIQUE → EDITAR
    card.ondblclick = e => {
      if (e.target.closest('button')) return;
      header.style.display = 'none';
      lessonsContainer.style.display = 'none';
      editMode.classList.remove('hidden');
      card.classList.add('editing');
    };

    // SALVAR EDIÇÃO
    card.querySelector('.save-edit').onclick = () => {
      const newName = card.querySelector('.edit-name').value.trim();
      const newTime = card.querySelector('.edit-time').value.trim();
      if (!newName || !newTime) return alert('Preencha nome e horário!');
      subjects[globalIndex].name = newName;
      subjects[globalIndex].time = newTime;
      saveToStorage();
      renderDay(week, day);
    };

    // CANCELAR EDIÇÃO
    card.querySelector('.cancel-edit').onclick = () => renderDay(week, day);

    // EXCLUIR MATÉRIA
    card.querySelector('.delete-subject').onclick = () => {
      if (confirm(`Excluir "${subject.name}" permanentemente?`)) {
        subjects.splice(globalIndex, 1);
        saveToStorage();
        renderDay(week, day);
      }
    };

    // CHECK CONCLUIR
    card.querySelector('.check-btn').onclick = e => { e.stopPropagation(); subject.done = !subject.done; saveToStorage(); renderDay(week, day); };

    // CLIQUE SIMPLES → EXPANDIR
    card.onclick = e => {
      if (e.target.closest('button, input')) return;
      if (card.classList.contains('editing')) return;
      card.classList.toggle('expanded');
    };

    // AULAS
    card.querySelector('.add-lesson-btn').onclick = e => { e.stopPropagation(); const input = card.querySelector('.lesson-input'); input.classList.remove('hidden'); input.querySelector('.lesson-text').focus(); };
    card.querySelector('.save-lesson').onclick = () => { const input = card.querySelector('.lesson-text'); if (input.value.trim()) { subject.lessons.push(input.value.trim()); saveToStorage(); renderDay(week, day); } };
    card.querySelector('.cancel-lesson').onclick = () => { const input = card.querySelector('.lesson-input'); input.classList.add('hidden'); input.querySelector('.lesson-text').value = ''; };
    card.querySelectorAll('.delete-lesson').forEach(btn => {
      btn.onclick = e => { e.stopPropagation(); subject.lessons.splice(btn.dataset.index, 1); saveToStorage(); renderDay(week, day); };
    });
  });
}

// === RESTANTE DAS FUNÇÕES (populateWeekSelects, syncWeekAndRender, etc) ===
// (Cole as funções do último código que te mandei — estão 100% corretas)

function populateWeekSelects() {
  const selects = [document.getElementById('weekSelect'), document.getElementById('subjectWeek')];
  selects.forEach(select => {
    select.innerHTML = '<option value="">Escolher semana</option>';
    for (let i = 1; i <= 52; i++) {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = `Semana ${i}`;
      if (i === currentWeek) opt.selected = true;
      select.appendChild(opt);
    }
  });
  updateNavButtons();
}

function syncWeekAndRender() {
  document.getElementById('weekSelect').value = currentWeek;
  updateTitle(); renderDay(currentWeek, currentDay); updateNavButtons();
}

function updateTitle() {
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const date = new Date();
  date.setDate(date.getDate() + (currentWeek - 2) * 7);
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const ordinal = currentWeek <= 10 ? ['Primeira','Segunda','Terceira','Quarta','Quinta','Sexta','Sétima','Oitava','Nona','Décima'][currentWeek-1] : `${currentWeek}ª`;
  document.getElementById('pageTitle').textContent = `${ordinal} Semana – ${month} ${year}`;
}

function updateNavButtons() {
  document.getElementById('prevWeek').disabled = currentWeek === 1;
  document.getElementById('nextWeek').disabled = currentWeek === 52;
}

function setupIconUpload() {
  const input = document.getElementById('iconUpload');
  const preview = document.getElementById('iconPreview');
  input.onchange = () => {
    if (input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => preview.innerHTML = `<img src="${e.target.result}" alt="Ícone">`;
      reader.readAsDataURL(input.files[0]);
    }
  };
  preview.onclick = () => input.click();
}

function setupAddSubject() {
  document.getElementById('addSubjectBtn').onclick = addSubject;
  document.getElementById('subjectTime').onkeyup = e => { if (e.key === 'Enter') addSubject(); };
}

function addSubject() {
  const name = document.getElementById('subjectName').value.trim();
  const week = document.getElementById('subjectWeek').value;
  const day = document.getElementById('subjectDay').value;
  const time = document.getElementById('subjectTime').value.trim();
  const iconSrc = document.querySelector('#iconPreview img')?.src || null;

  if (!name || !week || !day || !time) return alert('Preencha todos os campos!');

  subjects.push({ name, week: parseInt(week), day, time, iconSrc, done: false, lessons: [] });
  saveToStorage();

  // Limpar formulário
  document.getElementById('subjectName').value = '';
  document.getElementById('subjectWeek').value = '';
  document.getElementById('subjectDay').value = '';
  document.getElementById('subjectTime').value = '';
  document.getElementById('iconPreview').innerHTML = '<i class="fa-solid fa-image"></i>';
  document.getElementById('iconUpload').value = '';

  renderDay(currentWeek, currentDay);
}

function getRandomColor() { return ['#06B6D4','#8B5CF6','#F59E0B','#EF4444','#10B981'][Math.floor(Math.random()*5)]; }
function getRandomIcon() { return ['Code','Pill','Layout','Brain','Book'][Math.floor(Math.random()*5)]; }
function saveToStorage() { localStorage.setItem('loopr-subjects', JSON.stringify(subjects)); }
