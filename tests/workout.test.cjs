const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const elements=new Map();
function element(id){
 if(['#sleepWake','#sleepHours','#sleepAdvice','#sleepSettingsForm'].includes(id))return null;
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
  assert.equal(run('claimQuest("water",0,false)'),40);
  assert.equal(run('state.rpg.days[dateKey()].bonus'),false);
  assert.equal(run('claimQuest("daily-strength",undefined,false)'),105);
  assert.equal(run('state.rpg.xp'),210);
  assert.equal(run('loadState().rpg.xp'),210);
  assert.equal(run('questXp(QUESTS.find(q=>q.id==="workout"),999999)'),160);
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
  assert.equal(run('state.rpg.xp'),105);assert.equal(run('loadState().health.steps[dateKey()].rewarded'),60);
  run('updateSteps(dateKey(),0,"health-connect")');assert.equal(run('rewardSteps()'),0);
 }finally{run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState()`)}
});
test('walking validates above 6000 steps, persists, and never duplicates XP or invents activity',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.health={steps:{},goal:1000};state.rpg={xp:0,days:{},ledger:[]};state.history=[];settleDays()');
  for(const count of [5999,6000]){run(`updateSteps(dateKey(),${count},"manual")`);assert.equal(run('!!state.rpg.days[dateKey()].claims.walk'),false)}
  run('updateSteps(dateKey(),6001,"manual")');
  assert.equal(run('state.rpg.xp'),45);assert.equal(run('state.history.length'),0);
  assert.equal(run('state.rpg.days[dateKey()].claims.walk.calories'),0);
  assert.equal(run('state.rpg.days[dateKey()].claims.walk.minutes'),0);
  assert.equal(run('loadState().rpg.days[dateKey()].claims.walk.calorieSource'),'steps');
  run('window.AndroidHealth={};window.receiveHealthSteps({date:dateKey(),steps:9000});renderHealth();setStepGoal(30000);updateSteps(dateKey(),0,"manual")');
  assert.equal(run('state.rpg.xp'),45);assert.equal(run('claimQuest("walk",100,true,30)'),0);
  run('openChallenge("walk")');assert.equal(element('#challengeDurationSection').hidden,true);
  assert.equal(element('#challengeTarget').textContent,'Plus de 6 000 pas');
  run('state.rpg={xp:0,days:{},ledger:[]};state.health.steps={[dateKey()]:{manual:6001,source:"manual"}};renderHealth();renderHealth()');
  assert.equal(run('state.rpg.xp'),45);
  run('state.health.steps={};state.rpg={xp:0,days:{},ledger:[]};settleDays();claimQuest("walk",0,false,20)');
  const xp=run('state.rpg.xp');run('updateSteps(dateKey(),7000,"health-connect")');assert.equal(run('state.rpg.xp'),xp);
 }finally{run(`delete window.AndroidHealth;activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
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
  assert.equal(element('#challengeTitle').textContent,run('questForId("water").name'));
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
  assert.ok(element('#goalList').innerHTML.includes(run('questForId("water").name')+' : terminé'));
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
  run('window.location={hash:"#challenge/bike"};routeFromHash()');assert.equal(element('#challengeTitle').textContent,run('questForId("bike").name'));
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

test('slower XP curve takes several normal days per level and increases each level cost',()=>{
 assert.equal(run('xpThreshold(2)'),550);
 assert.equal(run('heroLevel(3*180)'),1);assert.equal(run('heroLevel(4*180)'),2);
 assert.equal(run('xpThreshold(20)'),27550);
 let previous=0;
 for(let level=2;level<=99;level++){
  const cost=run(`xpThreshold(${level})-xpThreshold(${level-1})`);assert.ok(cost>previous);previous=cost;
 }
 const before=run('state.rpg.xp');run('heroLevel()');assert.equal(run('state.rpg.xp'),before);
});
test('XP animation splits exactly at level thresholds and clamps the maximum',()=>{
 const segments=JSON.parse(run('JSON.stringify(xpAnimationSegments(500,1250))'));
 assert.deepEqual(segments,[{from:500,to:550,level:1,levelUp:true},{from:550,to:1200,level:2,levelUp:true},{from:1200,to:1250,level:3,levelUp:false}]);
 assert.equal(run('xpAnimationSegments(xpThreshold(99),xpThreshold(99)+1000).length'),0);
 assert.equal(run('xpAnimationSegments(0,0).length'),0);
});
test('animated XP fills before celebrating a level, continues after it, and never changes saved XP',()=>{
 const saved=run('JSON.stringify(state)'),originalTimeout=context.setTimeout,originalClear=context.clearTimeout;
 const frames=new Map(),timers=new Map();let next=1;
 context.window.requestAnimationFrame=cb=>{const id=next++;frames.set(id,cb);return id};
 context.window.cancelAnimationFrame=id=>frames.delete(id);
 context.setTimeout=cb=>{const id=next++;timers.set(id,cb);return id};context.clearTimeout=id=>timers.delete(id);
 const frame=time=>{const [id,cb]=frames.entries().next().value;frames.delete(id);cb(time)};
 try{
  run('state.rpg.xp=610;saveState();animateXpReward("quest",500,610)');
  assert.equal(element('#questAnimatedLevel').textContent,'LVL 01');
  frame(0);frame(550);assert.ok(element('#questAnimatedXp').value>500/550*100);assert.ok(element('#questAnimatedXp').value<100);
  frame(1100);assert.equal(element('#questAnimatedXp').value,100);
  assert.equal(element('#questLevelCelebration').hidden,false);assert.ok(element('#questLevelCelebration').textContent.includes('LVL 2'));
  const [timerId,cb]=timers.entries().next().value;timers.delete(timerId);cb();
  assert.equal(element('#questAnimatedLevel').textContent,'LVL 02');
  frame(2000);frame(3100);
  assert.equal(element('#questAnimatedXpLabel').textContent,'60 / 650 XP');
  assert.equal(run('xpAnimation'),null);assert.equal(run('loadState().rpg.xp'),610);
 }finally{
  run('stopXpAnimation()');delete context.window.requestAnimationFrame;delete context.window.cancelAnimationFrame;
  context.setTimeout=originalTimeout;context.clearTimeout=originalClear;
  run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`);
 }
});
test('reduced motion displays the level result immediately and closing cancels pending frames',()=>{
 const saved=run('JSON.stringify(state)');const frames=new Map();let next=1;
 context.window.requestAnimationFrame=cb=>{const id=next++;frames.set(id,cb);return id};
 context.window.cancelAnimationFrame=id=>frames.delete(id);
 context.window.matchMedia=()=>({matches:true});
 try{
  run('state.rpg.xp=600;animateXpReward("finish",500,600)');assert.equal(frames.size,0);
  assert.equal(element('#finishAnimatedLevel').textContent,'LVL 02');assert.equal(element('#finishLevelCelebration').hidden,false);
  context.window.matchMedia=()=>({matches:false});
  run('animateXpReward("quest",500,600)');assert.equal(frames.size,1);
  run('returnFromVictory()');assert.equal(frames.size,0);assert.equal(run('xpAnimation'),null);
  assert.equal(element('#heroLevel').textContent,'02');
 }finally{
  run('stopXpAnimation()');delete context.window.requestAnimationFrame;delete context.window.cancelAnimationFrame;delete context.window.matchMedia;
  run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`);
 }
});

