// data!
const EXERCISES_DB = [
    {id:'rdl', name: 'Romanian Deadlift', icon:'🏋️', muscle:'Hamstrings / Glutes', badge:'Hip Hinge', desc:'Hinge at the hips with a straight back, bar tracking close to the legs. We track hip angle, back angle, and knee bend'},
    {id:'squat', name: 'Squat', icon:'🦵', muscle:'Quads / Glutes / Core', badge:'Compound', desc:'Sit back and down, knees tracking over toes, depth at parallel or below. We track knee angle, hip depth, and torso lean.'},
    {id:'pushup', name:'Push-Up', icon:'💪', muscle:'Chest / Triceps / Shoulders', badge:'Bodyweight', desc:'Full lockout at top, chest to floor, elbows at 45°. | *Tip for women: slightly tilt wrists so that hands are pointing outwards.* We track elbow angle, hip alignment, and head position'},
    { id:'bicep_curl', name:'Bicep Curl', icon:'💪', muscle:'Biceps / Forearms', badge:'Isolation', desc:'Curl with control, elbows pinned to sides, wrists neutral. We track elbow angle and shoulder stability.' },
    { id:'shoulder_press', name:'Shoulder Press', icon:'🙌', muscle:'Deltoids / Triceps', badge:'Push', desc:'Press overhead with locked core, wrists over elbows. We track elbow angle and bar path alignment.' },
    { id:'lunge', name:'Lunge', icon:'🦵', muscle:'Quads / Glutes / Hamstrings', badge:'Compound', desc:'Step forward, back knee hovers above floor, front shin vertical. We track knee angle and torso uprightness.' },
    { id:'deadlift', name:'Conventional Deadlift', icon:'🏋️', muscle:'Full Body', badge:'Compound', desc:'Lift with hips and shoulders rising together, bar in contact with legs. We track hip angle, back angle, and bar path.' },
    { id:'plank', name:'Plank', icon:'🧘', muscle:'Core / Shoulders', badge:'Isometric', desc:'Flat back, neutral hips, head in line with spine. We track hip height and shoulder alignment.' },
    { id:'glute_bridge', name:'Glute Bridge', icon:'🍑', muscle:'Glutes / Hamstrings', badge:'Isolation', desc:'Drive hips to ceiling, squeeze at top, avoid hyperextending lower back. We track hip extension angle.' },
    { id:'overhead_squat', name:'Overhead Squat', icon:'🏋️', muscle:'Full Body / Mobility', badge:'Advanced', desc:'Arms locked overhead throughout full squat depth. We track arm position, depth, and torso angle.' },
    { id:'lateral_raise', name:'Lateral Raise', icon:'💪', muscle:'Lateral Deltoids', badge:'Isolation', desc:'Arms rise to shoulder height, slight forward tilt, controlled descent. We track elbow angle and symmetry.' },
];

const EXERCISE_TIPS = {
    rdl: {title:'RDL Tips', tips:['Keep bar/dumbbell close to your body throughout', 'Hinge at hips, push hips backward', 'Slight knee bend is fine, but avoid turning it into a squat', 'Neutral spine - don\'t let lower back round']},
    squat: { title:'Squat Tips', tips:['Knees track over toes, don\'t cave inward','Sit back and down, not just down','Aim for parallel or below depth','Chest up, brace your core throughout'] },
    pushup: { title:'Push-Up Tips', tips:['Keep elbows at 45° to your body','Straight line from head to heels','Full lockout at the top','Lower until chest nearly touches the floor'] },
    bicep_curl: { title:'Bicep Curl Tips', tips:['Elbows stay pinned to your sides','Full range of motion — full extension at bottom','Don\'t swing — isolate the bicep','Control the descent, don\'t drop it'] },
    shoulder_press: { title:'Shoulder Press Tips', tips:['Wrists stacked over elbows at the bottom','Press directly overhead, not forward','Core braced, avoid arching lower back','Full lockout at the top'] },
    lunge: { title:'Lunge Tips', tips:['Front shin should stay vertical','Back knee hovers just above the floor','Torso upright, don\'t lean forward','Drive through the front heel to return'] },
    deadlift: { title:'Deadlift Tips', tips:['Hips and shoulders rise at the same rate','Bar stays in contact with your legs','Full lockout — hips through at the top','Brace hard before you pull'] },
    plank: { title:'Plank Tips', tips:['Hips level with shoulders — no sagging or piking','Brace core as if about to take a punch','Breathe! Don\'t hold your breath','Keep neck neutral, gaze to the floor'] },
    glute_bridge: { title:'Glute Bridge Tips', tips:['Drive through your heels, not your toes','Squeeze glutes hard at the top','Avoid pushing lower back into the movement','Hold 1–2 seconds at the top for activation'] },
    overhead_squat: { title:'Overhead Squat Tips', tips:['Arms locked out overhead at all times','Wide grip for easier mobility','Push knees out as you descend','This requires good ankle and shoulder mobility'] },
    lateral_raise: { title:'Lateral Raise Tips', tips:['Lead with elbows, not wrists','Stop at shoulder height — don\'t go higher','Slight forward lean helps target the lateral delt','Control the descent — don\'t let gravity do the work'] },
};

