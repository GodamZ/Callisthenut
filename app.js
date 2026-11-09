function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
const EXERCISES = {
  jumping_jacks:{name:'Jumping jacks',cat:'ÉCHAUFFEMENT',tip:'Reste léger sur les appuis et garde une respiration régulière.',pose:'jack'},
  squats:{name:'Squats',cat:'JAMBES',tip:'Poitrine haute, hanches vers l’arrière et genoux dans l’axe des pieds.',pose:'squat'},
  pushups:{name:'Pompes',cat:'POUSSÉE',tip:'Gaine tout le corps. Descends la poitrine entre les mains.',pose:'pushup'},
  lunges:{name:'Fentes alternées',cat:'JAMBES',tip:'Fais un grand pas et descends le genou arrière sans le poser.',pose:'lunge'},
  plank:{name:'Planche',cat:'CENTRE',tip:'Pousse le sol, serre les fessiers et garde le bassin neutre.',pose:'plank'},
  climbers:{name:'Mountain climbers',cat:'CARDIO',tip:'Ramène les genoux sous la poitrine sans laisser monter les hanches.',pose:'climber'},
  bridges:{name:'Pont fessier',cat:'CHAÎNE POSTÉRIEURE',tip:'Pousse dans les talons et serre les fessiers en haut.',pose:'bridge'},
  deadbug:{name:'Dead bug',cat:'CENTRE',tip:'Plaque le bas du dos au sol et allonge bras et jambe opposés.',pose:'deadbug'},
  pike:{name:'Pompes pike',cat:'ÉPAULES',tip:'Hanches hautes, tête entre les mains et coudes légèrement ouverts.',pose:'pike'},
  bear:{name:'Bear crawl',cat:'CORPS ENTIER',tip:'Genoux proches du sol, avance main et pied opposés lentement.',pose:'bear'},
  sideplank:{name:'Planche latérale',cat:'OBLIQUES',tip:'Aligne cheville, hanche et épaule. Change de côté à mi-temps.',pose:'sideplank'},
  burpees:{name:'Burpees contrôlés',cat:'CARDIO',tip:'Privilégie un mouvement propre. Marche au lieu de sauter si besoin.',pose:'burpee'},
  calf:{name:'Extensions mollets',cat:'JAMBES',tip:'Monte haut sur les pointes et redescends lentement.',pose:'calf'},
  superman:{name:'Superman',cat:'DOS',tip:'Décolle légèrement bras et jambes, nuque longue, sans forcer le bas du dos.',pose:'superman'},
  dips:{name:'Dips au sol',cat:'TRICEPS',tip:'Doigts vers l’avant, plie les coudes en gardant les épaules basses.',pose:'dip'},
  highknees:{name:'Montées de genoux',cat:'CARDIO',tip:'Grandis-toi et monte les genoux avec des appuis rapides et légers.',pose:'highknees'}
};

const INSTRUCTIONS={
  jack:['Debout, pieds joints et bras le long du corps.','Saute en écartant les pieds pendant que les mains montent au-dessus de la tête.','Reviens souplement et enchaîne sans bloquer les genoux.'],
  squat:['Pieds un peu plus larges que les hanches, pointes légèrement ouvertes.','Recule les fesses comme pour t’asseoir et descends jusqu’à être confortable.','Pousse dans les talons pour remonter, poitrine haute et genoux dans l’axe.'],
  pushup:['Mains sous les épaules, corps aligné de la tête aux talons.','Plie les coudes et descends la poitrine vers le sol, ventre serré.','Repousse le sol sans creuser le dos. Pose les genoux si nécessaire.'],
  lunge:['Debout, fais un grand pas vers l’avant en gardant le buste vertical.','Plie les deux jambes et rapproche le genou arrière du sol.','Pousse dans le pied avant pour revenir, puis change de jambe.'],
  plank:['Avant-bras au sol, coudes sous les épaules et jambes tendues.','Serre abdominaux et fessiers pour aligner tête, dos et talons.','Respire lentement sans laisser les hanches monter ou descendre.'],
  climber:['Pars en planche haute avec les mains sous les épaules.','Ramène un genou vers la poitrine, replace-le puis change de jambe.','Accélère progressivement en gardant les hanches stables.'],
  bridge:['Sur le dos, plie les genoux et pose les pieds près des fesses.','Pousse dans les talons pour lever le bassin.','Serre les fessiers en haut puis redescends lentement.'],
  deadbug:['Sur le dos, bras vers le plafond et genoux à angle droit.','Allonge un bras et la jambe opposée sans décoller les lombaires.','Reviens au centre puis change de côté avec contrôle.'],
  pike:['Depuis la planche, monte les hanches pour former un V inversé.','Plie les coudes et dirige le sommet de la tête entre les mains.','Repousse dans les paumes en gardant les hanches hautes.'],
  bear:['À quatre pattes, mains sous les épaules et genoux sous les hanches.','Décolle les genoux puis avance main et pied opposés.','Fais de petits pas avec le dos plat et le bassin stable.'],
  sideplank:['Sur le côté, place le coude sous l’épaule et allonge les jambes.','Soulève le bassin pour aligner pieds, hanches et tête.','Garde l’épaule basse et change de côté à mi-temps.'],
  burpee:['Debout, accroupis-toi et pose les mains devant les pieds.','Recule les pieds en planche puis ramène-les sous le corps.','Redresse-toi avec un petit saut, ou simplement sur les pointes.'],
  calf:['Debout, pieds parallèles et ventre légèrement contracté.','Monte le plus haut possible sur la pointe des pieds.','Marque une pause puis redescends lentement.'],
  superman:['Sur le ventre, tends les bras devant toi et garde la nuque neutre.','Décolle légèrement bras, poitrine et jambes.','Tiens une seconde puis redescends sans jeter la tête en arrière.'],
  dip:['Assis, place les mains derrière toi, doigts vers les pieds.','Décolle les fesses et plie les coudes vers l’arrière.','Pousse dans les paumes en gardant les épaules basses.'],
  highknees:['Tiens-toi droit, pieds largeur de hanches.','Monte alternativement chaque genou vers la hauteur des hanches.','Reste léger sur les pieds et conserve un rythme contrôlé.']
};

const LEGACY_EXERCISES={...EXERCISES};
for(const [id,theme] of Object.entries({jumping_jacks:'cardio',pushups:'arms',lunges:'legs',plank:'abs',climbers:'cardio',pike:'arms',burpees:'cardio',calf:'legs',dips:'arms',highknees:'cardio'})){
  const e=LEGACY_EXERCISES[id];CATALOG.push({...e,id,stage:id==='jumping_jacks'?'warm':'strength',themes:[theme],steps:INSTRUCTIONS[e.pose]});
}
for(const exercise of CATALOG)EXERCISES[exercise.id]={...exercise,cat:exercise.themes.map(t=>THEMES[t]).join(' · ')};
const PROGRAM=[{title:'Ancienne séance',met:6.5}];
const DAY_NAMES=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const QUESTS=[
 {id:'daily-strength',icon:'⚡',name:'Mini-défi du jour',detail:'Renforcement · obligatoire',minutes:0,met:0,xp:25,mandatory:true},
 {id:'workout',icon:'⚔',name:'La voie du guerrier',detail:'Calisthénie · 15 min',minutes:15,met:5,xp:60},
 {id:'walk',icon:'❀',name:'Marche active',detail:'Marche active · 20 min minimum',minutes:20,met:3.5,xp:45,flexible:true},
 {id:'run',icon:'➶',name:'Course à pied',detail:'Course · 15 min minimum',minutes:15,met:8,xp:60,flexible:true},
 {id:'bike',icon:'☸',name:'Faire du vélo',detail:'Vélo · 30 min minimum',minutes:30,met:6,xp:60,flexible:true},
 {id:'kettlebell',icon:'◆',name:'La force du cristal',detail:'Kettlebell · 15 min',minutes:15,met:6,xp:60},
 {id:'shadowboxing',icon:'✊',name:'Shadow boxing',detail:'Boxe dans le vide · 15 min minimum',minutes:15,met:5,xp:60,flexible:true},
 {id:'bedtime',icon:'☾',name:'Se coucher tôt',detail:'Sommeil · défi permanent',minutes:0,met:0,xp:40,permanent:true},
 {id:'nutrition',icon:'♧',name:'Bien manger',detail:'Alimentation · déclaration du jour',minutes:0,met:0,xp:0,permanent:true},
 {id:'water',icon:'♧',name:'Boire de l\'eau',detail:'Hydratation · cible personnelle',minutes:0,met:0,xp:40}
];
let activeQuest=null;
const questDurationDrafts={};
const questCalorieDrafts={};
let xpAnimation=null,pendingXpReward=null;
const state=loadState();
initRpg();
state.duration=Number(state.duration)===20?20:15;
if(!Number.isInteger(state.planSeed)){state.planSeed=crypto.getRandomValues(new Uint32Array(1))[0];saveState()}
let session=null,timerId=null,reminderId=null,audioContext=null,cindySession=null,cindyTimerId=null,kettlebellSession=null,kettlebellTimerId=null;