test('bedtime is permanent, has no calorie reward, and cannot bypass its declaration form',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('render();openChallenge("bedtime")');
  assert.ok(element('#goalList').innerHTML.includes('data-open-quest="bedtime"'));
  assert.equal(element('#bedtimeChallenge').hidden,false);assert.equal(element('#completeChallenge').hidden,true);
  assert.equal(run('questCalories(QUESTS.find(q=>q.id==="bedtime"))'),0);
  assert.equal(run('claimQuest("bedtime")'),0);
  assert.equal(element('#challengeTarget').textContent,'Au plus tard à minuit');
  assert.ok(!fs.readFileSync('index.html','utf8').includes('id="sleepWake"'));
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));delete state.sleepSettings;saveState();render()`)}
});
test('bedtime validates through midnight independently of old wake settings',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.sleepSettings={wake:"07:00",hours:8}');
  for(const [actual,success,late] of [
   ['2026-11-07T22:59',true,false],['2026-11-07T23:00',true,false],['2026-11-07T23:59',true,false],
   ['2026-11-08T00:00',true,false],['2026-11-08T00:01',false,true]
  ]){
   const result=run(`evaluateBedtime("2026-11-07",${JSON.stringify(actual)},new Date("2026-11-08T10:00"))`);
   assert.equal(result.success,success,actual);assert.equal(result.late,late,actual);
  }
  assert.throws(()=>run('evaluateBedtime("2026-11-07","2026-11-08T11:00",new Date("2026-11-08T10:00"))'));
  assert.throws(()=>run('evaluateBedtime("2026-11-06","2026-11-07T01:00",new Date("2026-11-08T10:00"))'));
 }finally{run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));delete state.sleepSettings;saveState()`)}
});
test('an undeclared bedtime never loses XP during daily settlement',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:100,days:{"2020-01-01":{selected:["bedtime"],claims:{},bonus:false,settled:false}},ledger:[]};settleDays();settleDays()');
  assert.equal(run('state.rpg.xp'),100);assert.equal(run('state.rpg.ledger.length'),0);
 }finally{run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('late bedtime is charged once for the correct night and cannot make XP negative',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:5,days:{},ledger:[]};state.sleepSettings={wake:"07:00",hours:8};settleDays()');
  const result=run('(()=>{const now=new Date();now.setHours(11,0,0,0);return recordBedtime(sleepDates(now).yesterday,dateKey(now)+"T00:01",now)})()');
  assert.equal(result,-5);assert.equal(run('state.rpg.xp'),0);
  assert.equal(run('state.rpg.days[sleepDates().yesterday].bedtime.late'),true);
  assert.throws(()=>run('(()=>{const now=new Date();now.setHours(11,0,0,0);recordBedtime(sleepDates(now).yesterday,dateKey(now)+"T00:01",now)})()'));
  run('settleDays()');assert.equal(run('state.rpg.xp'),0);
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));delete state.sleepSettings;saveState();render()`)}
});
test('on-time bedtime awards forty XP once, with no impact on the ordinary daily bonus',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};state.sleepSettings={wake:"07:00",hours:8};settleDays()');
  const result=run('(()=>{const now=new Date();now.setHours(11,0,0,0);const night=sleepDates(now).yesterday;return recordBedtime(night,night+"T23:00",now)})()');
  assert.equal(result,40);assert.equal(run('state.rpg.xp'),40);
  assert.equal(run('state.rpg.days[sleepDates().yesterday].claims.bedtime.calories'),0);
  assert.equal(run('state.rpg.days[dateKey()].bonus'),false);
  assert.ok(!run('state.rpg.days[dateKey()].selected.includes("bedtime")'));
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));delete state.sleepSettings;saveState();render()`)}
});

