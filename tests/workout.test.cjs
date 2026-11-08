const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const elements=new Map();
function element(id){
 if(!elements.has(id)){
  const classes=new Set(),listeners={};
  elements.set(id,{textContent:'',innerHTML:'',value:'',style:{setProperty(){}},
   classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle:c=>classes.has(c)?classes.delete(c):classes.add(c),contains:c=>classes.has(c)},
   listeners,addEventListener(type,handler){listeners[type]=handler},setAttribute(){},querySelector:element,focus(){},
   showModal(){this.open=true},close(){this.open=false}});
 }
 return elements.get(id);
}
const storage=new Map();
const context=vm.createContext({console,crypto:require('node:crypto').webcrypto,Date,Math,Set,Map,Uint32Array,
  localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
  document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){}},
  window:{addEventListener(){}},navigator:{},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},scrollTo(){}});
for(const match of fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g))context[match[1]]=element('#'+match[1]);
for(const file of ['exercise-catalog.js','workout-planner.js','app.js','health.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const run=code=>vm.runInContext(code,context);
test('all catalogue records have unique IDs, guidance and available pictures',()=>{
 const catalog=run('CATALOG');assert.equal(new Set(catalog.map(e=>e.id)).size,catalog.length);
 for(const e of catalog){assert.equal(e.steps.length,3,e.id);assert.ok(e.themes.length);if(e.image)assert.ok(fs.existsSync(e.image),e.image);if(e.pair)assert.equal(catalog.filter(x=>x.pair===e.pair).length,2,e.id)}
 console.log(`${catalog.length} exercises, ${catalog.filter(e=>e.image).length} illustrated from supplied screenshots`);
});
test('two distinct themes, no overlap on consecutive civil days, both durations exact, balanced sides',()=>{
 for(const seed of [1,42,987654321]){
 let previous=[];
 for(let day=0;day<800;day++){
  context.testDate=new Date(2025,0,1+day);context.testSeed=seed;
  for(const duration of [15,20]){
   context.testDuration=duration;
   const p=run('programForDate(testDate,testDuration,testSeed)');context.testProgram=p;
   assert.equal(new Set(p.themes).size,2);assert.ok(p.themes.every(t=>!previous.includes(t)));
   const timeline=run('timelineForProgram(testProgram,EXERCISES)');
   assert.equal(timeline.reduce((s,t)=>s+t.seconds,0),duration*60);
   assert.equal(timeline.filter(t=>t.transition).length,5);
   assert.equal(p.ids.length,duration===15?16:22);
   for(const phase of timeline){assert.ok(phase.exercise);assert.equal(phase.seconds,phase.type==='work'?40:phase.transition?30:10)}
   for(const block of p.blocks){
    for(const id of block.ids){const e=run(`EXERCISES[${JSON.stringify(id)}]`);if(e.pair){assert.equal(block.ids.filter(x=>x===e.pair+'_r').length,block.ids.filter(x=>x===e.pair+'_l').length)}}
   }
   assert.equal(JSON.stringify(p),JSON.stringify(run('programForDate(testDate,testDuration,testSeed)')));
  }
  previous=run('programForDate(testDate,15,testSeed).themes');
 }
 }
});
test('daily seed survives reload; saved profile and history stay intact',()=>{
 const seed=run('state.planSeed');assert.equal(JSON.parse(storage.get('callisthenut-state')).planSeed,seed);
 run('state.duration=20;state.name="Test";saveState()');assert.equal(run('loadState().name'),'Test');assert.equal(run('loadState().duration'),20);
});
test('player runs prep, work, breathing, theme transition and completion with correct elapsed time',()=>{
 run('prepareAudio=()=>{}');
 for(const minutes of [15,20]){
  run(`state.duration=${minutes};startWorkout()`);
  assert.equal(run('session.remaining'),10);
  run('session.running=false;tick()');assert.equal(run('session.remaining'),10);
  run('session.running=true;for(let i=0;i<10;i++)tick()');assert.equal(run('session.remaining'),40);
  assert.equal(element('#playerStep').textContent,`EXERCICE 1 SUR ${minutes===15?16:22}`);
  run(`for(let i=10;i<${minutes*60};i++)tick()`);
  assert.equal(run('session'),null);assert.equal(run('state.history.at(-1).minutes'),minutes);
  assert.equal(element('#finishExercises').textContent,minutes===15?16:22);
 }
});
test('preparation and both recovery types explain the upcoming movement',()=>{
 run('startWorkout()');
 for(const position of [0, ...run('session.timeline.map((p,i)=>p.type==="rest"?i:-1).filter(i=>i>=0)')]){
  run(`session.position=${position};loadPhase()`);
  const exercise=run('session.timeline[session.position].exercise');
  for(const step of exercise.steps||run('INSTRUCTIONS[session.timeline[session.position].exercise.pose]'))assert.ok(element('#movementSteps').innerHTML.includes(step));
  assert.ok(element('#exerciseTip').textContent.startsWith(exercise.tip));
  if(position>0){
   assert.equal(element('#playerPhase').textContent,'RÉCUPÉRATION');
   assert.equal(run('session.timeline[session.position+1].exercise.id'),exercise.id);
  }
 }
 run('closeWorkout()');
});

test('navigation and cancellation do not record an unperformed full session',()=>{
 const before=run('state.history.length');run('startWorkout();advance(1);advance(-1);closeWorkout()');assert.equal(run('state.history.length'),before);
});
test('optional AMRAP timers include preparation within their advertised duration',()=>{
 for(const variant of ['classic','beginner']){
  run(`startCindy('${variant}')`);assert.equal(run('cindySession.remaining+cindySession.prep'),run('cindySession.config.minutes*60'));run('closeCindyWorkout()');
  run(`startKettlebell('${variant}')`);assert.equal(run('kettlebellSession.remaining+kettlebellSession.prep'),run('kettlebellSession.config.minutes*60'));run('closeKettlebellWorkout()');
 }
});
test('precache includes every HTML script/style URL and every referenced image',()=>{
 const sw=vm.createContext({self:{addEventListener(){}}});vm.runInContext(fs.readFileSync('sw.js','utf8'),sw);
 const assets=vm.runInContext('ASSETS',sw);
 for(const match of fs.readFileSync('index.html','utf8').matchAll(/(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^" ]+)?)"/g))assert.ok(assets.includes(match[1]),match[1]);
 for(const e of run('CATALOG'))if(e.image)assert.ok(assets.includes(e.image),e.image);
});

 test('screen wake lock follows sessions, visibility and handles refusal',async()=>{
  let requests=0,releases=0;
  context.navigator.wakeLock={request:async type=>{
   assert.equal(type,'screen');requests++;
   return {addEventListener(){},release:async()=>{releases++}};
  }};
  for(const [start,close] of [['startWorkout()','closeWorkout()'],['startCindy("classic")','closeCindyWorkout()'],['startKettlebell("classic")','closeKettlebellWorkout()']]){
   run(start);await run('Promise.resolve()');
   assert.equal(run('screenWakeLock!==null'),true);
   context.document.hidden=true;await run('syncScreenWakeLock()');
   assert.equal(run('screenWakeLock'),null);
   context.document.hidden=false;await run('syncScreenWakeLock()');
   assert.equal(run('screenWakeLock!==null'),true);
   run(close);await run('Promise.resolve()');
   assert.equal(run('screenWakeLock'),null);
  }
  assert.equal(requests,6);assert.equal(releases,6);
  context.navigator.wakeLock.request=async()=>{throw new Error('Denied')};
  run('startWorkout()');await run('Promise.resolve()');
  assert.equal(run('screenWakeLock'),null);
  assert.equal(run('session.running'),true);
  run('closeWorkout()');delete context.navigator.wakeLock;
 });

test('RPG levels start at one, thresholds are exact and level 99 is the cap',()=>{
 assert.equal(run('heroLevel(0)'),1);
 assert.equal(run('heroLevel(xpThreshold(20)-1)'),19);
 assert.equal(run('heroLevel(xpThreshold(20))'),20);
 assert.equal(run('heroLevel(9999999)'),99);
});
test('quest claims reward calories, daily bonus once, and survive reload without duplicates',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};settleDays()');
  const gain=run('claimQuest("walk",100,false)');assert.equal(gain,65);
  assert.equal(run('claimQuest("walk",100,false)'),0);
  assert.equal(run('claimQuest("water",0,false)'),120);
  assert.equal(run('state.rpg.xp'),185);
  assert.equal(run('loadState().rpg.xp'),185);
  assert.equal(run('questXp(QUESTS[0],999999)'),160);
 }finally{run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState()`)}
});
test('missed planned days lose at most 30 XP once, never below zero; unplanned days are free',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:100,days:{"2020-01-01":{selected:["walk","water","run","bike"],claims:{},settled:false}},ledger:[]};settleDays()');
  assert.equal(run('state.rpg.xp'),70);run('settleDays()');assert.equal(run('state.rpg.xp'),70);
  run('state.rpg.xp=5;state.rpg.days["2020-01-02"]={selected:["walk"],claims:{},settled:false};settleDays()');
  assert.equal(run('state.rpg.xp'),0);
 }finally{run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState()`)}
});