// - state
let plans = JSON.parse(localStorage.getItem('traintrackPlans') || '[]');
let selectedExercises = new Set();
let cameraStream = null;
let poseInstance = null;
let animFrame = null;
let repCount = 0;
let repPhase = 'up';

// - page INIT (each page only has the elements it needs,
//   so every render function is guarded behind an existence check)
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();

    if (document.getElementById('exercise-picker-grid')) {
        renderExercisePicker();
        listenPlanPreview();
    }
    if (document.getElementById('plans-grid')) {
        renderPlans();
    }
    if (document.getElementById('exercise-library')) {
        renderLibrary();
    }
    if (document.getElementById('exercise-select')) {
        initFormCheckPage();
    }
});

// - highlights the current page's nav link
function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('#')[0] || 'index.html';
    if (href === path) a.classList.add('active');
  });
}

// ─ exercise picker (create-plan page)
function renderExercisePicker() {
  const grid = document.getElementById('exercise-picker-grid');
  grid.innerHTML = EXERCISES_DB.map(ex => `
    <div class="ex-chip" data-id="${ex.id}" onclick="toggleExercise('${ex.id}', this)">${ex.name}</div>
  `).join('');
}

function toggleExercise(id, el) {
  if (selectedExercises.has(id)) {
    selectedExercises.delete(id);
    el.classList.remove('selected');
  } else {
    selectedExercises.add(id);
    el.classList.add('selected');
  }
  updatePlanPreview();
}

// - plan review (create-plan page)
function listenPlanPreview() {
  document.getElementById('plan-name').addEventListener('input', updatePlanPreview);
  document.getElementById('plan-goal').addEventListener('change', updatePlanPreview);
  document.getElementById('plan-days').addEventListener('change', updatePlanPreview);
}
 
function updatePlanPreview() {
  const name = document.getElementById('plan-name').value.trim() || 'My Plan';
  const goal = document.getElementById('plan-goal').value;
  const days = parseInt(document.getElementById('plan-days').value);
  const exIds = [...selectedExercises];
 
  const emptyEl = document.getElementById('preview-empty');
  const contentEl = document.getElementById('preview-content');
 
  if (exIds.length === 0) {
    emptyEl.style.display = 'flex';
    contentEl.style.display = 'none';
    return;
  }
  emptyEl.style.display = 'none';
  contentEl.style.display = 'flex';
 
  document.getElementById('preview-name').textContent = name;
  document.getElementById('preview-meta').textContent = `${days} days/week · ${goal}`;
 
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const perDay = Math.ceil(exIds.length / days);
  let html = '';
  for (let d = 0; d < days; d++) {
    const dayExs = exIds.slice(d * perDay, (d + 1) * perDay);
    if (!dayExs.length) continue;
    html += `<div class="preview-day">
      <div class="preview-day-title">${dayNames[d]}</div>
      ${dayExs.map(id => {
        const ex = EXERCISES_DB.find(e => e.id === id);
        return `<div class="preview-exercise">${ex ? ex.name : id}</div>`;
      }).join('')}
    </div>`;
  }
  document.getElementById('preview-days-container').innerHTML = html;
}

// - save the plan (create-plan page)
function savePlan() {
  const name = document.getElementById('plan-name').value.trim();
  if (!name) { showToast('Missing Name', 'Please give your plan a name!', true); return; }
  if (selectedExercises.size === 0) { showToast('No Exercises', 'Pick at least one exercise.', true); return; }
 
  const plan = {
    id: Date.now(),
    name,
    goal: document.getElementById('plan-goal').value,
    days: parseInt(document.getElementById('plan-days').value),
    notes: document.getElementById('plan-notes').value,
    exercises: [...selectedExercises],
    created: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
  };
  plans.unshift(plan);
  localStorage.setItem('traintrackPlans', JSON.stringify(plans));
  showToast('Plan Saved!', `"${name}" has been added to your plans. View it on the My Plans page.`);
 
  // reset form
  document.getElementById('plan-name').value = '';
  document.getElementById('plan-notes').value = '';
  selectedExercises.clear();
  document.querySelectorAll('.ex-chip.selected').forEach(el => el.classList.remove('selected'));
  document.getElementById('preview-empty').style.display = 'flex';
  document.getElementById('preview-content').style.display = 'none';
}