test('free challenge duration increases calories and XP, keeping minimum and maximum checks',()=>{
 for(const id of ['walk','run','bike','shadowboxing']){
  const q=run(`QUESTS.find(q=>q.id==="${id}")`);
  const single=run(`questCalories(QUESTS.find(q=>q.id==="${id}"))`);
  const doubled=run(`questCalories(QUESTS.find(q=>q.id==="${id}"),${q.minutes*2})`);
  assert.ok(Math.abs(doubled-2*single)<=1,id);
  const xp=run(`questXp(QUESTS.find(q=>q.id==="${id}"))`);
  assert.ok(run(`questXp(QUESTS.find(q=>q.id==="${id}"),undefined,${q.minutes*2})`)>xp,id);
  assert.throws(()=>run(`questMinutes(QUESTS.find(q=>q.id==="${id}"),${q.minutes-1})`));
  assert.throws(()=>run(`questMinutes(QUESTS.find(q=>q.id==="${id}"),1441)`));
  assert.ok(run(`questXp(QUESTS.find(q=>q.id==="${id}"),undefined,1440)` )<=220);
 }
 assert.equal(run('questMinutes(QUESTS.find(q=>q.id==="walk"),20.5)'),20.5);
 assert.throws(()=>run('questMinutes(QUESTS.find(q=>q.id==="walk"),NaN)'));
});
test('duration preview recalculates before validation and blocks shorter-than-minimum input',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};settleDays();openChallenge("shadowboxing")');
  assert.equal(element('#challengeDurationSection').hidden,false);
  element('#challengeDuration').value='30';element('#challengeDuration').listeners.input();
  assert.equal(element('#challengeTarget').textContent,'30 min');
  assert.equal(element('#challengeXp').textContent,run('"+"+questXp(QUESTS.find(q=>q.id==="shadowboxing"),undefined,30)+" XP"'));
  element('#challengeDuration').value='14';element('#challengeDuration').listeners.input();
  assert.equal(element('#completeChallenge').disabled,true);
  element('#completeChallenge').listeners.click();assert.equal(run('state.rpg.xp'),0);
  assert.equal(run('state.rpg.days[dateKey()].claims.shadowboxing'),undefined);
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('free challenge claim saves its duration and reward once, including activity counters and reload',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};state.history=[];settleDays();openChallenge("walk")');
  element('#challengeDuration').value='40';element('#challengeDuration').listeners.input();element('#completeChallenge').listeners.click();
  assert.equal(run('state.rpg.days[dateKey()].claims.walk.minutes'),40);
  assert.equal(run('state.history[0].minutes'),40);
  assert.equal(run('activityEnergyToday()'),run('questCalories(QUESTS.find(q=>q.id==="walk"),40)'));
  assert.equal(run('state.rpg.xp'),run('questXp(QUESTS.find(q=>q.id==="walk"),undefined,40)'));
  assert.equal(run('loadState().rpg.days[dateKey()].claims.walk.minutes'),40);
  assert.ok(element('#goalList').innerHTML.includes('40 min réalisées'));
  const xp=run('state.rpg.xp');assert.equal(run('claimQuest("walk",undefined,true,80)'),0);assert.equal(run('state.rpg.xp'),xp);
  run('openChallenge("walk")');assert.equal(element('#challengeDuration').disabled,true);assert.equal(element('#challengeDuration').value,40);
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('duration editor stays hidden for guided and non-sport challenges',()=>{
 for(const id of ['workout','kettlebell','water','bedtime','nutrition']){
  run(`openChallenge("${id}")`);assert.equal(element('#challengeDurationSection').hidden,true,id);
 }
 run('activeQuest=null');
});

