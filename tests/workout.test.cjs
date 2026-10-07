const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const elements=new Map();
function element(id){if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',value:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},querySelector:element,showModal(){this.open=true},close(){this.open=false}});return elements.get(id)}
const storage=new Map();
const context=vm.createContext({console,crypto:require('node:crypto').webcrypto,Date,Math,Set,Map,Uint32Array,
  localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
  document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){}},
  window:{addEventListener(){}},navigator:{},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},scrollTo(){}});
for(const match of fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g))context[match[1]]=element('#'+match[1]);
for(const file of ['exercise-catalog.js','workout-planner.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
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