let screenWakeLock=null,wakeLockPending=false;
function needsScreenAwake(){return Boolean(session||cindySession||kettlebellSession)&&!document.hidden}
async function syncScreenWakeLock(){
  if(!needsScreenAwake()){
    const lock=screenWakeLock;screenWakeLock=null;
    if(lock)try{await lock.release()}catch{}
    return;
  }
  if(!navigator.wakeLock||screenWakeLock||wakeLockPending)return;
  wakeLockPending=true;
  try{
    const lock=await navigator.wakeLock.request('screen');
    if(!needsScreenAwake()){await lock.release();return}
    screenWakeLock=lock;
    lock.addEventListener('release',()=>{if(screenWakeLock===lock)screenWakeLock=null});
  }catch{
    // The device may refuse the request (for example in battery saver mode).
  }finally{wakeLockPending=false}
}

function loadState(){
  const base={name:'soldat',duration:15,level:1,weight:70,reminder:'18:30',sound:true,goals:{},history:[]};
  try{return {...base,...JSON.parse(localStorage.getItem('callisthenut-state')||localStorage.getItem('callisterik-state')||'{}')}}catch{return base}
}
function saveState(){localStorage.setItem('callisthenut-state',JSON.stringify(state))}
function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function todayProgram(){return programForDate(new Date(),state.duration,state.planSeed)}
function estimatedCalories(program=todayProgram(),minutes=state.duration){return Math.round(program.met*3.5*state.weight/200*minutes)}
function completeDailyWorkout(){
 pendingXpReward=null;
 const h=state.history[state.history.length-1];
 if(!h.minutes){document.querySelector("#finishXp").textContent="0 XP";return}
 const previous=heroLevel();
 const id=h.title.toLowerCase().includes('kettlebell')?'kettlebell':'workout';
 const reward=claimQuest(id,h.calories,false);
 document.querySelector('#finishXp').textContent=reward?`+${reward} XP${heroLevel()>previous?" · LVL "+heroLevel()+" !":""}`:'Quête déjà récompensée aujourd’hui';
}
function svg(pose){
  const poses={
    squat:'<circle cx="115" cy="48" r="17"/><path d="M114 67l-15 58 54 18m-39-71 42 38m-52 17-36 38m85-22 20 43M96 88l-40 20m62-24 32 9"/>',
    pushup:'<circle cx="52" cy="112" r="16"/><path d="M68 113l76 17 54 3m-130-17-30 39m47-35-25 42m81-31 32 38m25-35 22 32"/>',
    plank:'<circle cx="55" cy="103" r="16"/><path d="M71 108l75 23 62 3M91 114l-27 45m82-28 35 43m27-40 25 37"/>',
    lunge:'<circle cx="110" cy="40" r="17"/><path d="M110 58v69m0-55-33 36m34-35 37 28m-38 26-49 45m49-45 62 10 29 37"/>',
    bridge:'<circle cx="47" cy="144" r="16"/><path d="M63 145l51-42 61 38m-94-16-20 36m114-20 36 25m-96-63 32-43"/>',
    pike:'<circle cx="51" cy="149" r="15"/><path d="M66 147l62-67 67 73M78 134l-24 41m75-94 11-41m55 113 27 20"/>',
    sideplank:'<circle cx="54" cy="148" r="15"/><path d="M69 145l65-35 74 39M94 131l-17 49m57-70 7-70m67 109 25 28"/>',
    deadbug:'<circle cx="56" cy="146" r="16"/><path d="M72 145l75 1m-52-2-32-67m38 69 43-66m-9 67 51 39m-39-40 52-35"/>',
    superman:'<circle cx="67" cy="123" r="15"/><path d="M82 128l68 17 63-19M103 133l-45-36m92 48 63 28"/>',
    bear:'<circle cx="56" cy="98" r="15"/><path d="M71 102l69 27 61-13m-105-4-44 55m88-38-18 51m79-64 27 46"/>',
    dip:'<circle cx="85" cy="82" r="16"/><path d="M91 99l25 55 73 1m-83-30-40 34m50-5-18 32m91-31 27 31"/>',
    jack:'<circle cx="128" cy="44" r="17"/><path d="M128 62v73m0-48L69 55m59 32 59-32m-59 80-50 58m50-58 50 58"/>',
    highknees:'<circle cx="119" cy="41" r="17"/><path d="M119 59v70m0-46-42 31m42-31 39 29m-39 17-40 55m40-55 51 21 22 38"/>',
    climber:'<circle cx="57" cy="102" r="15"/><path d="M72 107l70 24 67 3m-109-17-46 47m88-33-38 33m38-33 56 46"/>',
    calf:'<circle cx="127" cy="41" r="17"/><path d="M127 58v76m0-48-41 21m41-21 41 21m-41 27-22 59m22-59 27 59"/>',
    burpee:'<circle cx="128" cy="44" r="17"/><path d="M128 61v71m0-43-49 22m49-22 49 22m-49 21-34 61m34-61 34 61"/>'
  };
  return `<svg viewBox="0 0 256 220" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${poses[pose]||poses.squat}</g><path d="M40 202h176" stroke="currentColor" stroke-width="3" opacity=".18"/></svg>`;
}
function render(){
  settleDays();
  const now=new Date(),program=todayProgram(),doneGoals=state.goals[dateKey()]||[];
  document.querySelector('#todayDate').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
  document.querySelector('#userName').textContent=state.name||'soldat';
  document.querySelector('#workoutTitle').textContent=program.title;
  document.querySelector('#workoutFocus').textContent=program.focus;
  document.querySelector('#workoutLevel').textContent=`NIVEAU ${state.level}`;
  document.querySelector('#workoutMeta').textContent=`${state.duration} min · ${program.ids.length} exercices · ≈ ${estimatedCalories(program)} kcal`;
  document.querySelector('#heroVisual').innerHTML=exerciseIllustration(EXERCISES[program.blocks[2].ids[0]]);
  const streak=getStreak();document.querySelector('#streakCount').textContent=streak;document.querySelector('#progressStreak').textContent=streak;
  document.querySelector('#menuName').textContent=state.name==='soldat'?'Soldat':state.name;
  document.querySelector('#menuLevel').textContent=['','Débutant','Intermédiaire','Avancé'][state.level];
  document.querySelector('#menuDuration').textContent=state.duration;
  document.querySelector('#menuReminder').textContent=`Tous les jours à ${state.reminder}`;
  renderRpg();
  if(typeof renderHealth==='function')renderHealth();
  renderPlan();renderProgress();fillSettings();renderSessionPreview();
}
function renderPlan(){
  const monday=new Date();monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
  document.querySelector('#weekStrip').innerHTML=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);const done=state.history.some(h=>h.date===dateKey(d));return `<div class="week-day ${dateKey(d)===dateKey()?'today':''} ${done?'done':''}"><small>${DAY_NAMES[d.getDay()]}</small><strong>${d.getDate()}</strong></div>`}).join('');
  const todayIndex=(new Date().getDay()+6)%7;
  document.querySelector('#planList').innerHTML=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);return programForDate(d,state.duration,state.planSeed)}).map((p,i)=>`<article class="plan-card ${i===todayIndex?'today':''}"><span class="plan-number">${String(i+1).padStart(2,'0')}</span><span class="plan-info"><strong>${p.title}</strong><small>${p.focus} · ${state.duration} min</small></span><span class="plan-status">${state.history.some(h=>{const d=new Date(monday);d.setDate(d.getDate()+i);return h.date===dateKey(d)})?'✓':i===todayIndex?'→':'·'}</span></article>`).join('');
}
function renderProgress(){
  document.querySelector('#totalSessions').textContent=state.history.length;
  document.querySelector('#totalMinutes').textContent=Math.round(state.history.reduce((n,h)=>n+h.minutes,0)*10)/10;
  document.querySelector('#totalCalories').textContent=state.history.reduce((n,h)=>n+(h.calories??estimatedCalories(PROGRAM.find(p=>p.title===h.title)||PROGRAM[0],h.minutes)),0);
  const days=Array.from({length:28},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(27-i));return d});
  document.querySelector('#activityGrid').innerHTML=days.map(d=>`<span class="activity-cell ${state.history.some(h=>h.date===dateKey(d))?'active':''} ${dateKey(d)===dateKey()?'today':''}" title="${d.toLocaleDateString('fr-FR')}"></span>`).join('');
  document.querySelector('#historyList').innerHTML=state.history.length?state.history.slice().reverse().slice(0,6).map(h=>`<div class="history-item"><div><strong>${escapeHtml(h.title)}</strong><small>${new Date(h.date+'T12:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}${h.rounds!==undefined?` · ${h.rounds} tours`:''}${h.source==='manual'?' · Saisie manuelle':''}</small></div><span>${h.minutes} min · ${h.estimated===false?'':'≈ '}${h.calories??estimatedCalories(PROGRAM.find(p=>p.title===h.title)||PROGRAM[0],h.minutes)} kcal</span></div>`).join(''):'<div class="empty-state">Ta première mission apparaîtra ici.</div>';
}
function getStreak(){let n=0,d=new Date();if(!state.history.some(h=>h.date===dateKey(d)))d.setDate(d.getDate()-1);while(state.history.some(h=>h.date===dateKey(d))){n++;d.setDate(d.getDate()-1)}return n}
function fillSettings(){nameInput.value=state.name==='soldat'?'':state.name;durationSelect.value=state.duration;levelSelect.value=state.level;weightInput.value=state.weight;reminderTime.value=state.reminder}
function buildTimeline(program=todayProgram()){return timelineForProgram(program,EXERCISES)}
function prepareAudio(){if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume()}
function beep(){
  if(!state.sound||!audioContext)return;
  const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;
  oscillator.type='sine';oscillator.frequency.setValueAtTime(880,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.22,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.16);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+.18);
}
function updateSoundButton(){const button=document.querySelector('#soundToggle');button.textContent=state.sound?'♪':'♩';button.classList.toggle('sound-off',!state.sound);button.setAttribute('aria-label',state.sound?'Couper les signaux sonores':'Activer les signaux sonores')}
function startWorkout(){prepareAudio();const program=todayProgram();session={program,date:dateKey(),minutes:state.duration,timeline:buildTimeline(program),position:0,remaining:0,running:true,elapsed:0};loadPhase();workoutPlayer.showModal();timerId=setInterval(tick,1000);syncScreenWakeLock()}
function loadPhase(){const phase=session.timeline[session.position];session.remaining=phase.seconds;updatePlayer()}
function tick(){if(!session?.running)return;const phase=session.timeline[session.position];if(session.remaining>1){session.remaining--;if(session.remaining<=3)beep();session.elapsed++;updatePlayer()}else{session.elapsed++;advance(1)}}
function advance(delta){const next=session.position+delta;if(next<0)return;if(next>=session.timeline.length){finishWorkout();return}session.position=next;loadPhase()}
function updatePlayer(){
  const p=session.timeline[session.position],isRest=p.type==='rest',isPrep=p.type==='prep';
  workoutPlayer.classList.toggle('is-recovery',isRest);
  playerPhase.textContent=isPrep?'DÉPART IMMINENT':isRest?'RÉCUPÉRATION':'AU TRAVAIL';playerStep.textContent=isPrep?'LA SÉANCE VA COMMENCER':isRest?(p.transition?'CHANGEMENT DE THÈME · PROCHAIN EXERCICE':'PROCHAIN EXERCICE'):`EXERCICE ${p.index+1} SUR ${session.program.ids.length}`;
  exerciseCategory.textContent=isPrep?'PRÉPARE-TOI':p.label;exerciseName.textContent=isPrep?`Premier : ${p.exercise.name}`:isRest?`Ensuite : ${p.exercise.name}`:p.exercise.name;
  exerciseFigure.innerHTML=exerciseIllustration(p.exercise);exerciseTip.textContent=p.exercise.tip+(p.exercise.imageNote?' '+p.exercise.imageNote:'');
  movementSteps.setAttribute('aria-label',isRest||isPrep?'Explication du prochain exercice':'Explication du mouvement');
  movementSteps.innerHTML=(p.exercise.steps||INSTRUCTIONS[p.exercise.pose]).map(step=>`<li>${step}</li>`).join('');
  timerDisplay.textContent=`${String(Math.floor(session.remaining/60)).padStart(2,'0')}:${String(session.remaining%60).padStart(2,'0')}`;
  timerRing.style.setProperty('--progress',`${Math.max(0,session.remaining/p.seconds)*360}deg`);
  timerCaption.textContent=isPrep?'AVANT LE DÉPART':isRest?'RÉCUPÉRATION':'TEMPS RESTANT';
  liveCalories.textContent=Math.round(session.program.met*3.5*state.weight/200*(session.elapsed/60));
  playerProgress.style.width=`${(session.timeline.slice(0,session.position).reduce((sum,phase)=>sum+phase.seconds,0)+p.seconds-session.remaining)/(session.minutes*60)*100}%`;
  pauseLabel.textContent=session.running?'Pause':'Reprendre';pauseTimer.querySelector('.pause-symbol').textContent=session.running?'Ⅱ':'▶';pauseTimer.classList.toggle('paused',!session.running);
  document.title=`${session.remaining}s · ${p.exercise.name} — Callisthenut`;
}
function finishWorkout(){
  clearInterval(timerId);const p=session.program,minutes=Math.round(session.elapsed/60*10)/10,calories=estimatedCalories(p,minutes);state.history.push({id:Date.now(),date:session.date,title:p.title,minutes,calories});
  completeDailyWorkout();saveState();session=null;syncScreenWakeLock();workoutPlayer.close();document.title='Callisthenut';render();
  finishMinutes.textContent=minutes;finishCalories.textContent=calories;finishExercises.textContent=p.ids.length;finishMetricLabel.textContent='EXERCICES';navigateTo('today');finishScreen.showModal();animateFinishedWorkout();
}
function closeWorkout(){clearInterval(timerId);session=null;syncScreenWakeLock();workoutPlayer.close();document.title='Callisthenut'}
function cindyConfig(variant){return variant==='classic'?{name:'CINDY classique',minutes:20,met:8,reps:30,moves:[['5','Tractions','Menton au-dessus de la barre'],['10','Pompes','Poitrine proche du sol'],['15','Squats','Hanches sous les genoux']]}:{name:'CINDY débutant',minutes:15,met:6,reps:18,moves:[['3','Tirages horizontaux','Sous une table parfaitement stable'],['6','Pompes inclinées','Mains sur un support stable'],['9','Squats','Amplitude confortable']]}}
function startCindy(variant){
  prepareAudio();const config=cindyConfig(variant);cindySession={variant,config,remaining:config.minutes*60-10,prep:10,rounds:0,running:true};
  document.querySelector('#cindySound').textContent=state.sound?'♪':'♩';
  document.querySelector('#cindyLevelLabel').textContent=config.name.toUpperCase();document.querySelector('#cindyMovements').innerHTML=config.moves.map(move=>`<div class="cindy-movement"><b>${move[0]}</b><span><strong>${move[1]}</strong><small>${move[2]}</small></span></div>`).join('');
  updateCindy();document.querySelector('#cindyPlayer').showModal();cindyTimerId=setInterval(tickCindy,1000);syncScreenWakeLock();
}
function tickCindy(){if(!cindySession?.running)return;if(cindySession.prep>0){if(cindySession.prep>1){cindySession.prep--;if(cindySession.prep<=3)beep()}else cindySession.prep=0}else if(cindySession.remaining>1){cindySession.remaining--;if(cindySession.remaining<=3)beep()}else{cindySession.remaining=0;finishCindyWorkout()}updateCindy()}
function updateCindy(){if(!cindySession)return;const value=cindySession.prep||cindySession.remaining;document.querySelector('#cindyTimer').textContent=`${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;document.querySelector('#cindyRounds').textContent=cindySession.rounds;document.querySelector('#pauseCindy').textContent=cindySession.running?'Ⅱ  Pause':'▶  Reprendre';document.querySelector('#cindyLevelLabel').textContent=cindySession.prep?`DÉPART DANS ${cindySession.prep} SECONDES`:cindySession.config.name.toUpperCase()}
function closeCindyWorkout(){clearInterval(cindyTimerId);cindySession=null;syncScreenWakeLock();document.querySelector('#cindyPlayer').close()}
function finishCindyWorkout(){
  if(!cindySession)return;clearInterval(cindyTimerId);const {config,rounds,remaining}=cindySession,elapsed=Math.max(1,Math.round((config.minutes*60-remaining)/60)),calories=Math.round(config.met*3.5*state.weight/200*elapsed),reps=rounds*config.reps;
  state.history.push({id:Date.now(),date:dateKey(),title:config.name,minutes:elapsed,calories,rounds,reps});completeDailyWorkout();saveState();cindySession=null;syncScreenWakeLock();document.querySelector('#cindyPlayer').close();render();finishMinutes.textContent=elapsed;finishCalories.textContent=calories;finishExercises.textContent=reps;finishMetricLabel.textContent='RÉPÉTITIONS';navigateTo('today');finishScreen.showModal();animateFinishedWorkout();
}
function kettlebellConfig(variant){return variant==='classic'?{name:'Kettlebell essentiel',minutes:18,met:7.5,reps:38,moves:[['10','Deadlifts','Pousse les hanches en arrière, dos neutre'],['8/bras','Rowings unilatéraux','Coude vers la hanche, buste stable'],['12','Swings russes','Puissance des hanches, pas des bras'],['20 s','Gainage avec tirage','Option : planche statique sans charge']]}:{name:'Kettlebell initiation',minutes:15,met:5.8,reps:30,moves:[['8','Deadlifts','Charge près du corps, dos neutre'],['6/bras','Rowings assistés','Main libre sur un support stable'],['10','Goblet squats','Kettlebell contre la poitrine'],['20 s','Suitcase hold','Debout, grandis-toi sans pencher']]}}
function startKettlebell(variant){
  prepareAudio();const config=kettlebellConfig(variant);kettlebellSession={variant,config,remaining:config.minutes*60-10,prep:10,rounds:0,running:true};
  document.querySelector('#kettlebellSound').textContent=state.sound?'♪':'♩';document.querySelector('#kettlebellMovements').innerHTML=config.moves.map(move=>`<div class="cindy-movement"><b>${move[0]}</b><span><strong>${move[1]}</strong><small>${move[2]}</small></span></div>`).join('');
  updateKettlebell();document.querySelector('#kettlebellPlayer').showModal();kettlebellTimerId=setInterval(tickKettlebell,1000);syncScreenWakeLock();
}
function tickKettlebell(){if(!kettlebellSession?.running)return;if(kettlebellSession.prep>0){if(kettlebellSession.prep>1){kettlebellSession.prep--;if(kettlebellSession.prep<=3)beep()}else kettlebellSession.prep=0}else if(kettlebellSession.remaining>1){kettlebellSession.remaining--;if(kettlebellSession.remaining<=3)beep()}else{kettlebellSession.remaining=0;finishKettlebellWorkout()}updateKettlebell()}
function updateKettlebell(){if(!kettlebellSession)return;const value=kettlebellSession.prep||kettlebellSession.remaining;document.querySelector('#kettlebellTimer').textContent=`${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;document.querySelector('#kettlebellRounds').textContent=kettlebellSession.rounds;document.querySelector('#pauseKettlebell').textContent=kettlebellSession.running?'Ⅱ  Pause':'▶  Reprendre';document.querySelector('#kettlebellLevelLabel').textContent=kettlebellSession.prep?`DÉPART DANS ${kettlebellSession.prep} SECONDES`:kettlebellSession.config.name.toUpperCase()}
function closeKettlebellWorkout(){clearInterval(kettlebellTimerId);kettlebellSession=null;syncScreenWakeLock();document.querySelector('#kettlebellPlayer').close()}
function finishKettlebellWorkout(){
  if(!kettlebellSession)return;clearInterval(kettlebellTimerId);const {config,rounds,remaining}=kettlebellSession,elapsed=Math.max(1,Math.round((config.minutes*60-remaining)/60)),calories=Math.round(config.met*3.5*state.weight/200*elapsed),reps=rounds*config.reps;
  state.history.push({id:Date.now(),date:dateKey(),title:config.name,minutes:elapsed,calories,rounds,reps});completeDailyWorkout();saveState();kettlebellSession=null;syncScreenWakeLock();document.querySelector('#kettlebellPlayer').close();render();finishMinutes.textContent=elapsed;finishCalories.textContent=calories;finishExercises.textContent=rounds;finishMetricLabel.textContent='TOURS';navigateTo('today');finishScreen.showModal();animateFinishedWorkout();
}
function scheduleReminder(){
  clearTimeout(reminderId);if(!('Notification' in window)||Notification.permission!=='granted')return;
  const [h,m]=state.reminder.split(':').map(Number),now=new Date(),next=new Date();next.setHours(h,m,0,0);if(next<=now)next.setDate(next.getDate()+1);
  reminderId=setTimeout(()=>{new Notification('Callisthenut',{body:'Ta mission du jour t’attend. 15 minutes, pas d’excuse.',icon:'icon.svg'});scheduleReminder()},next-now);
}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}

