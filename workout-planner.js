const THEMES={legs:'Jambes & fessiers',back:'Dos',arms:'Bras & épaules',abs:'Abdominaux',cardio:'Cardio'};
const STAGES={warm:'Échauffement',strength:'Renforcement',stretch:'Étirements'};
function seededRandom(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let n=Math.imul(seed^seed>>>15,1|seed);n^=n+Math.imul(n^n>>>7,61|n);return ((n^n>>>14)>>>0)/4294967296}}
function shuffled(items,random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
const themeCache=new Map();
// Civil dates use UTC arithmetic to stay independent of daylight saving changes.
function dayNumber(date){return Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)}
function dailyThemes(date,seed){
  const day=dayNumber(date),key=seed+':'+day;
  if(themeCache.has(key))return themeCache.get(key);
  let previous=[];
  for(let d=0;d<=day;d++){
    const k=seed+':'+d;
    if(themeCache.has(k)){previous=themeCache.get(k);continue}
    previous=shuffled(Object.keys(THEMES).filter(t=>!previous.includes(t)),seededRandom(seed^d)).slice(0,2);
    themeCache.set(k,previous);
  }
  return previous;
}
function pickMovements(stage,theme,count,random){
  // Cardio recovery uses the lower-body stretches; retain balanced unilateral pairs.
  const target=stage==='stretch'&&theme==='cardio'?'legs':theme;
  const pool=CATALOG.filter(e=>(e.stage===stage&&e.themes.includes(target))||(stage==='stretch'&&target==='abs'&&e.id==='side_bend'));
  const units=pool.filter(e=>!e.pair||e.id.endsWith('_r')).map(e=>e.pair?pool.filter(x=>x.pair===e.pair):[e]);
  const result=[];
  while(result.length<count){
    for(const unit of shuffled(units,random)){
      if(unit.length<=count-result.length)result.push(...unit);
      if(result.length===count)break;
    }
  }
  return result.map(e=>e.id);
}
function programForDate(date=new Date(),duration=15,seed=1){
  const themes=dailyThemes(date,seed),random=seededRandom(seed^dayNumber(date)^0x51f23),strength=Number(duration)===20?7:4;
  const blocks=['warm','strength','stretch'].flatMap(stage=>themes.map(theme=>({stage,theme,label:`${STAGES[stage]} · ${THEMES[theme]}`,ids:pickMovements(stage,theme,stage==='strength'?strength:2,random)})));
  return {title:themes.map(t=>THEMES[t]).join(' + '),focus:'2 THÈMES · 40 / 10 / 30',themes,blocks,ids:blocks.flatMap(b=>b.ids),met:5.5};
}
function timelineForProgram(program,exercises){
  const timeline=[{type:'prep',seconds:10,exercise:exercises[program.ids[0]],index:-1,label:program.blocks[0].label}];
  let index=0;
  program.blocks.forEach((block,b)=>block.ids.forEach((id,i)=>{
    timeline.push({type:'work',seconds:40,exercise:exercises[id],index:index++,label:block.label});
    const next=block.ids[i+1],nextBlock=program.blocks[b+1];
    if(next)timeline.push({type:'rest',seconds:10,exercise:exercises[next],index,label:block.label});
    else if(nextBlock)timeline.push({type:'rest',seconds:30,transition:true,exercise:exercises[nextBlock.ids[0]],index,label:nextBlock.label});
  }));
  return timeline;
}
function exerciseIllustration(exercise){
  if(!exercise.image)return svg(exercise.pose);
  return `<svg class="exercise-photo" viewBox="16 ${exercise.y} 72 ${exercise.imageHeight||72}" role="img" aria-label="${exercise.name}"><image href="${exercise.image}" width="376" height="814.6667"/></svg>`;
}
