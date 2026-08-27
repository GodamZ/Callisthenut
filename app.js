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

const PROGRAM = [
  {title:'Fondations',focus:'CORPS ENTIER',met:6.5,ids:['jumping_jacks','squats','pushups','lunges','plank','climbers','bridges','deadbug','pike','bear','sideplank','burpees']},
  {title:'Jambes d’acier',focus:'BAS DU CORPS',met:6.2,ids:['jumping_jacks','squats','lunges','bridges','calf','climbers','squats','lunges','deadbug','bridges','highknees','plank']},
  {title:'Posture & centre',focus:'MOBILITÉ ACTIVE',met:4.5,ids:['jumping_jacks','deadbug','plank','superman','sideplank','bridges','bear','deadbug','pike','superman','sideplank','climbers']},
  {title:'Haut du corps',focus:'POUSSÉE & DOS',met:5.8,ids:['jumping_jacks','pushups','pike','superman','dips','bear','pushups','plank','pike','superman','dips','sideplank']},
  {title:'Commando cardio',focus:'CARDIO',met:8,ids:['jumping_jacks','highknees','climbers','squats','burpees','lunges','highknees','bear','climbers','jumping_jacks','burpees','plank']},
  {title:'Force totale',focus:'CORPS ENTIER',met:7,ids:['jumping_jacks','squats','pushups','lunges','pike','bridges','bear','dips','sideplank','superman','climbers','burpees']},
  {title:'Récupération active',focus:'CONTRÔLE',met:4,ids:['jumping_jacks','squats','deadbug','bridges','superman','lunges','sideplank','calf','bear','plank','deadbug','superman']}
];
const DAY_NAMES=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const state=loadState();
let session=null,timerId=null,reminderId=null,audioContext=null;