function navigateTo(target,updateHash=true){
 const allowed=['today','activities','challenge','steps','manual','plan','progress','menu'];
 if(!allowed.includes(target))target='today';
 document.querySelectorAll('.nav-item,.view').forEach(x=>x.classList.remove('active'));
 const nav=['challenge','manual','plan','steps'].includes(target)?'activities':target;
 document.querySelector(`.nav-item[data-target="${nav}"]`)?.classList.add('active');
 const view=document.querySelector(`[data-view="${target}"]`);view.classList.add('active');
 if(updateHash&&window.location){const hash=target==='challenge'&&activeQuest?`challenge/${activeQuest}`:target;if(window.location.hash!==`#${hash}`)window.location.hash=hash}
 scrollTo({top:0,behavior:'smooth'});
 document.querySelector('#app').focus?.({preventScroll:true});
}
function openChallenge(id,updateHash=true){
 if(!QUESTS.some(q=>q.id===id)){navigateTo('today',updateHash);return}
 activeQuest=id;settleDays();if(id==='bedtime'){document.querySelector('#sleepWake').value=sleepTarget().wake;document.querySelector('#sleepHours').value=sleepTarget().hours}renderChallenge();navigateTo('challenge',updateHash);
}
function routeFromHash(){
 const route=window.location?.hash?.slice(1)||'today';
 if(route.startsWith('challenge/'))openChallenge(route.slice(10),false);else navigateTo(route,false);
}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigateTo(b.dataset.target)));
document.addEventListener('click',event=>{
 const route=event.target.closest('[data-screen]');if(route)navigateTo(route.dataset.screen);
 const challenge=event.target.closest('[data-open-quest]');if(challenge)openChallenge(challenge.dataset.openQuest);
});
window.addEventListener('hashchange',routeFromHash);
window.addEventListener('pageshow',routeFromHash);
document.querySelector('#completeChallenge').addEventListener('click',()=>{
 const q=QUESTS.find(q=>q.id===activeQuest);if(!q)return;
 // Guided activities are completed by the existing workout players.
 if(['workout','kettlebell'].includes(q.id))return;
 try{
  const minutes=q.flexible?document.querySelector('#challengeDuration').value:q.minutes;
  const energy=q.id==='shadowboxing'?questCalorieDetails(q,minutes,document.querySelector('#shadowCalories').value):null;
  claimQuest(q.id,energy?.source.includes('declared')?energy.calories:undefined,true,minutes,energy?.source);
 }catch(error){document.querySelector('#challengeDurationError').textContent=error.message}
});

