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

// - form check page INIT
function initFormCheckPage() {
  const select = document.getElementById('exercise-select');
 
  // If we arrived here from the Exercises page (?exercise=rdl), preselect it
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('exercise');
  if (preselect && EXERCISES_DB.some(e => e.id === preselect)) {
    select.value = preselect;
  }
  updateTips(select.value);
 
  select.addEventListener('change', function () {
    updateTips(this.value);
  });
}

// - camera / pose (form check page only!!)
async function startSession() {
  try {
    document.getElementById('status-text').textContent = 'Starting…';
    document.getElementById('status-text').classList.add('scanning');
 
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    const video = document.getElementById('webcam');
    video.srcObject = cameraStream;
    await new Promise(r => video.onloadedmetadata = r);
 
    const canvas = document.getElementById('pose-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
 
    document.getElementById('camera-overlay').classList.add('hidden');
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('stop-btn').classList.add('visible');
    document.getElementById('status-text').textContent = 'Detecting…';
 
    repCount = 0;
    document.getElementById('rep-count').textContent = '0';
    document.getElementById('form-score').textContent = '—';
 
    if (typeof Pose !== 'undefined') {
      poseInstance = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });
      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });
      poseInstance.onResults(onPoseResults);
 
      const mpCamera = new Camera(video, {
        onFrame: async () => { await poseInstance.send({ image: video }); },
        width: 640, height: 480
      });
      mpCamera.start();
      window._mpCamera = mpCamera;
    } else {
      // Fallback: simulate angles for demo
      simulateDemo();
    }
 
  } catch (err) {
    console.error(err);
    document.getElementById('status-text').textContent = 'Camera error';
    document.getElementById('status-text').classList.remove('scanning');
    showToast('Camera Error', 'Could not access camera. Please grant permission and try again.', true);
    document.getElementById('start-btn').style.display = 'block';
    document.getElementById('stop-btn').classList.remove('visible');
  }
}
 
function stopSession() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  if (window._mpCamera) {
    try { window._mpCamera.stop(); } catch(e){}
    window._mpCamera = null;
  }
  if (animFrame) { clearInterval(animFrame); animFrame = null; }
  const video = document.getElementById('webcam');
  video.srcObject = null;
 
  document.getElementById('camera-overlay').classList.remove('hidden');
  document.getElementById('start-btn').style.display = 'block';
  document.getElementById('stop-btn').classList.remove('visible');
  document.getElementById('status-text').textContent = 'Idle';
  document.getElementById('status-text').classList.remove('scanning');
 
  const canvas = document.getElementById('pose-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 
  document.getElementById('angle-hip').textContent = '—°';
  document.getElementById('angle-knee').textContent = '—°';
  document.getElementById('angle-back').textContent = '—°';
  document.getElementById('angle-elbow').textContent = '—°';
 
  document.getElementById('feedback-list').innerHTML = `
    <div class="feedback-item">
      <div class="feedback-dot"></div>
      <div class="feedback-text">Session ended — Rep count: ${repCount}
        <span>Final form score: ${document.getElementById('form-score').textContent}</span>
      </div>
    </div>`;
}
 
function calcAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}
 
function onPoseResults(results) {
  const canvas = document.getElementById('pose-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 
  if (!results.poseLandmarks) return;
 
  if (typeof drawConnectors !== 'undefined') {
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: 'rgba(57,255,20,0.7)', lineWidth: 2 });
    drawLandmarks(ctx, results.poseLandmarks, { color: '#ff2d78', lineWidth: 1, radius: 4 });
  }
 
  const lm = results.poseLandmarks;
  const exId = document.getElementById('exercise-select').value;
 
  // Key indices: 11=left shoulder, 12=right shoulder, 23=left hip, 24=right hip
  //              25=left knee, 26=right knee, 27=left ankle, 28=right ankle
  //              13=left elbow, 14=right elbow, 15=left wrist, 16=right wrist
 
  let hipAngle = null, kneeAngle = null, backAngle = null, elbowAngle = null;
 
  try {
    hipAngle = calcAngle(lm[12], lm[24], lm[26]);
    kneeAngle = calcAngle(lm[24], lm[26], lm[28]);
    const hipMid = { x:(lm[23].x+lm[24].x)/2, y:(lm[23].y+lm[24].y)/2 };
    const shoulderMid = { x:(lm[11].x+lm[12].x)/2, y:(lm[11].y+lm[12].y)/2 };
    const vertRef = { x: hipMid.x, y: hipMid.y - 0.2 };
    backAngle = calcAngle(vertRef, hipMid, shoulderMid);
    elbowAngle = calcAngle(lm[12], lm[14], lm[16]);
  } catch(e) {}
 
  if (hipAngle !== null) document.getElementById('angle-hip').textContent = hipAngle + '°';
  if (kneeAngle !== null) document.getElementById('angle-knee').textContent = kneeAngle + '°';
  if (backAngle !== null) document.getElementById('angle-back').textContent = backAngle + '°';
  if (elbowAngle !== null) document.getElementById('angle-elbow').textContent = elbowAngle + '°';
 
  analyseForm(exId, hipAngle, kneeAngle, backAngle, elbowAngle);
  document.getElementById('status-text').classList.remove('scanning');
  document.getElementById('status-text').textContent = 'Tracking ✓';
}
 
