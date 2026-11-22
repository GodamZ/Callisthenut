// Corrections are stored with the day so that undo/redo survives a reload.
function syncFreeActivities(day){
 day.freeActivities??={};
 for(const h of state.history.filter(h=>h.date===dateKey()&&h.source==='manual')){
  const id=`free:${h.id}`;
  day.freeActivities[id]??={name:h.title};
  day.claims[id]??={xp:h.xp||0,calories:h.calories,minutes:h.minutes};
 }
}
function visibleDailyQuests(day){return QUESTS.filter(q=>q.permanent||day.selected.includes(q.id))}
function correctionButton(id,name,done){return `<button type="button" class="quest-toggle" data-toggle-quest="${escapeHtml(id)}" role="checkbox" aria-checked="${done}" aria-label="${done?'Décocher':'Cocher'} ${escapeHtml(name)}">${done?'✓':''}</button>`}
function renderFreeActivities(day){
 return Object.entries(day.freeActivities||{}).map(([id,e])=>{
  const done=!!day.claims[id],record=day.claims[id]||day.undone?.[id]?.claim;
  return `<div class="quest-line">${correctionButton(id,e.name,done)}<div class="daily-challenge ${done?'completed':''}"><span class="daily-icon">✦</span><span class="daily-text"><strong>${escapeHtml(e.name)}</strong><small>Activité libre · ${record?.minutes||0} min · ≈ ${record?.calories||0} kcal</small></span><span class="daily-xp">${done?'ACCOMPLI':'À VALIDER'}</span></div></div>`;
 }).join('');
}
function toggleDailyQuest(id){
 settleDays();stopXpAnimation();
 const day=state.rpg.days[dateKey()];syncFreeActivities(day);day.undone??={};
 const q=questForId(id),name=q?.name||day.freeActivities[id]?.name;
 if(!name)return 0;
 const before=state.rpg.xp;
 if(day.claims[id]){
  const claim=day.claims[id];
  const history=state.history.filter(h=>h.date===dateKey()&&(h.questId===id||`free:${h.id}`===id||
   (!h.questId&&!h.source&&q&&(h.title===q.name||h.title===q.detail||h.title===`${q.name} · ${claim.minutes} min`))));
  const removed=Math.min(state.rpg.xp,claim.awardedXp??claim.xp??0);
  day.undone[id]={claim,history,removed,waterGlasses:day.waterGlasses,bedtime:day.bedtime,nutrition:day.nutrition};
  state.history=state.history.filter(h=>!history.includes(h));
  state.rpg.xp-=removed;delete day.claims[id];
  if(id==='water')day.waterGlasses=[];
  if(id==='bedtime')delete day.bedtime;
  if(id==='nutrition')day.nutrition={completed:false};
  if(day.bonus&&day.selected.includes(id)&&!q?.permanent){
   const bonus=Math.min(state.rpg.xp,day.bonusXp??80);
   state.rpg.xp-=bonus;day.bonus=false;day.bonusXp=0;day.bonusRefund=bonus;
  }
 }else if(day.undone[id]){
  const saved=day.undone[id],gain=Math.min(saved.removed,xpThreshold(99)-state.rpg.xp);
  state.rpg.xp+=gain;day.claims[id]={...saved.claim,awardedXp:gain};
  state.history.push(...saved.history);delete day.undone[id];
  if(id==='water')day.waterGlasses=saved.waterGlasses;
  if(id==='bedtime')day.bedtime=saved.bedtime;
  if(id==='nutrition')day.nutrition={completed:true};
  if(!day.bonus&&day.selected.filter(key=>!questForId(key)?.permanent).every(key=>day.claims[key])){
   day.bonusXp=Math.min(day.bonusRefund??80,xpThreshold(99)-state.rpg.xp);state.rpg.xp+=day.bonusXp;day.bonus=true;delete day.bonusRefund;
  }
 }else{
  if(id==='nutrition'){setNutritionCompleted(true);return 0}
  if(id==='bedtime'){recordBedtimeNow();return 0}
  if(q?.mandatory||id==='water')return claimQuest(id,0,false);
  openChallenge(id);return 0;
 }
 const change=state.rpg.xp-before;
 state.goals[dateKey()]=Object.keys(day.claims);
 state.rpg.ledger.push({day:dateKey(),xp:change,label:`Correction · ${name}`});
 saveState();render();return change;
}