document.querySelector('#startWorkout').addEventListener('click',startWorkout);
document.querySelector('#closePlayer').addEventListener('click',closeWorkout);
document.querySelector('#nextExercise').addEventListener('click',()=>advance(1));
document.querySelector('#previousExercise').addEventListener('click',()=>advance(-1));
document.querySelector('#pauseTimer').addEventListener('click',()=>{session.running=!session.running;updatePlayer()});
document.querySelector('#soundToggle').addEventListener('click',()=>{prepareAudio();state.sound=!state.sound;saveState();updateSoundButton();if(state.sound){beep();toast('Signaux sonores activés')}else toast('Signaux sonores coupés')});
document.querySelector('#startCindyClassic').addEventListener('click',()=>startCindy('classic'));
document.querySelector('#startCindyBeginner').addEventListener('click',()=>startCindy('beginner'));
document.querySelector('#completeRound').addEventListener('click',()=>{if(!cindySession||cindySession.prep)return;cindySession.rounds++;updateCindy()});
document.querySelector('#pauseCindy').addEventListener('click',()=>{if(!cindySession)return;cindySession.running=!cindySession.running;updateCindy()});
document.querySelector('#closeCindy').addEventListener('click',closeCindyWorkout);
document.querySelector('#finishCindy').addEventListener('click',finishCindyWorkout);
document.querySelector('#cindySound').addEventListener('click',()=>{prepareAudio();state.sound=!state.sound;saveState();updateSoundButton();document.querySelector('#cindySound').textContent=state.sound?'♪':'♩';if(state.sound)beep()});
document.querySelector('#startKettlebellClassic').addEventListener('click',()=>startKettlebell('classic'));
document.querySelector('#startKettlebellBeginner').addEventListener('click',()=>startKettlebell('beginner'));
document.querySelector('#completeKettlebellRound').addEventListener('click',()=>{if(!kettlebellSession||kettlebellSession.prep)return;kettlebellSession.rounds++;updateKettlebell()});
document.querySelector('#pauseKettlebell').addEventListener('click',()=>{if(!kettlebellSession)return;kettlebellSession.running=!kettlebellSession.running;updateKettlebell()});
document.querySelector('#closeKettlebell').addEventListener('click',closeKettlebellWorkout);
document.querySelector('#finishKettlebell').addEventListener('click',finishKettlebellWorkout);
document.querySelector('#kettlebellSound').addEventListener('click',()=>{prepareAudio();state.sound=!state.sound;saveState();updateSoundButton();document.querySelector('#kettlebellSound').textContent=state.sound?'♪':'♩';if(state.sound)beep()});
document.querySelector('#settingsButton').addEventListener('click',()=>document.querySelector('#settingsPanel').showModal());
document.querySelector('#openPreferences').addEventListener('click',()=>document.querySelector('#settingsPanel').showModal());
document.querySelector('#openReminder').addEventListener('click',()=>document.querySelector('#settingsPanel').showModal());
document.querySelector('#closeFinish').addEventListener('click',()=>{stopXpAnimation();document.querySelector('#finishScreen').close();render();navigateTo('today')});
document.querySelector('#enableNotifications').addEventListener('click',async()=>{if(!('Notification'in window)){notificationStatus.textContent='Non disponible dans ce navigateur';return}const result=await Notification.requestPermission();notificationStatus.textContent=result==='granted'?'Rappel actif lorsque l’app est ouverte':'Notifications refusées';if(result==='granted')scheduleReminder()});
document.querySelector('#saveSettings').addEventListener('click',()=>{state.name=nameInput.value.trim()||'soldat';state.duration=Number(durationSelect.value);state.level=Number(levelSelect.value);state.weight=Math.min(250,Math.max(35,Number(weightInput.value)||70));state.reminder=reminderTime.value;saveState();scheduleReminder();render();toast('Réglages enregistrés')});
window.addEventListener('keydown',e=>{if(e.code==='Space'&&session){e.preventDefault();session.running=!session.running;updatePlayer()}});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{});
render();updateSoundButton();scheduleReminder();