function analyseForm(exId, hip, knee, back, elbow) {
  let issues = [];
  let score = 100;
 
  if (exId === 'rdl') {
    if (back !== null && back > 45) { issues.push({ label:'Back rounding', detail:'Keep spine neutral — don\'t round forward', type:'bad' }); score -= 25; }
    if (knee !== null && knee < 140) { issues.push({ label:'Too much knee bend', detail:'RDL is a hip hinge, not a squat', type:'warn' }); score -= 15; }
    if (hip !== null && hip > 160) { issues.push({ label:'Not hinging enough', detail:'Push your hips back further', type:'warn' }); score -= 10; }
    if (hip !== null && hip < 70) { issues.push({ label:'Going too deep', detail:'Stop when you feel hamstring stretch', type:'warn' }); score -= 10; }
    if (hip !== null) {
      if (repPhase === 'up' && hip < 100) { repPhase = 'down'; }
      else if (repPhase === 'down' && hip > 150) { repPhase = 'up'; repCount++; document.getElementById('rep-count').textContent = repCount; }
    }
  } else if (exId === 'squat') {
    if (knee !== null && knee > 100) { issues.push({ label:'Not deep enough', detail:'Aim for thighs parallel to floor', type:'warn' }); score -= 20; }
    if (back !== null && back > 50) { issues.push({ label:'Too much forward lean', detail:'Keep chest up, torso more upright', type:'bad' }); score -= 20; }
    if (knee !== null && knee < 40) { issues.push({ label:'Excellent depth!', detail:'Great range of motion', type:'good' }); }
    if (knee !== null) {
      if (repPhase === 'up' && knee < 90) { repPhase = 'down'; }
      else if (repPhase === 'down' && knee > 150) { repPhase = 'up'; repCount++; document.getElementById('rep-count').textContent = repCount; }
    }
  } else if (exId === 'pushup') {
    if (elbow !== null && elbow > 90 && elbow < 145) { issues.push({ label:'Good depth', detail:'Keep it up!', type:'good' }); }
    if (back !== null && back > 30) { issues.push({ label:'Hips too high or low', detail:'Keep a straight line head to heels', type:'bad' }); score -= 25; }
    if (elbow !== null) {
      if (repPhase === 'up' && elbow < 100) { repPhase = 'down'; }
      else if (repPhase === 'down' && elbow > 155) { repPhase = 'up'; repCount++; document.getElementById('rep-count').textContent = repCount; }
    }
  } else {
    if (back !== null && back < 20) issues.push({ label:'Posture looks good', detail:'Spine is nicely aligned', type:'good' });
    if (back !== null && back > 45) { issues.push({ label:'Watch your posture', detail:'Try to keep spine more neutral', type:'warn' }); score -= 15; }
  }
 
  if (issues.length === 0) {
    issues.push({ label:'Form looks great!', detail:'Keep it up — maintain this technique', type:'good' });
  }
 
  score = Math.max(0, score);
  const scoreEl = document.getElementById('form-score');
  scoreEl.textContent = score + '%';
  scoreEl.style.color = score >= 80 ? 'var(--green)' : score >= 60 ? '#ffae00' : 'var(--pink)';
 
  const feedbackList = document.getElementById('feedback-list');
  feedbackList.innerHTML = issues.map(issue => `
    <div class="feedback-item">
      <div class="feedback-dot ${issue.type}"></div>
      <div class="feedback-text">${issue.label}<span>${issue.detail}</span></div>
    </div>
  `).join('');
}
 
// Demo simulation if MediaPipe not loaded
function simulateDemo() {
  let t = 0;
  animFrame = setInterval(() => {
    t += 0.05;
    const hip = Math.round(90 + 70 * Math.abs(Math.sin(t)));
    const knee = Math.round(155 + 20 * Math.abs(Math.sin(t)));
    const back = Math.round(15 + 10 * Math.abs(Math.sin(t + 0.5)));
    const elbow = Math.round(120 + 40 * Math.abs(Math.sin(t * 1.2)));
 
    document.getElementById('angle-hip').textContent = hip + '°';
    document.getElementById('angle-knee').textContent = knee + '°';
    document.getElementById('angle-back').textContent = back + '°';
    document.getElementById('angle-elbow').textContent = elbow + '°';
 
    analyseForm(document.getElementById('exercise-select').value, hip, knee, back, elbow);
    document.getElementById('status-text').textContent = 'Demo mode ✓';
    document.getElementById('status-text').classList.remove('scanning');
  }, 100);
}

// - toast
function showToast(title, msg, pink = false) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent = msg;
  toast.className = 'toast' + (pink ? ' pink' : '');
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}