function loadState(){
  const base={name:'soldat',duration:15,level:1,weight:70,reminder:'18:30',sound:true,goals:{},history:[]};
  try{return {...base,...JSON.parse(localStorage.getItem('callisthenut-state')||localStorage.getItem('callisterik-state')||'{}')}}catch{return base}
}
function saveState(){localStorage.setItem('callisthenut-state',JSON.stringify(state))}
function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function todayProgram(){return PROGRAM[(new Date().getDay()+6)%7]}
function estimatedCalories(program=todayProgram(),minutes=state.duration){return Math.round(program.met*3.5*state.weight/200*minutes)}
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
  const now=new Date(),program=todayProgram(),doneGoals=state.goals[dateKey()]||[];
  document.querySelector('#todayDate').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
  document.querySelector('#userName').textContent=state.name||'soldat';
  document.querySelector('#workoutTitle').textContent=program.title;
  document.querySelector('#workoutFocus').textContent=program.focus;
  document.querySelector('#workoutLevel').textContent=`NIVEAU ${state.level}`;
  document.querySelector('#workoutMeta').textContent=`${state.duration} min · 12 exercices · ≈ ${estimatedCalories(program)} kcal`;
  document.querySelector('#heroVisual').innerHTML=svg(program.ids[1]);
  const streak=getStreak();document.querySelector('#streakCount').textContent=streak;document.querySelector('#progressStreak').textContent=streak;
  document.querySelector('#menuName').textContent=state.name==='soldat'?'Soldat':state.name;
  document.querySelector('#menuLevel').textContent=['','Débutant','Intermédiaire','Avancé'][state.level];
  document.querySelector('#menuDuration').textContent=state.duration;
  document.querySelector('#menuReminder').textContent=`Tous les jours à ${state.reminder}`;
  const goals=[['workout','◎','Terminer la mission',`${state.duration} minutes de callisthénie`],['water','◇','Boire suffisamment','Objectif personnel : 6 à 8 verres'],['walk','↗','Bouger en plus','10 minutes de marche active']];
  document.querySelector('#goalList').innerHTML=goals.map(g=>`<button class="goal-item ${doneGoals.includes(g[0])?'done':''}" data-goal="${g[0]}"><span class="goal-check"></span><span class="goal-icon">${g[1]}</span><span class="goal-text"><strong>${g[2]}</strong><small>${g[3]}</small></span></button>`).join('');
  document.querySelector('#goalScore').textContent=`${doneGoals.length}/3`;
  renderPlan();renderProgress();fillSettings();
}
function renderPlan(){
  const monday=new Date();monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
  document.querySelector('#weekStrip').innerHTML=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);const done=state.history.some(h=>h.date===dateKey(d));return `<div class="week-day ${dateKey(d)===dateKey()?'today':''} ${done?'done':''}"><small>${DAY_NAMES[d.getDay()]}</small><strong>${d.getDate()}</strong></div>`}).join('');
  const todayIndex=(new Date().getDay()+6)%7;
  document.querySelector('#planList').innerHTML=PROGRAM.map((p,i)=>`<article class="plan-card ${i===todayIndex?'today':''}"><span class="plan-number">${String(i+1).padStart(2,'0')}</span><span class="plan-info"><strong>${p.title}</strong><small>${p.focus} · ${state.duration} min</small></span><span class="plan-status">${i<todayIndex?'✓':i===todayIndex?'→':'·'}</span></article>`).join('');
}
function renderProgress(){
  document.querySelector('#totalSessions').textContent=state.history.length;
  document.querySelector('#totalMinutes').textContent=state.history.reduce((n,h)=>n+h.minutes,0);
  document.querySelector('#totalCalories').textContent=state.history.reduce((n,h)=>n+(h.calories||estimatedCalories(PROGRAM.find(p=>p.title===h.title)||PROGRAM[0],h.minutes)),0);
  const days=Array.from({length:28},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(27-i));return d});
  document.querySelector('#activityGrid').innerHTML=days.map(d=>`<span class="activity-cell ${state.history.some(h=>h.date===dateKey(d))?'active':''} ${dateKey(d)===dateKey()?'today':''}" title="${d.toLocaleDateString('fr-FR')}"></span>`).join('');
  document.querySelector('#historyList').innerHTML=state.history.length?state.history.slice().reverse().slice(0,6).map(h=>`<div class="history-item"><div><strong>${h.title}</strong><small>${new Date(h.date+'T12:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</small></div><span>${h.minutes} min · ≈ ${h.calories||estimatedCalories(PROGRAM.find(p=>p.title===h.title)||PROGRAM[0],h.minutes)} kcal</span></div>`).join(''):'<div class="empty-state">Ta première mission apparaîtra ici.</div>';
}
function getStreak(){let n=0,d=new Date();if(!state.history.some(h=>h.date===dateKey(d)))d.setDate(d.getDate()-1);while(state.history.some(h=>h.date===dateKey(d))){n++;d.setDate(d.getDate()-1)}return n}
function fillSettings(){nameInput.value=state.name==='soldat'?'':state.name;durationSelect.value=state.duration;levelSelect.value=state.level;weightInput.value=state.weight;reminderTime.value=state.reminder}
function buildTimeline(){
  const p=todayProgram(),work=state.duration===20?60:45,rest=state.duration===20?20:15;
  return [{type:'prep',seconds:10,exercise:EXERCISES[p.ids[0]],index:-1},...p.ids.flatMap((id,i)=>[{type:'work',seconds:work,exercise:EXERCISES[id],index:i},...(i<p.ids.length-1?[{type:'rest',seconds:rest,exercise:EXERCISES[p.ids[i+1]],index:i}]:[])])];
}
function prepareAudio(){if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume()}
function beep(){
  if(!state.sound||!audioContext)return;
  const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;
  oscillator.type='sine';oscillator.frequency.setValueAtTime(880,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.22,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.16);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+.18);
}
function updateSoundButton(){const button=document.querySelector('#soundToggle');button.textContent=state.sound?'♪':'♩';button.classList.toggle('sound-off',!state.sound);button.setAttribute('aria-label',state.sound?'Couper les signaux sonores':'Activer les signaux sonores')}
function startWorkout(){prepareAudio();session={timeline:buildTimeline(),position:0,remaining:0,running:true,elapsed:0};loadPhase();workoutPlayer.showModal();timerId=setInterval(tick,1000)}
function loadPhase(){const phase=session.timeline[session.position];session.remaining=phase.seconds;updatePlayer()}
function tick(){if(!session?.running)return;const phase=session.timeline[session.position];if(session.remaining>1){session.remaining--;if(session.remaining<=3)beep();if(phase.type!=='prep')session.elapsed++;updatePlayer()}else{if(phase.type!=='prep')session.elapsed++;advance(1)}}
function advance(delta){const next=session.position+delta;if(next<0)return;if(next>=session.timeline.length){finishWorkout();return}session.position=next;loadPhase()}
function updatePlayer(){
  const p=session.timeline[session.position],isRest=p.type==='rest',isPrep=p.type==='prep';
  playerPhase.textContent=isPrep?'DÉPART IMMINENT':isRest?'RÉCUPÉRATION':'AU TRAVAIL';playerStep.textContent=isPrep?'LA SÉANCE VA COMMENCER':isRest?'PROCHAIN EXERCICE':`EXERCICE ${p.index+1} SUR 12`;
  exerciseCategory.textContent=isPrep?'PRÉPARE-TOI':isRest?'RESPIRE & PRÉPARE-TOI':p.exercise.cat;exerciseName.textContent=isPrep?`Premier : ${p.exercise.name}`:isRest?`Ensuite : ${p.exercise.name}`:p.exercise.name;
  exerciseFigure.innerHTML=svg(p.exercise.pose);exerciseTip.textContent=isRest?'Marche sur place, relâche les épaules et reprends ton souffle.':p.exercise.tip;
  movementSteps.innerHTML=((isRest||isPrep)?['Marche doucement sur place.','Inspire par le nez et expire lentement.','Observe le prochain mouvement et prépare ta position.']:INSTRUCTIONS[p.exercise.pose]).map(step=>`<li>${step}</li>`).join('');
  timerDisplay.textContent=`${String(Math.floor(session.remaining/60)).padStart(2,'0')}:${String(session.remaining%60).padStart(2,'0')}`;
  timerRing.style.setProperty('--progress',`${Math.max(0,session.remaining/p.seconds)*360}deg`);
  timerCaption.textContent=isPrep?'AVANT LE DÉPART':isRest?'RÉCUPÉRATION':'TEMPS RESTANT';
  liveCalories.textContent=Math.round(todayProgram().met*3.5*state.weight/200*(session.elapsed/60));
  playerProgress.style.width=`${((session.position+(1-session.remaining/p.seconds))/session.timeline.length)*100}%`;
  pauseLabel.textContent=session.running?'Pause':'Reprendre';pauseTimer.querySelector('.pause-symbol').textContent=session.running?'Ⅱ':'▶';pauseTimer.classList.toggle('paused',!session.running);
  document.title=`${session.remaining}s · ${p.exercise.name} — Callisthenut`;
}
function finishWorkout(){
  clearInterval(timerId);const p=todayProgram(),calories=estimatedCalories(p);if(!state.history.some(h=>h.date===dateKey()))state.history.push({date:dateKey(),title:p.title,minutes:Number(state.duration),calories});
  const goals=new Set(state.goals[dateKey()]||[]);goals.add('workout');state.goals[dateKey()]=[...goals];saveState();session=null;workoutPlayer.close();document.title='Callisthenut';render();
  finishMinutes.textContent=state.duration;finishCalories.textContent=calories;finishExercises.textContent=p.ids.length;finishScreen.showModal();
}
function closeWorkout(){clearInterval(timerId);session=null;workoutPlayer.close();document.title='Callisthenut'}
function scheduleReminder(){
  clearTimeout(reminderId);if(Notification.permission!=='granted')return;
  const [h,m]=state.reminder.split(':').map(Number),now=new Date(),next=new Date();next.setHours(h,m,0,0);if(next<=now)next.setDate(next.getDate()+1);
  reminderId=setTimeout(()=>{new Notification('Callisthenut',{body:'Ta mission du jour t’attend. 15 minutes, pas d’excuse.',icon:'icon.svg'});scheduleReminder()},next-now);
}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}