function renderSessionPreview(){
  const p=todayProgram();
  document.querySelector('#sessionPreview').innerHTML=p.blocks.map(b=>`<details class="session-block"><summary>${b.label}<small>${b.ids.length} exercices · 40 s chacun</small></summary>${b.ids.map(id=>exerciseCard(EXERCISES[id])).join('')}</details>`).join('');
}
function exerciseCard(e){return `<article class="catalog-exercise"><div class="catalog-picture">${exerciseIllustration(e)}</div><div><strong>${e.name}</strong>${e.imageNote?`<p class="timing-note">${e.imageNote}</p>`:''}<ol>${(e.steps||INSTRUCTIONS[e.pose]).map(s=>`<li>${s}</li>`).join('')}</ol></div></article>`}
function renderCatalog(){
  const value=document.querySelector('#catalogFilter').value;
  const entries=CATALOG.filter(e=>!value||e.stage===value||e.themes.includes(value));
  document.querySelector('#catalogCount').textContent=`${entries.length} exercices`;
  document.querySelector('#exerciseCatalog').innerHTML=Object.entries(STAGES).map(([stage,label])=>{const group=entries.filter(e=>e.stage===stage);return group.length?`<details class="session-block"><summary>${label}<small>${group.length} exercices</small></summary>${group.map(exerciseCard).join('')}</details>`:''}).join('');
}
document.querySelector('#catalogFilter').addEventListener('change',renderCatalog);
renderCatalog();
document.querySelector('#workoutPlayer').addEventListener('cancel',event=>{event.preventDefault();closeWorkout()});
document.addEventListener('visibilitychange',()=>{syncScreenWakeLock();if(!document.hidden&&!session)render()});
for(const [id,close] of [['#cindyPlayer',closeCindyWorkout],['#kettlebellPlayer',closeKettlebellWorkout]])document.querySelector(id).addEventListener('cancel',event=>{event.preventDefault();close()});