test('nutrition can be validated and cleared directly, persists its checkmark, and never changes XP',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:100,days:{},ledger:[]};settleDays();openChallenge("nutrition")');
  assert.equal(element('#challengeMetrics').hidden,true);assert.equal(element('#validateNutrition').disabled,false);
  element('#validateNutrition').listeners.click();
  assert.equal(run('state.rpg.xp'),100);assert.equal(run('loadState().rpg.days[dateKey()].nutrition.completed'),true);
  assert.ok(element('#goalList').innerHTML.includes('Bien manger : terminé'));
  run('openChallenge("nutrition")');assert.equal(element('#validateNutrition').disabled,true);
  element('#clearNutrition').listeners.click();
  assert.equal(run('state.rpg.xp'),100);assert.equal(run('loadState().rpg.days[dateKey()].nutrition.completed'),false);
  assert.ok(!element('#goalList').innerHTML.includes('Bien manger : terminé'));
  assert.equal(run('state.rpg.ledger.length'),0);
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('nutrition screen has direct buttons and no calorie entry or counter',()=>{
 const html=fs.readFileSync('index.html','utf8');const start=html.indexOf('<section id="nutritionChallenge"');const screen=html.slice(start,html.indexOf('</section>',start));
 assert.ok(screen.includes('id="validateNutrition"'));assert.ok(screen.includes('id="clearNutrition"'));
 assert.ok(!screen.includes('<input'));assert.ok(!screen.includes('kcal'));assert.ok(!screen.includes('compteur'));
});