test('manual activity validation rejects invalid data and preserves explicit zero calories',()=>{
 for(const data of [
  {name:'',minutes:20,met:5},{name:'Swim',minutes:-1,met:5},{name:'Swim',minutes:20,met:99},
  {name:'Swim',minutes:20,met:5,calories:'NaN'},{name:'Swim',minutes:20,met:5,calories:-5}
 ])assert.throws(()=>run(`activityInput(${JSON.stringify(data)})`));
 assert.equal(run('activityInput({name:"Swim",minutes:20,met:5,calories:"0"}).calories'),0);
 assert.equal(run('activityInput({name:"Swim",minutes:20,met:5,calories:""}).estimated'),true);
});
test('manual activity XP is capped across records and journal labels are escaped',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg.xp=0;state.history=[]');
  assert.equal(run('recordActivity({name:"<img src=x onerror=alert(1)>",minutes:120,met:5,calories:600})'),160);
  assert.equal(run('recordActivity({name:"Swim",minutes:120,met:5,calories:600})'),40);
  assert.equal(run('recordActivity({name:"Dance",minutes:120,met:5,calories:600})'),0);
  assert.equal(run('state.history.length'),3);assert.equal(run('state.rpg.xp'),200);
  assert.ok(element('#historyList').innerHTML.includes('&lt;img'));
  assert.ok(!element('#xpLedger').innerHTML.includes('<img'));
 }finally{run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState()`)}
});
test('step observations replace totals; sources are not added and rewards are idempotent',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.health={steps:{},goal:6000};state.rpg.xp=0');
  run('updateSteps(dateKey(),3000,"manual")');assert.equal(run('rewardSteps()'),30);
  run('updateSteps(dateKey(),5000,"health-connect")');assert.equal(run('stepTotal(healthState().steps[dateKey()])'),5000);
  assert.equal(run('rewardSteps()'),20);
  run('updateSteps(dateKey(),5000,"health-connect")');assert.equal(run('rewardSteps()'),0);
  run('updateSteps(dateKey(),12000,"health-connect")');assert.equal(run('rewardSteps()'),10);
  run('setStepGoal(1000)');assert.equal(run('rewardSteps()'),0);
  assert.equal(run('state.rpg.xp'),60);assert.equal(run('loadState().health.steps[dateKey()].rewarded'),60);
  run('updateSteps(dateKey(),0,"health-connect")');assert.equal(run('rewardSteps()'),0);
 }finally{run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState()`)}
});
test('steps reject stale dates, invalid counts, unknown sources and invalid goals',()=>{
 for(const code of ['updateSteps("2020-01-01",123,"manual")','updateSteps(dateKey(),-1,"manual")','updateSteps(dateKey(),1.5,"manual")','updateSteps(dateKey(),300000,"manual")','updateSteps(dateKey(),50,"sensor")','setStepGoal(0)','setStepGoal(6000.5)'])assert.throws(()=>run(code));
});
test('Health Connect callback handles unavailable bridge and rejected permission without fabricating steps',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.health={steps:{},goal:6000};window.receiveHealthSteps({date:dateKey(),steps:1000})');
  assert.equal(run('Object.keys(state.health.steps).length'),0);
  run('window.AndroidHealth={};window.receiveHealthSteps({error:"Refus"})');assert.equal(element('#healthStatus').textContent,'Refus');
  run('window.receiveHealthSteps({date:dateKey(),steps:4000})');assert.equal(run('stepTotal(state.health.steps[dateKey()])'),4000);
 }finally{run('delete window.AndroidHealth');run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState()`)}
});

test('home lists only daily challenges; opening a challenge does not validate it',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};settleDays();render();openChallenge("water")');
  assert.equal(run('state.rpg.xp'),0);
  assert.equal(element('#challengeTitle').textContent,'La source de vie');
  assert.equal(element('#completeChallenge').hidden,false);
  assert.ok(element('#goalList').innerHTML.includes('data-open-quest="water"'));
  assert.ok(!element('#goalList').innerHTML.includes('data-open-quest="run"'));
  assert.ok(element('#activityCategories').innerHTML.includes('data-open-quest="run"'));
  assert.ok(!element('#goalList').innerHTML.includes('data-claim'));
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('challenge confirmation checks the home row, shows XP, and returns home without a duplicate reward',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};settleDays();openChallenge("water")');
  element('#completeChallenge').listeners.click();
  assert.equal(run('state.rpg.xp'),40);
  assert.equal(element('#questSuccess').open,true);
  assert.equal(element('[data-view="today"]').classList.contains('active'),true);
  assert.ok(element('#goalList').innerHTML.includes('La source de vie : terminé'));
  element('#closeQuestSuccess').listeners.click();assert.equal(element('#questSuccess').open,false);
  run('openChallenge("water")');assert.equal(element('#completeChallenge').hidden,true);
  element('#completeChallenge').listeners.click();assert.equal(run('state.rpg.xp'),40);
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('guided challenge screens expose only their own player and require session completion',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};settleDays();openChallenge("workout")');
  assert.equal(element('#workoutChallenge').hidden,false);assert.equal(element('#kettlebellChallenge').hidden,true);
  assert.equal(element('#completeChallenge').hidden,true);
  element('#completeChallenge').listeners.click();assert.equal(run('state.rpg.xp'),0);
  run('openChallenge("kettlebell")');assert.equal(element('#workoutChallenge').hidden,true);assert.equal(element('#kettlebellChallenge').hidden,false);
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('routes restore challenge details from a deep link and reject unknown screens',()=>{
 try{
  run('window.location={hash:"#challenge/bike"};routeFromHash()');assert.equal(element('#challengeTitle').textContent,'Traverser la vallée');
  run('window.location.hash="#missing";routeFromHash()');assert.equal(element('[data-view="today"]').classList.contains('active'),true);
  run('window.location.hash="#challenge/missing";routeFromHash()');assert.equal(element('[data-view="today"]').classList.contains('active'),true);
 }finally{run('delete window.location;activeQuest=null')}
});
test('category screens have unique IDs and keep steps, manual forms and dojo off the home screen',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
 const home=html.slice(html.indexOf('id="todayView"'),html.indexOf('id="activitiesView"'));
 for(const id of ['manualActivityForm','stepCount','startWorkout','startKettlebellClassic'])assert.ok(!home.includes(`id="${id}"`),id);
 for(const view of ['today','activities','challenge','steps','manual','plan','progress','menu'])assert.ok(html.includes(`data-view="${view}"`),view);
});