// RPG progression is separate from the exercise difficulty preference.
function xpThreshold(level){return 500*(level-1)+50*(level-1)*(level-1)}
function heroLevel(xp=state.rpg.xp){let level=1;while(level<99&&xp>=xpThreshold(level+1))level++;return level}
function xpAnimationSegments(from,to){
 const max=xpThreshold(99);from=Math.min(max,Math.max(0,from));to=Math.min(max,Math.max(from,to));
 const segments=[];let cursor=from;
 while(cursor<to){
  const level=heroLevel(cursor),end=Math.min(to,xpThreshold(level+1));
  segments.push({from:cursor,to:end,level,levelUp:end===xpThreshold(level+1)});cursor=end;
 }
 return segments;
}
function stopXpAnimation(){
 if(xpAnimation){
  if(xpAnimation.frame!=null)window.cancelAnimationFrame?.(xpAnimation.frame);
  if(xpAnimation.wait!=null)clearTimeout(xpAnimation.wait);
 }
 xpAnimation=null;pendingXpReward=null;
 for(const prefix of ['quest','finish'])document.querySelector(`#${prefix}XpAnimation`).classList.remove('is-filling','is-leveling');
}
function animateXpReward(prefix,from,to){
 stopXpAnimation();
 const root=document.querySelector(`#${prefix}XpAnimation`),bar=document.querySelector(`#${prefix}AnimatedXp`),label=document.querySelector(`#${prefix}AnimatedXpLabel`),levelLabel=document.querySelector(`#${prefix}AnimatedLevel`),banner=document.querySelector(`#${prefix}LevelCelebration`);
 root.hidden=false;banner.hidden=true;
 const segments=xpAnimationSegments(from,to);
 const paint=(xp,level=heroLevel(xp))=>{
  const floor=xpThreshold(level),span=xpThreshold(Math.min(99,level+1))-floor;
  const progress=level===99?100:Math.min(100,(xp-floor)/span*100);
  bar.value=progress;label.textContent=level===99?'Niveau maximum atteint':`${Math.round(xp-floor)} / ${span} XP`;
  levelLabel.textContent=`LVL ${String(level).padStart(2,'0')}`;
  document.querySelector('#heroLevel').textContent=String(level).padStart(2,'0');
  document.querySelector('#heroXp').value=progress;document.querySelector('#xpLabel').textContent=label.textContent;
 };
 const celebrate=level=>{
  banner.hidden=false;banner.textContent=`✦ NIVEAU SUPÉRIEUR · LVL ${level} ✦`;
  root.classList.remove('is-leveling');void root.offsetWidth;root.classList.add('is-leveling');
 };
 // Reduced motion keeps the final result and level announcement, without effects.
 if(!segments.length||!window.requestAnimationFrame||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
  paint(to);if(heroLevel(to)>heroLevel(from))celebrate(heroLevel(to));return;
 }
 const animation={displayed:from,frame:null,wait:null};xpAnimation=animation;
 root.classList.add('is-filling');paint(from);
 const runSegment=index=>{
  if(xpAnimation!==animation)return;
  if(index>=segments.length){paint(to);xpAnimation=null;root.classList.remove('is-filling');return}
  const segment=segments[index];let started;
  const frame=time=>{
   if(xpAnimation!==animation)return;
   if(started===undefined)started=time;
   const elapsed=Math.min(1,(time-started)/1100),eased=1-Math.pow(1-elapsed,3);
   animation.displayed=segment.from+(segment.to-segment.from)*eased;paint(animation.displayed,segment.level);
   if(elapsed<1){animation.frame=window.requestAnimationFrame(frame);return}
   if(segment.levelUp){
    celebrate(segment.level+1);
    animation.wait=setTimeout(()=>{
     if(xpAnimation!==animation)return;
     animation.displayed=segment.to;paint(segment.to);runSegment(index+1);
    },650);
   }else runSegment(index+1);
  };
  animation.frame=window.requestAnimationFrame(frame);
 };
 runSegment(0);
}
function animateFinishedWorkout(){
 const reward=pendingXpReward||{from:state.rpg.xp,to:state.rpg.xp};
 animateXpReward('finish',reward.from,reward.to);
}
function initRpg(){
 if(!state.rpg)state.rpg={xp:0,days:{},ledger:[]};
 settleDays();
}
function settleDays(){
 const today=dateKey();
 for(const [day,entry] of Object.entries(state.rpg.days)){
  if(day>=today||entry.settled)continue;
 const missed=entry.selected.filter(id=>!QUESTS.find(q=>q.id===id)?.permanent&&!entry.claims[id]).length;
  const loss=Math.min(30,missed*10,state.rpg.xp);
  state.rpg.xp-=loss;entry.settled=true;
  if(loss)state.rpg.ledger.push({day,xp:-loss,label:'Quêtes inachevées'});
 }
 if(!state.rpg.days[today])state.rpg.days[today]={selected:['walk','water'],claims:{},bonus:false,settled:false};
 const current=state.rpg.days[today];
 if(!['pushups','squats'].includes(current.miniChallenge))current.miniChallenge=crypto.getRandomValues(new Uint32Array(1))[0]%2===0?'pushups':'squats';
 if(!current.selected.includes('daily-strength'))current.selected.push('daily-strength');
 saveState();
}
function questForId(id){
 const quest=QUESTS.find(q=>q.id===id);
 if(id!=='daily-strength'||!quest)return quest;
 const pushups=state.rpg.days[dateKey()]?.miniChallenge==='pushups';
 return {...quest,name:pushups?'10 pompes':'20 squats',detail:'Mini-défi obligatoire du jour',reps:pushups?10:20,exercise:pushups?'pushups':'squats'};
}
function questMinutes(q,value=q.minutes){
 if(!q.flexible)return q.minutes;
 const minutes=Number(value);
 if(!Number.isFinite(minutes)||minutes<q.minutes||minutes>1440)throw Error(`La durée doit être comprise entre ${q.minutes} et 1 440 minutes.`);
 return Math.round(minutes*10)/10;
}
function questCalories(q,minutes=q.minutes){
 minutes=questMinutes(q,minutes);
 // Personal FitXR reference supplied by the user; squats are already included.
 if(q.id==='shadowboxing'&&(state.shadowBoxingMode??'fitxr')==='fitxr')return Math.round(456*minutes/45);
 return Math.round(q.met*3.5*state.weight/200*minutes);
}
function questCalorieDetails(q,minutes,override){
 minutes=questMinutes(q,minutes);
 if(override!==undefined&&String(override).trim()!==''){
  const calories=Number(override);
  if(!Number.isSafeInteger(calories)||calories<0||calories>10000)throw Error('Les calories déclarées doivent être un entier entre 0 et 10 000 kcal.');
  return {calories,source:q.id==='shadowboxing'&&(state.shadowBoxingMode??'fitxr')==='fitxr'?'fitxr-declared':'declared'};
 }
 return {calories:questCalories(q,minutes),source:q.id==='shadowboxing'&&(state.shadowBoxingMode??'fitxr')==='fitxr'?'fitxr-reference':'met-estimate'};
}
function questBaseXp(q,minutes=q.minutes){return q.flexible?Math.min(120,Math.round(q.xp*questMinutes(q,minutes)/q.minutes)):q.xp}
function questXp(q,calories,minutes=q.minutes){return questBaseXp(q,minutes)+Math.min(100,Math.floor(Math.max(0,calories??questCalories(q,minutes))/5))}
function claimQuest(id,calories,show=true,duration,calorieSource){
 settleDays();const day=state.rpg.days[dateKey()],q=questForId(id);
 if(!q||q.permanent||day.claims[id])return 0;
 const minutes=questMinutes(q,duration??q.minutes);
 const details=q.mandatory?{calories:0,source:'repetitions'}:questCalorieDetails(q,minutes,calories),beforeXp=state.rpg.xp,energy=details.calories;
 const source=calorieSource??details.source;
 let gain=questXp(q,energy,minutes);day.claims[id]={xp:gain,calories:energy,minutes,calorieSource:source,...(q.mandatory?{reps:q.reps,exercise:q.exercise}:{})};
 if(!day.selected.includes(id))day.selected.push(id);
 state.goals[dateKey()]=Object.keys(day.claims);
 let bonus=0;
 if(!day.bonus&&day.selected.filter(id=>!QUESTS.find(q=>q.id===id)?.permanent).every(id=>day.claims[id])){bonus=80;gain+=bonus;day.bonus=true}
 state.rpg.xp=Math.min(xpThreshold(99),state.rpg.xp+gain);
 gain=state.rpg.xp-beforeXp;
 pendingXpReward={from:beforeXp,to:state.rpg.xp};
 state.rpg.ledger.push({day:dateKey(),xp:gain,label:q.name});
 if(show&&(q.minutes||q.mandatory))state.history.push({id:Date.now(),date:dateKey(),title:q.mandatory?q.name:q.flexible?`${q.name}${q.id==='shadowboxing'&&source.startsWith('fitxr')?' VR · FitXR':''} · ${minutes} min`:q.detail,minutes,calories:energy,calorieSource:source,...(q.mandatory?{reps:q.reps}: {})});
 saveState();render();
 if(show){
  navigateTo('today');
  document.querySelector('#questReward').textContent=`+${gain} XP`;
  document.querySelector('#questRewardTitle').textContent=q.name;
  document.querySelector('#questRewardDetail').textContent=`${q.flexible?minutes+' min · ':''}${questBaseXp(q,minutes)} XP de quête + ${questXp(q,energy,minutes)-questBaseXp(q,minutes)} XP d’énergie${bonus?' + 80 XP de journée réussie':''} · ≈ ${energy} kcal`;
  if(q.mandatory)document.querySelector('#questRewardDetail').textContent=`${q.name} · ${q.xp} XP${bonus?' + 80 XP de journée réussie':''}. Les calories ne sont pas estimées sans durée mesurée.`;
  document.querySelector('#questLevelUp').textContent=gain?'Ton expérience rejoint ta barre de progression.':'Niveau maximum atteint.';
  document.querySelector('#questSuccess').showModal();
  animateXpReward('quest',beforeXp,state.rpg.xp);
 }
 return gain;
}
function renderRpg(){
 const displayXp=xpAnimation?.displayed??state.rpg.xp;
 const day=state.rpg.days[dateKey()],level=heroLevel(displayXp),floor=xpThreshold(level),next=xpThreshold(Math.min(99,level+1));
 document.querySelector('#heroLevel').textContent=String(level).padStart(2,'0');
 document.querySelector('#heroRank').textContent=level>=99?'Légende de lumière':level>=50?'Gardien des sommets':level>=20?'Aventurier accompli':'Apprenti des aurores';
 document.querySelector('#xpLabel').textContent=level===99?'Niveau maximum atteint':`${Math.floor(displayXp)-floor} / ${next-floor} XP`;
 document.querySelector('#heroXp').value=level===99?100:(displayXp-floor)/(next-floor)*100;
 document.querySelector('#dayReward').textContent=day.bonus?'✦ Bonus de journée obtenu : +80 XP':'✦ Termine tes quêtes choisies : +80 XP';
 document.querySelector('#goalScore').textContent=`${day.selected.filter(id=>day.claims[id]).length}/${day.selected.length}`;
 const questRow=(q)=>{
  q=questForId(q.id);
  const done=!!day.claims[q.id];
  const sleep=q.id==='bedtime'?day.bedtime:null;
  const reward=done?'ACCOMPLI':q.id==='nutrition'?'À VALIDER':sleep?(sleep.late?'APRÈS MINUIT':'RENSEIGNÉ'):`+${questXp(q)} XP`;
  const detail=q.flexible&&done?`${day.claims[q.id].minutes??q.minutes} min réalisées · ≈ ${day.claims[q.id].calories} kcal`:q.detail;
  return `<button class="daily-challenge ${done?'completed':''}" data-open-quest="${q.id}" aria-label="${q.name}${done?' : terminé':''}"><span class="challenge-checkbox" aria-hidden="true">${done?'✓':''}</span><span class="daily-icon" aria-hidden="true">${q.icon}</span><span class="daily-text"><strong>${q.name}</strong><small>${detail}</small></span><span class="daily-xp">${reward}</span><span class="row-arrow" aria-hidden="true">›</span></button>`;
 };
 document.querySelector('#goalList').innerHTML=QUESTS.filter(q=>q.permanent||day.selected.includes(q.id)).map(questRow).join('');
 document.querySelector('#activityCategories').innerHTML=QUESTS.map(questRow).join('');
 if(activeQuest)renderChallenge();
 document.querySelector('#questChoices').innerHTML=QUESTS.map(q=>questForId(q.id)).map(q=>`<label><input type="checkbox" data-select-quest="${q.id}" ${q.permanent||day.selected.includes(q.id)?'checked':''} ${q.permanent||q.mandatory||day.selected.some(id=>day.claims[id])?'disabled':''}> ${q.mandatory?q.name+' · obligatoire':q.detail}</label>`).join('');
 document.querySelector('#xpLedger').innerHTML=state.rpg.ledger.slice(-10).reverse().map(e=>`<div class="history-item"><span>${e.day} · ${escapeHtml(e.label)}</span><strong>${e.xp>0?'+':''}${e.xp} XP</strong></div>`).join('')||'<p>Ton aventure commence aujourd’hui.</p>';
}
document.querySelector('#questChoices').addEventListener('change',event=>{
 const id=event.target.dataset.selectQuest;if(!id)return;
 if(QUESTS.find(q=>q.id===id)?.permanent||QUESTS.find(q=>q.id===id)?.mandatory)return;
 settleDays();const day=state.rpg.days[dateKey()];if(day.selected.some(id=>day.claims[id]))return;
 const chosen=new Set(day.selected);event.target.checked?chosen.add(id):chosen.delete(id);
 if(!chosen.size){renderRpg();toast('Choisis au moins une quête.');return}
 day.selected=[...chosen];saveState();renderRpg();
});
function returnFromVictory(){stopXpAnimation();document.querySelector('#questSuccess').close();render();navigateTo('today')}
document.querySelector('#closeQuestSuccess').addEventListener('click',returnFromVictory);
document.querySelector('#questSuccess').addEventListener('cancel',event=>{event.preventDefault();returnFromVictory()});
document.querySelector('#finishScreen').addEventListener('cancel',event=>{event.preventDefault();stopXpAnimation();document.querySelector('#finishScreen').close();render();navigateTo('today')});
setInterval(()=>{if(!session&&!cindySession&&!kettlebellSession)render()},60000);