// - render plans (my-plans page)
function renderPlans() {
  const grid = document.getElementById('plans-grid');
  if (plans.length === 0) {
    grid.innerHTML = `<div class="empty-plans"><span>🏋️</span><p>No plans yet — head to Create Plan to build your first one!</p></div>`;
    return;
  }
  const dayAbbr = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  grid.innerHTML = plans.map(plan => {
    const activeDays = Array.from({length: plan.days}, (_, i) => i);
    const badgeClass = plan.goal;
    const exNames = plan.exercises.map(id => {
      const ex = EXERCISES_DB.find(e => e.id === id);
      return ex ? ex.name : id;
    }).slice(0, 5).join(', ') + (plan.exercises.length > 5 ? '...' : '');
 
    return `<div class="plan-card" onclick="openPlanModal(${plan.id})">
      <div class="plan-card-header">
        <div class="plan-card-name">${plan.name}</div>
        <div class="plan-badge ${badgeClass}">${plan.goal}</div>
      </div>
      <div class="plan-card-days">
        ${dayAbbr.map((d, i) => `<div class="day-dot ${activeDays.includes(i) ? 'active' : ''}">${d}</div>`).join('')}
      </div>
      <div class="plan-card-exercises">${exNames}</div>
      <div class="plan-card-meta">
        <div class="plan-meta-item">Created: <strong>${plan.created}</strong></div>
        <div class="plan-meta-item">${plan.exercises.length} exercises</div>
        <button class="plan-delete" onclick="deletePlan(event, ${plan.id})">✕ Delete</button>
      </div>
    </div>`;
  }).join('');
}
 
function deletePlan(e, id) {
  e.stopPropagation();
  plans = plans.filter(p => p.id !== id);
  localStorage.setItem('traintrackPlans', JSON.stringify(plans));
  renderPlans();
  showToast('Deleted', 'Plan removed.', true);
}
 
function openPlanModal(id) {
  const plan = plans.find(p => p.id === id);
  if (!plan) return;
  document.getElementById('modal-plan-name').textContent = plan.name;
  const exList = plan.exercises.map(id => {
    const ex = EXERCISES_DB.find(e => e.id === id);
    return ex ? `• ${ex.name}` : id;
  }).join('\n');
  document.getElementById('modal-plan-detail').textContent =
    `Goal: ${plan.goal} | ${plan.days} days/week | ${plan.exercises.length} exercises\n\n${exList}${plan.notes ? '\n\nNotes: ' + plan.notes : ''}`;
  document.getElementById('plan-modal').classList.add('open');
}
function closeModal() {
  const modal = document.getElementById('plan-modal');
  if (modal) modal.classList.remove('open');
}

// - exercise library (exercises page)
function renderLibrary() {
  const container = document.getElementById('exercise-library');
  container.innerHTML = EXERCISES_DB.map(ex => `
    <div class="exercise-lib-card" onclick="selectExerciseAndScroll('${ex.id}')">
      <div class="exercise-lib-badge">${ex.badge}</div>
      <div class="exercise-lib-icon">${ex.icon}</div>
      <div class="exercise-lib-name">${ex.name}</div>
      <div class="exercise-lib-muscle">${ex.muscle}</div>
      <div class="exercise-lib-desc">${ex.desc}</div>
    </div>
  `).join('');
}
 
// Picking an exercise from the library lives on a different page than the
// camera, so this navigates to the Form Check page with the choice baked
// into the URL (?exercise=id) instead of just scrolling.
function selectExerciseAndScroll(id) {
  window.location.href = 'index.html?exercise=' + id + '#form-check';
}

// - tips page!
function updateTips(exId) {
  const tips = EXERCISE_TIPS[exId] || EXERCISE_TIPS['rdl'];
  document.querySelector('.tips-box h4').textContent = tips.title;
  document.getElementById('tips-list').innerHTML = tips.tips.map(t => `<li>${t}</li>`).join('');
}