function navigateTo(target){document.querySelectorAll('.nav-item,.view').forEach(x=>x.classList.remove('active'));document.querySelector(`.nav-item[data-target="${target}"]`).classList.add('active');document.querySelector(`[data-view="${target}"]`).classList.add('active');scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigateTo(b.dataset.target)));
document.querySelector('#goalList').addEventListener('click',e=>{const item=e.target.closest('[data-goal]');if(!item)return;const goals=new Set(state.goals[dateKey()]||[]);goals.has(item.dataset.goal)?goals.delete(item.dataset.goal):goals.add(item.dataset.goal);state.goals[dateKey()]=[...goals];saveState();render()});
document.querySelector('#startWorkout').addEventListener('click',startWorkout);
document.querySelector('#closePlayer').addEventListener('click',closeWorkout);
document.querySelector('#nextExercise').addEventListener('click',()=>advance(1));
document.querySelector('#previousExercise').addEventListener('click',()=>advance(-1));
document.querySelector('#pauseTimer').addEventListener('click',()=>{session.running=!session.running;updatePlayer()});
document.querySelector('#soundToggle').addEventListener('click',()=>{prepareAudio();state.sound=!state.sound;saveState();updateSoundButton();if(state.sound){beep();toast('Signaux sonores activés')}else toast('Signaux sonores coupés')});
document.querySelector('#settingsButton').addEventListener('click',()=>document.querySelector('#settingsPanel').showModal());
document.querySelector('#openPreferences').addEventListener('click',()=>document.querySelector('#settingsPanel').showModal());
document.querySelector('#openReminder').addEventListener('click',()=>document.querySelector('#settingsPanel').showModal());
document.querySelector('#closeFinish').addEventListener('click',()=>{document.querySelector('#finishScreen').close();navigateTo('today')});
document.querySelector('#enableNotifications').addEventListener('click',async()=>{if(!('Notification'in window)){notificationStatus.textContent='Non disponible dans ce navigateur';return}const result=await Notification.requestPermission();notificationStatus.textContent=result==='granted'?'Rappel actif lorsque l’app est ouverte':'Notifications refusées';if(result==='granted')scheduleReminder()});
document.querySelector('#saveSettings').addEventListener('click',()=>{state.name=nameInput.value.trim()||'soldat';state.duration=Number(durationSelect.value);state.level=Number(levelSelect.value);state.weight=Math.min(250,Math.max(35,Number(weightInput.value)||70));state.reminder=reminderTime.value;saveState();scheduleReminder();render();toast('Réglages enregistrés')});
window.addEventListener('keydown',e=>{if(e.code==='Space'&&session){e.preventDefault();session.running=!session.running;updatePlayer()}});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
render();updateSoundButton();scheduleReminder();