function renderChallenge(){
 const q=questForId(activeQuest);if(!q)return;
 const done=!!state.rpg.days[dateKey()]?.claims[q.id];
 const details={
  'daily-strength':{description:`Ton mini-défi obligatoire d’aujourd’hui : ${q.name}. Le tirage est enregistré pour la journée.`,instructions:q.exercise==='pushups'?['Réalise 10 pompes au total, en une ou plusieurs séries avec des pauses.','Choisis une variante adaptée : pompes sur les genoux ou mains sur un support stable si nécessaire.','Une fois les 10 répétitions terminées, valide le défi pour recevoir 25 XP et cocher la ligne.']:['Réalise 20 squats au total, en une ou plusieurs séries avec des pauses.','Reprends les consignes du squat : buste stable, genoux dans l’axe des pieds et amplitude confortable.','Une fois les 20 répétitions terminées, valide le défi pour recevoir 25 XP et cocher la ligne.']},
  workout:{description:'Entraîne ton corps au dojo. Une séance guidée, mouvement après mouvement, avec ses temps de récupération.',instructions:['Découvre le détail de la séance et les consignes des exercices.','Lance la séance guidée ou choisis le circuit CINDY.','Termine la séance pour recevoir ton XP et cocher ton défi.']},
  kettlebell:{description:'Renforce ta chaîne postérieure et ton centre avec un circuit kettlebell guidé.',instructions:['Choisis le circuit Initiation ou Essentiel selon ton aisance.','Prépare ta kettlebell et découvre les mouvements du circuit.','Enchaîne les tours proprement, puis termine la séance pour valider.']},
  walk:{description:'Pars explorer les alentours à pied. Accorde-toi au moins vingt minutes de marche active.',instructions:['Choisis un parcours qui te convient.','Marche pendant au moins 20 minutes à une allure adaptée à tes capacités.','De retour, valide ton exploration ci-dessous. Tes pas sont consultables dans leur écran dédié.']},
  run:{description:'Une sortie d’au moins quinze minutes pour prendre l’air et faire avancer ton aventure.',instructions:['Prépare ton parcours et démarre progressivement.','Cours pendant au moins 15 minutes à une allure confortable, en alternant avec la marche si besoin.','Une fois ta sortie terminée, reviens la valider ici.']},
  bike:{description:'Traverse la vallée à vélo avec une sortie d’au moins trente minutes.',instructions:['Prépare ton vélo et choisis un itinéraire adapté.','Roule pendant au moins 30 minutes selon tes capacités.','À la fin de ta sortie, valide ton défi pour recevoir ton XP.']},
  shadowboxing:{description:'Une séance de boxe classique ou de boxe en réalité virtuelle avec FitXR, pendant au moins 15 minutes. Le mode FitXR tient compte de ta référence personnelle : 456 kcal sur 45 minutes, avec les squats déjà inclus.',instructions:['Choisis le mode FitXR pour tes séances VR ou le mode classique pour de la boxe dans le vide.','Suis ta séance et renseigne sa durée réelle, échauffement et récupération inclus.','Si FitXR affiche un total calorique, saisis-le : il remplace l’estimation pour cette séance. Les squats de la séance ne sont pas ajoutés une seconde fois.','Sans valeur déclarée, le mode FitXR utilise 456 kcal pour 45 minutes, ajustées à la durée. Cette référence personnelle et les chiffres de FitXR restent des estimations ; la durée seule ne reflète pas toutes les variations d’intensité.']},
  bedtime:{description:'Prépare une nuit reposante avec des heures de coucher et de réveil régulières. Ce défi reste disponible chaque jour.',instructions:['L’OMS conseille des horaires réguliers, sans fixer une heure universelle de coucher pour les adultes.','Repère adulte complémentaire : les NIH indiquent généralement 7 à 9 heures de sommeil. Le conseil ci-dessous réserve une durée choisie avant ton réveil ; ce n’est pas une mesure du sommeil réel.','Renseigne ton coucher réel pour le soir concerné, y compris le lendemain matin. Une seule déclaration est possible par nuit.','Le jeu accorde 40 XP si tu respectes l’heure conseillée, sans calories. Un coucher plus tardif mais au plus tard à minuit ne retire aucun XP. Seul un coucher déclaré après minuit retire 10 XP. Sans déclaration : aucune pénalité.']},
  nutrition:{description:'Valide simplement ce défi si tu considères avoir mangé sans excès aujourd’hui.',instructions:['Si ta journée est sans excès, utilise le bouton de validation : la ligne sera cochée sur l’accueil.','Si tu as fait des excès, laisse le défi non validé. Tu peux aussi retirer une validation si ta journée change.','Ce défi ne demande aucun comptage de calories et ne retire aucun XP.']},
  water:{description:'Prends soin de ton hydratation tout au long de la journée, selon tes besoins et ton objectif personnel.',instructions:['Définis une cible d’hydratation adaptée à tes besoins.','Répartis tes boissons au fil de la journée.','Valide seulement lorsque ton objectif personnel est atteint.']}
 }[q.id];
 document.querySelector('#challengeIcon').textContent=q.icon;
 document.querySelector('#challengeTitle').textContent=q.name;
 document.querySelector('#challengeDescription').textContent=details.description;
 document.querySelector('#challengeStatus').textContent=done?'DÉFI ACCOMPLI':q.mandatory?'DÉFI OBLIGATOIRE DU JOUR':'TA PROCHAINE MISSION';
 document.querySelector('#challengeMetrics').hidden=q.id==='nutrition';
 document.querySelector('#challengeTarget').textContent=q.mandatory?`${q.reps} répétitions`:q.id==='nutrition'?'Déclaration du jour':q.id==='bedtime'?sleepTarget().label:q.id==='water'?'Cible personnelle':q.id==='workout'?`${state.duration} min`:`${q.minutes} min`;
 const calories=q.id==='workout'?estimatedCalories():questCalories(q);
 document.querySelector('#challengeXp').textContent=q.id==='nutrition'?'Validation simple':`+${questXp(q,calories)} XP`;
 document.querySelector('#challengeCalories').textContent=q.id==='nutrition'?'—':q.mandatory?'Non estimées':`≈ ${calories} kcal`;
 document.querySelector('#challengeInstructions').innerHTML=details.instructions.map(text=>`<li>${text}</li>`).join('');
 document.querySelector('#workoutChallenge').hidden=q.id!=='workout'||done;
 document.querySelector('#kettlebellChallenge').hidden=q.id!=='kettlebell'||done;
 const guided=['workout','kettlebell'].includes(q.id);
 document.querySelector('#outdoorChallenge').hidden=guided||done||!!q.permanent;
 document.querySelector('#bedtimeChallenge').hidden=q.id!=='bedtime';
 document.querySelector('#nutritionChallenge').hidden=q.id!=='nutrition';
 if(q.id==='bedtime')renderBedtime();
 if(q.id==='nutrition')renderNutrition();
 document.querySelector('#challengeActionDescription').textContent=q.mandatory?`Effectue ${q.name.toLowerCase()}, puis confirme ici. Ce défi compte pour le bonus de journée et ne peut pas être retiré de ta liste.`:q.id==='water'?'Atteins ton objectif d’hydratation sur la journée, puis confirme ici.':`Réalise cette activité pendant ${q.minutes} minutes, puis confirme sa réalisation.`;
 document.querySelector('#completeChallenge').hidden=guided||done||!!q.permanent;
 document.querySelector('#completeChallenge').disabled=done;
 document.querySelector('#challengeDurationSection').hidden=!q.flexible;
 document.querySelector('#shadowBoxingOptions').hidden=q.id!=='shadowboxing';
 if(q.id==='shadowboxing'){
  const record=state.rpg.days[dateKey()].claims[q.id];
  document.querySelector('#shadowMode').value=record?.calorieSource?.startsWith('fitxr')?'fitxr':record?'classic':state.shadowBoxingMode??'fitxr';
  document.querySelector('#shadowMode').disabled=done;
  document.querySelector('#shadowCalories').disabled=done;
  document.querySelector('#shadowCalories').value=done?(record.calorieSource?.includes('declared')?record.calories:''):(questCalorieDrafts[`${dateKey()}:${q.id}`]??'');
 }
 if(q.flexible){
  const input=document.querySelector('#challengeDuration');
  input.min=q.minutes;input.disabled=done;
  input.value=done?(state.rpg.days[dateKey()].claims[q.id].minutes??q.minutes):(questDurationDrafts[`${dateKey()}:${q.id}`]??q.minutes);
  document.querySelector('#challengeDurationMinimum').textContent=`Minimum : ${q.minutes} min. Saisis la durée réellement effectuée (jusqu’à 1 440 min).`;
  updateChallengeDuration();
 }
 document.querySelector('#challengeCompleteMessage').textContent=done?(q.id==='nutrition'?'✓ Journée déclarée sans excès. Ce défi est coché sur ton accueil.':'✓ Récompense obtenue. Ce défi est coché sur ton accueil.'):'';
}