test('web installations explain Health Connect unavailability without pretending to connect',()=>{
 run('delete window.AndroidHealth;renderHealth();syncHealth()');
 assert.ok(element('#healthConnection').textContent.includes('raccourci'));
 assert.ok(element('#healthStatus').textContent.includes('version web'));
 assert.equal(element('#disconnectHealth').hidden,true);
 assert.equal(run('healthSyncPending'),false);
});
test('empty Health Connect aggregate preserves an existing manual step total',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.health={steps:{},goal:6000};updateSteps(dateKey(),4500,"manual");window.AndroidHealth={syncSteps(){}};window.receiveHealthSteps({date:dateKey(),steps:0,hasData:false,enabled:true})');
  assert.equal(run('stepTotal(state.health.steps[dateKey()])'),4500);
  assert.equal(run('state.health.steps[dateKey()].source'),'manual');
  assert.ok(element('#healthStatus').textContent.includes('ne contient pas encore'));
  run('window.receiveHealthSteps({date:dateKey(),steps:0,hasData:true,enabled:true})');
  assert.equal(run('stepTotal(state.health.steps[dateKey()])'),0);
 }finally{run('finishHealthRequest();delete window.AndroidHealth;delete window.healthConnectionState');run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('Health Connect requests wait for one response, recover from errors and expose disconnection',()=>{
 const originalTimeout=context.setTimeout,originalClear=context.clearTimeout;const timers=new Map();let next=1,calls=0;
 context.setTimeout=cb=>{const id=next++;timers.set(id,cb);return id};context.clearTimeout=id=>timers.delete(id);
 context.window.AndroidHealth={syncSteps(){calls++}};
 try{
  run('syncHealth();syncHealth()');assert.equal(calls,1);assert.equal(run('healthSyncPending'),true);
  assert.equal(element('#syncHealth').disabled,true);
  run('window.receiveHealthSteps({error:"Autorisation refusée",enabled:false})');
  assert.equal(run('healthSyncPending'),false);assert.equal(element('#syncHealth').disabled,false);assert.equal(timers.size,0);
  assert.equal(element('#healthStatus').textContent,'Autorisation refusée');
  run('window.receiveHealthSteps({status:"disconnected",enabled:false})');assert.ok(element('#healthConnection').textContent.includes('désactivée'));
  run('syncHealth()');const [id,cb]=timers.entries().next().value;timers.delete(id);cb();
  assert.equal(run('healthSyncPending'),false);assert.ok(element('#healthStatus').textContent.includes('Aucune réponse'));
 }finally{
  run('finishHealthRequest();delete window.AndroidHealth;delete window.healthConnectionState');context.setTimeout=originalTimeout;context.clearTimeout=originalClear;run('renderHealth()');
 }
});
test('Android bridge exceptions release the sync button for retry',()=>{
 context.window.AndroidHealth={syncSteps(){throw Error('Bridge failed')}};
 try{run('syncHealth()');assert.equal(run('healthSyncPending'),false);assert.equal(element('#syncHealth').disabled,false);assert.ok(element('#healthStatus').textContent.includes('a échoué'))}
 finally{run('finishHealthRequest();delete window.AndroidHealth;renderHealth()')}
});

test('site updates revalidate network responses and retain offline navigation fallback',async()=>{
 const handlers={},cacheWrites=[];let offline=false,revalidation;
 const response={ok:true,clone(){return this}};
 const cached={cached:true};
 const sw=vm.createContext({
  self:{addEventListener(type,handler){handlers[type]=handler}},
  fetch:async(request,options)=>{revalidation=options.cache;if(offline)throw Error('offline');return response},
  caches:{open:async()=>({put:async(request,value)=>cacheWrites.push(value)}),match:async key=>key==='./'?cached:undefined},
  Response:{error:()=>({error:true})}
 });
 vm.runInContext(fs.readFileSync('sw.js','utf8'),sw);
 let pending;
 handlers.fetch({request:{method:'GET',mode:'navigate'},respondWith(value){pending=value}});
 assert.equal(await pending,response);assert.equal(revalidation,'no-cache');
 await Promise.resolve();assert.equal(cacheWrites.length,1);
 offline=true;
 handlers.fetch({request:{method:'GET',mode:'navigate'},respondWith(value){pending=value}});
 assert.equal(await pending,cached);
});

test('FitXR personal reference uses 456 kcal for 45 minutes and preserves the classic alternative',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.shadowBoxingMode="fitxr";state.weight=70');
  assert.equal(run('questCalories(QUESTS.find(q=>q.id==="shadowboxing"),45)'),456);
  assert.equal(run('questXp(QUESTS.find(q=>q.id==="shadowboxing"),456,45)'),211);
  assert.equal(run('questCalories(QUESTS.find(q=>q.id==="shadowboxing"),90)'),912);
  assert.equal(run('questXp(QUESTS.find(q=>q.id==="shadowboxing"),912,90)'),220);
  run('state.shadowBoxingMode="classic"');
  assert.equal(run('questCalories(QUESTS.find(q=>q.id==="shadowboxing"),45)'),276);
 }finally{run(`delete state.shadowBoxingMode;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('FitXR declared calories replace the reference and persist one complete session without duplicate squat calories',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};state.history=[];state.shadowBoxingMode="fitxr";settleDays();openChallenge("shadowboxing")');
  element('#challengeDuration').value='45';element('#challengeDuration').listeners.input();
  assert.equal(element('#challengeCalories').textContent,'≈ 456 kcal');assert.equal(element('#challengeXp').textContent,'+211 XP');
  element('#shadowCalories').value='400';element('#shadowCalories').listeners.input();
  assert.equal(element('#challengeCalories').textContent,'≈ 400 kcal');assert.equal(element('#challengeXp').textContent,'+200 XP');
  element('#challengeDuration').value='60';element('#challengeDuration').listeners.input();assert.equal(element('#challengeCalories').textContent,'≈ 400 kcal');
  element('#challengeDuration').value='45';element('#shadowCalories').value='456';element('#shadowCalories').listeners.input();
  element('#completeChallenge').listeners.click();
  assert.equal(run('state.rpg.xp'),211);assert.equal(run('state.history.length'),1);
  assert.equal(run('state.history[0].calories'),456);assert.equal(run('state.history[0].calorieSource'),'fitxr-declared');
  assert.equal(run('activityEnergyToday()'),456);assert.equal(run('loadState().rpg.days[dateKey()].claims.shadowboxing.calories'),456);
  run('state.weight=99;openChallenge("shadowboxing")');assert.equal(element('#challengeCalories').textContent,'≈ 456 kcal');
 }finally{run(`activeQuest=null;delete state.shadowBoxingMode;delete questCalorieDrafts[dateKey()+":shadowboxing"];Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('invalid declared activity calories are rejected before XP or history are modified',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};state.history=[];settleDays()');
  for(const value of ['NaN',-1,1.5,10001])assert.throws(()=>run(`claimQuest("shadowboxing",${JSON.stringify(value)},true,45)`));
  assert.equal(run('state.rpg.xp'),0);assert.equal(run('state.history.length'),0);
  assert.equal(run('questCalorieDetails(QUESTS.find(q=>q.id==="shadowboxing"),45,"0").calories'),0);
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});

test('daily mini-challenge is drawn once per day, survives reload and redraws only for a new day',()=>{
 const saved=run('JSON.stringify(state)'),originalDate=context.Date,originalCrypto=context.crypto;
 let draws=0;const base=new Date();base.setHours(12,0,0,0);let current=base.getTime();
 context.Date=class extends Date{constructor(...args){super(...(args.length?args:[current]))}};
 context.crypto={getRandomValues(array){array[0]=draws++;return array}};
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};settleDays()');
  const first=run('dateKey()');assert.equal(run('questForId("daily-strength").name'),'10 pompes');
  run('settleDays();settleDays()');assert.equal(draws,1);
  assert.equal(run('loadState().rpg.days[dateKey()].miniChallenge'),'pushups');
  assert.equal(run('state.rpg.days[dateKey()].selected.filter(id=>id==="daily-strength").length'),1);
  const next=new Date(base);next.setDate(next.getDate()+1);current=next.getTime();run('settleDays()');
  assert.equal(draws,2);assert.equal(run('questForId("daily-strength").name'),'20 squats');
  assert.equal(run(`state.rpg.days[${JSON.stringify(first)}].miniChallenge`),'pushups');
 }finally{context.Date=originalDate;context.crypto=originalCrypto;run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('mandatory mini-challenge cannot be removed and validates its repetitions only once',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:0,days:{},ledger:[]};state.history=[];settleDays();openChallenge("daily-strength")');
  const name=run('questForId("daily-strength").name'),reps=run('questForId("daily-strength").reps');
  assert.ok([10,20].includes(reps));assert.equal(element('#challengeTitle').textContent,name);
  assert.equal(element('#challengeTarget').textContent,`${reps} répétitions`);
  assert.equal(element('#challengeCalories').textContent,'Non estimées');
  assert.ok(element('#goalList').innerHTML.includes('data-open-quest="daily-strength"'));
  element('#questChoices').listeners.change({target:{dataset:{selectQuest:'daily-strength'},checked:false}});
  assert.ok(run('state.rpg.days[dateKey()].selected.includes("daily-strength")'));
  element('#completeChallenge').listeners.click();
  assert.equal(run('state.rpg.xp'),25);assert.equal(run('state.rpg.days[dateKey()].claims["daily-strength"].reps'),reps);
  assert.equal(run('state.history[0].title'),name);assert.equal(run('state.history[0].calories'),0);
  assert.equal(run('claimQuest("daily-strength")'),0);assert.equal(run('state.rpg.xp'),25);
  assert.ok(element('#goalList').innerHTML.includes(`${name} : terminé`));
 }finally{run(`activeQuest=null;Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
test('missing an assigned mini-challenge uses the ordinary penalty without adding challenges retroactively',()=>{
 const saved=run('JSON.stringify(state)');
 try{
  run('state.rpg={xp:100,days:{"2020-01-01":{selected:["daily-strength"],claims:{},settled:false},"2020-01-02":{selected:[],claims:{},settled:false}},ledger:[]};settleDays();settleDays()');
  assert.equal(run('state.rpg.xp'),90);
  assert.equal(run('state.rpg.days["2020-01-02"].selected.length'),0);
 }finally{run(`Object.assign(state,JSON.parse(${JSON.stringify(saved)}));saveState();render()`)}
});
