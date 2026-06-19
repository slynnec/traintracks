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