function updateChallengeDuration(){
 const q=QUESTS.find(q=>q.id===activeQuest);if(!q?.flexible)return;
 const value=document.querySelector('#challengeDuration').value;
 const done=!!state.rpg.days[dateKey()]?.claims[q.id];
 if(!done)questDurationDrafts[`${dateKey()}:${q.id}`]=value;
 try{
  const minutes=questMinutes(q,value),record=state.rpg.days[dateKey()]?.claims[q.id];
  const energy=q.id==='shadowboxing'?questCalorieDetails(q,minutes,document.querySelector('#shadowCalories').value):questCalorieDetails(q,minutes);
  const calories=record?.calories??energy.calories;
  if(q.id==='shadowboxing'){
   const source=record?.calorieSource??energy.source;
   document.querySelector('#shadowCaloriesSource').textContent=source==='fitxr-declared'?'Valeur déclarée depuis FitXR (estimation de l’application VR).':source==='declared'?'Valeur calorique déclarée pour cette séance.':source==='fitxr-reference'?'Estimation personnelle FitXR : 456 kcal / 45 min, squats inclus.':'Estimation générique de boxe classique, selon ton poids et ta durée.';
  }
  document.querySelector('#challengeTarget').textContent=`${minutes} min`;
  document.querySelector('#challengeCalories').textContent=`≈ ${calories} kcal`;
  document.querySelector('#challengeXp').textContent=`+${record?.xp??questXp(q,calories,minutes)} XP`;
  document.querySelector('#challengeActionDescription').textContent=`Réalise cette activité pendant au moins ${q.minutes} minutes. Durée déclarée : ${minutes} min. Valide une fois l’activité terminée.`;
  document.querySelector('#challengeDurationError').textContent='';
  document.querySelector('#completeChallenge').disabled=done;
 }catch(error){
  document.querySelector('#challengeDurationError').textContent=error.message;
  document.querySelector('#challengeTarget').textContent='Durée à corriger';
  document.querySelector('#challengeCalories').textContent='—';document.querySelector('#challengeXp').textContent='—';
  document.querySelector('#completeChallenge').disabled=true;
 }
}
document.querySelector('#challengeDuration').addEventListener('input',updateChallengeDuration);
document.querySelector('#shadowMode').addEventListener('change',()=>{
 if(activeQuest!=='shadowboxing'||state.rpg.days[dateKey()]?.claims.shadowboxing)return;
 const mode=document.querySelector('#shadowMode').value;
 if(!['classic','fitxr'].includes(mode))return;
 state.shadowBoxingMode=mode;saveState();updateChallengeDuration();
});
document.querySelector('#shadowCalories').addEventListener('input',()=>{
 if(activeQuest!=='shadowboxing'||state.rpg.days[dateKey()]?.claims.shadowboxing)return;
 questCalorieDrafts[`${dateKey()}:shadowboxing`]=document.querySelector('#shadowCalories').value;
 updateChallengeDuration();
});

function sleepTarget(){
 const settings=state.sleepSettings||{wake:'07:00',hours:8};
 const [hour,minute]=settings.wake.split(':').map(Number);
 const minutes=((hour*60+minute-settings.hours*60)%1440+1440)%1440;
 return {minutes,label:`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`,wake:settings.wake,hours:settings.hours};
}
function sleepDates(now=new Date()){
 const previous=new Date(now);previous.setDate(previous.getDate()-1);
 return {today:dateKey(now),yesterday:dateKey(previous)};
}
function saveSleepSettings(wake,hours){
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(wake)||![7,8,9].includes(Number(hours)))throw Error('Indique une heure de réveil et une durée de 7, 8 ou 9 heures.');
 state.sleepSettings={wake,hours:Number(hours)};saveState();renderChallenge();
}
function evaluateBedtime(night,actual,now=new Date()){
 const {today,yesterday}=sleepDates(now);
 if(![today,yesterday].includes(night))throw Error('Choisis le soir d’aujourd’hui ou d’hier.');
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(actual))throw Error('Renseigne la date et l’heure réelles du coucher.');
 const at=new Date(actual),start=new Date(`${night}T12:00`),end=new Date(start);
 end.setDate(end.getDate()+1);
 if(!Number.isFinite(at.getTime())||at>now||at<start||at>=end)throw Error('Le coucher doit être passé et correspondre au soir choisi ou au lendemain matin (avant midi).');
 const midnight=new Date(`${night}T00:00`);midnight.setDate(midnight.getDate()+1);
 const target=sleepTarget(),deadline=new Date(`${night}T${target.label}`);
 if(target.minutes<720)deadline.setDate(deadline.getDate()+1);
 return {late:at>midnight,success:at<=midnight&&at<=deadline,target:target.label};
}
function recordBedtime(night,actual,now=new Date()){
 const result=evaluateBedtime(night,actual,now);settleDays();
 const day=state.rpg.days[night]||(state.rpg.days[night]={selected:[],claims:{},bonus:false,settled:true});
 if(day.bedtime)throw Error('Ce coucher a déjà été enregistré pour cette nuit.');
 const before=state.rpg.xp;
 const change=result.late?-Math.min(10,before):result.success?Math.min(40,xpThreshold(99)-before):0;
 day.bedtime={actual,...result,xp:change};
 if(result.success)day.claims.bedtime={xp:change,calories:0};
 state.rpg.xp+=change;
 state.rpg.ledger.push({day:night,xp:change,label:result.late?'Coucher après minuit':result.success?'Se coucher tôt':'Coucher avant minuit · sans pénalité'});
 saveState();render();navigateTo('today');
 if(change>0)showActivityReward('Se coucher tôt',change,`Coucher du ${night} enregistré · heure conseillée respectée · aucune calorie ajoutée.`,before);
 else toast(result.late?`Coucher après minuit : ${change} XP.`:'Coucher enregistré : aucune perte d’XP.');
 return change;
}
function renderBedtime(){
 const target=sleepTarget(),dates=sleepDates();
 document.querySelector('#sleepAdvice').textContent=`Pour un réveil à ${target.wake} et ${target.hours} h réservées au sommeil : coucher conseillé vers ${target.label}. Adapte ce repère à tes besoins ; le temps au lit n’est pas la durée réellement dormie.`;
 const night=document.querySelector('#sleepNight');night.min=dates.yesterday;night.max=dates.today;
 if(![dates.today,dates.yesterday].includes(night.value))night.value=new Date().getHours()<12?dates.yesterday:dates.today;
 const wake=document.querySelector('#sleepWake'),hours=document.querySelector('#sleepHours');
 if(!wake.value)wake.value=target.wake;if(!hours.value)hours.value=target.hours;
 const record=state.rpg.days[night.value]?.bedtime;
 document.querySelector('#saveBedtime').disabled=!!record;
 document.querySelector('#bedtimeResult').textContent=record?`Coucher déclaré : ${record.actual.replace('T',' à ')} · ${record.xp>0?'+':''}${record.xp} XP. Une seule déclaration par nuit.`:'Aucun coucher déclaré pour cette nuit. Sans saisie, aucun XP ne sera retiré.';
}
document.querySelector('#sleepSettingsForm').addEventListener('submit',event=>{
 event.preventDefault();try{saveSleepSettings(document.querySelector('#sleepWake').value,document.querySelector('#sleepHours').value);document.querySelector('#bedtimeError').textContent=''}catch(error){document.querySelector('#bedtimeError').textContent=error.message}
});
document.querySelector('#bedtimeForm').addEventListener('submit',event=>{
 event.preventDefault();try{recordBedtime(document.querySelector('#sleepNight').value,document.querySelector('#sleepActual').value);document.querySelector('#bedtimeError').textContent=''}catch(error){document.querySelector('#bedtimeError').textContent=error.message}
});
document.querySelector('#sleepNight').addEventListener('change',renderBedtime);

function activityEnergyToday(){
 return state.history.filter(h=>h.date===dateKey()).reduce((total,h)=>{
  const calories=h.calories??estimatedCalories(PROGRAM.find(p=>p.title===h.title)||PROGRAM[0],h.minutes);
  return total+(Number.isFinite(calories)?Math.max(0,calories):0);
 },0);
}
function setNutritionCompleted(completed){
 if(typeof completed!=='boolean')throw Error('Indique si le défi est validé.');
 settleDays();const day=state.rpg.days[dateKey()];
 day.nutrition={completed,updatedAt:new Date().toISOString()};
 if(completed)day.claims.nutrition={xp:0,calories:0};else delete day.claims.nutrition;
 saveState();render();navigateTo('today');
 toast(completed?'Bien manger : défi validé.':'Bien manger : la case reste vide.');
}
function renderNutrition(){
 const completed=!!state.rpg.days[dateKey()]?.claims.nutrition;
 document.querySelector('#validateNutrition').disabled=completed;
 document.querySelector('#validateNutrition').textContent=completed?'✓ Défi déjà validé':'J’ai mangé sans excès : valider';
 document.querySelector('#clearNutrition').textContent=completed?'Retirer ma validation':'J’ai fait des excès : laisser la case vide';
 document.querySelector('#nutritionResult').textContent=completed?'Ce défi est coché sur ton accueil.':'Ce défi est actuellement non validé.';
}
document.querySelector('#validateNutrition').addEventListener('click',()=>setNutritionCompleted(true));
document.querySelector('#clearNutrition').addEventListener('click',()=>setNutritionCompleted(false));
